export const prerender = false;

/**
 * POST /api/admin/blog-presign
 *
 * Generates a Supabase Storage signed upload URL for blog media
 * (images and videos). The browser then PUTs the file directly to
 * Supabase Storage, bypassing Vercel's 4.5 MB serverless body limit.
 *
 * Body (JSON): { file_name, file_type, file_size }
 * Returns:     { signed_url, file_path, public_url }
 */

import type { APIRoute } from 'astro';
import { requireAdminAuth } from '../../../lib/adminAuth';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/webm', 'video/ogg',
]);

const BUCKET = 'blog-media';
const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

export const POST: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const { file_name, file_type, file_size } = body ?? {};

    if (!file_name)                         return json({ error: 'file_name is required' }, 400);
    if (!file_type || !ALLOWED_TYPES.has(file_type))
                                            return json({ error: 'File type not allowed. Use JPEG, PNG, WebP, GIF, MP4, WebM, or OGG.' }, 400);
    if (!file_size || Number(file_size) > MAX_SIZE)
                                            return json({ error: 'File too large (max 50 MB)' }, 400);

    const supabase = getSupabase();
    const ext      = (file_name.split('.').pop() || 'bin').toLowerCase();
    const stamp    = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const filePath = `posts/${stamp}.${ext}`;

    const { data, error: signErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(filePath);

    if (signErr || !data?.signedUrl) {
      throw new Error(signErr?.message ?? 'Failed to generate upload URL');
    }

    // Build the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

    return json({
      signed_url: data.signedUrl,
      file_path:  filePath,
      public_url: publicUrl,
    });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};
