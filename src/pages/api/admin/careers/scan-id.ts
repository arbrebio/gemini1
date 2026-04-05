export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

function getSupabase() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

function getAnthropicClient() {
  const key = import.meta.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY not configured');
  return new Anthropic({ apiKey: key });
}

// POST — upload ID card image + extract fields via Claude vision
export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const side = (formData.get('side') as string) || 'front'; // 'front' | 'back'
    const employeeId = formData.get('employee_id') as string | null;

    if (!file || file.size === 0) {
      return json({ error: 'No image provided' }, 400);
    }
    if (file.size > 10 * 1024 * 1024) {
      return json({ error: 'Image too large (max 10 MB)' }, 400);
    }

    // 1. Convert to buffer + base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const mimeType = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

    // 2. Upload to Supabase Storage (private bucket: employee-ids)
    const supabase = getSupabase();
    const ext = file.name.split('.').pop() || 'jpg';
    const storagePath = `${employeeId || 'new'}/${side}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('employee-ids')
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    // Get signed URL (private — valid 10 years)
    let imageUrl: string | null = null;
    if (!uploadError) {
      const { data: signedData } = await supabase.storage
        .from('employee-ids')
        .createSignedUrl(storagePath, 60 * 60 * 24 * 365 * 10);
      imageUrl = signedData?.signedUrl || null;

      // If employee_id provided, update their record immediately
      if (employeeId && imageUrl) {
        const column = side === 'back' ? 'id_card_back_url' : 'id_card_front_url';
        await supabase.from('career_employees').update({ [column]: imageUrl }).eq('id', employeeId);
      }
    }

    // 3. Call Claude vision to extract ID card data
    const anthropic = getAnthropicClient();

    const prompt = side === 'front'
      ? `This is the FRONT of a national ID card or passport. Extract all visible text and return a JSON object with ONLY these keys (use null for any field not visible or not applicable):
{
  "first_name": string | null,
  "middle_name": string | null,
  "last_name": string | null,
  "birth_date": "YYYY-MM-DD" | null,
  "gender": "M" | "F" | null,
  "nationality": string | null,
  "id_number": string | null,
  "id_card_expiry": "YYYY-MM-DD" | null,
  "address": string | null,
  "city": string | null,
  "country": string | null
}
Return ONLY the raw JSON object, no markdown, no explanation.`
      : `This is the BACK of a national ID card. Extract any additional information not typically on the front and return a JSON object with ONLY these keys (use null for any field not visible):
{
  "address": string | null,
  "city": string | null,
  "id_number": string | null,
  "id_card_expiry": "YYYY-MM-DD" | null,
  "additional_info": string | null
}
Return ONLY the raw JSON object, no markdown, no explanation.`;

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: base64,
              },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
    });

    // 4. Parse Claude's response
    const rawText = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    let fields: Record<string, any> = {};
    try {
      // Strip any accidental markdown code fences
      const cleaned = rawText.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
      fields = JSON.parse(cleaned);
    } catch {
      // Claude returned something unexpected — still return the URL at least
      fields = {};
    }

    // Clean up null strings
    for (const key of Object.keys(fields)) {
      if (fields[key] === 'null' || fields[key] === '') fields[key] = null;
    }

    return json({
      success: true,
      side,
      image_url: imageUrl,
      storage_error: uploadError?.message || null,
      fields,
    }, 200);

  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

function json(body: any, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
