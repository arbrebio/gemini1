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
 * POST /api/admin/upload-asset
 * FormData fields:
 *   file   — the file to upload (required)
 *   bucket — Supabase storage bucket name (default: "product-images")
 *   path   — optional sub-path prefix within the bucket
 *
 * Returns: { url: string }
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'product-images';
    const pathPrefix = (formData.get('path') as string) || '';

    if (!file || file.size === 0) return json({ error: 'No file provided' }, 400);
    if (file.size > 10 * 1024 * 1024) return json({ error: 'File too large (max 10 MB)' }, 400);

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return json({ error: 'Only JPG, PNG, WebP, and GIF images are allowed' }, 400);
    }

    const supabase = getSupabase();
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const filePath = pathPrefix ? `${pathPrefix}/${stamp}.${ext}` : `uploads/${stamp}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadErr } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, { contentType: file.type, upsert: true });

    if (uploadErr) throw uploadErr;

    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`;

    return json({ url: publicUrl }, 200);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};
