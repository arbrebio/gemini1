export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { MAX_PROOF_BYTES, PROOF_URL_TTL_SECONDS } from '../../../lib/saleProofs';

function getSupabaseAdmin() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function extractToken(request: Request): string | null {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7).trim();
}

// MIME type → the extension we store the file under. The stored extension is
// derived from the validated type, never from the client's file name.
const TYPE_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};

/**
 * POST /api/sales-agent/upload-proof
 * Uploads a proof-of-payment file to the private `sale-proofs` bucket.
 *
 * Headers:
 *   Authorization: Bearer <access_token>
 *
 * FormData:
 *   file — the file to upload (image or PDF, max 4 MB)
 *
 * Returns: { url, signed_url, file_name }
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const token = extractToken(request);
    if (!token) return json({ error: 'Missing token' }, 401);

    const supabase = getSupabaseAdmin();

    // Validate JWT
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return json({ error: 'Invalid or expired token' }, 401);

    // Verify agent is active
    const { data: profile } = await supabase
      .from('sales_agent_profiles')
      .select('id, is_active')
      .eq('id', user.id)
      .single();

    if (!profile?.is_active) return json({ error: 'Account suspended' }, 403);

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || file.size === 0) return json({ error: 'No file provided' }, 400);
    if (file.size > MAX_PROOF_BYTES) return json({ error: 'File too large (max 4 MB)' }, 400);

    const fileType = file.type.toLowerCase();
    const ext = TYPE_EXTENSION[fileType];
    if (!ext) {
      return json({ error: 'Only PDF, JPG, PNG, and WEBP files are allowed' }, 400);
    }

    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const filePath = `proofs/${user.id}/${stamp}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadErr } = await supabase.storage
      .from('sale-proofs')
      .upload(filePath, buffer, { contentType: fileType, upsert: false });

    if (uploadErr) throw uploadErr;

    // Short-lived signed URL, only for the immediate preview in the form. The
    // sale stores the storage path; a fresh URL is signed whenever it is read.
    const { data: signedData, error: signErr } = await supabase.storage
      .from('sale-proofs')
      .createSignedUrl(filePath, PROOF_URL_TTL_SECONDS);

    if (signErr || !signedData) throw signErr || new Error('Failed to generate signed URL');

    return json({
      url: filePath,                   // Storage path (stored in DB)
      signed_url: signedData.signedUrl, // Full URL for immediate display
      file_name: file.name,
    });
  } catch (e: any) {
    console.error("API error:", e);
    return json({ error: "Internal server error" }, 500);
  }
};
