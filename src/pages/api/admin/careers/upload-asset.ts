export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role not configured');
  return createClient(url, key);
}

function json(body: any, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * POST /api/admin/careers/upload-asset
 * FormData fields:
 *   file        — the file to upload (required)
 *   type        — 'photo' | 'contract' (required)
 *   employee_id — UUID of the employee record to update (optional)
 *
 * Returns: { url: string }
 * - photo    → public URL from employee-photos bucket
 * - contract → 10-year signed URL from career-documents bucket
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || '';
    const employeeId = (formData.get('employee_id') as string) || null;

    if (!file || file.size === 0) return json({ error: 'No file provided' }, 400);
    if (file.size > 10 * 1024 * 1024) return json({ error: 'File too large (max 10 MB)' }, 400);
    if (!['photo', 'contract'].includes(type)) return json({ error: 'type must be "photo" or "contract"' }, 400);

    const supabase = getSupabase();
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (type === 'photo') {
      const path = `employees/${employeeId || 'new'}/${stamp}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('employee-photos')
        .upload(path, buffer, { contentType: file.type, upsert: true });
      if (uploadErr) throw uploadErr;

      const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/employee-photos/${path}`;

      if (employeeId) {
        await supabase.from('career_employees')
          .update({ photo_url: publicUrl })
          .eq('id', employeeId);
      }

      return json({ url: publicUrl }, 200);
    }

    // type === 'contract'
    const path = `contracts/${employeeId || 'new'}/${stamp}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from('career-documents')
      .upload(path, buffer, { contentType: file.type, upsert: true });
    if (uploadErr) throw uploadErr;

    // Long-lived signed URL (10 years) so the employee can always download it
    const { data: signedData } = await supabase.storage
      .from('career-documents')
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    if (!signedData?.signedUrl) throw new Error('Failed to generate signed URL for contract');

    if (employeeId) {
      await supabase.from('career_employees')
        .update({ contract_url: signedData.signedUrl })
        .eq('id', employeeId);
    }

    return json({ url: signedData.signedUrl }, 200);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};
