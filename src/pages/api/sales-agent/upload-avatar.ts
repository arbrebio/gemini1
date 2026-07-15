export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

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

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

/**
 * POST /api/sales-agent/upload-avatar
 * Uploads a profile photo to the public `sales-agent-avatars` bucket and
 * updates the agent's avatar_url.
 *
 * Headers: Authorization: Bearer <access_token>
 * FormData: file — the image to upload (max 2 MB)
 *
 * Returns: { avatar_url }
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const token = extractToken(request);
    if (!token) return json({ error: 'Missing token' }, 401);

    const supabase = getSupabaseAdmin();
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return json({ error: 'Invalid or expired token' }, 401);

    const { data: profile } = await supabase
      .from('sales_agent_profiles')
      .select('id, is_active')
      .eq('id', user.id)
      .single();
    if (!profile?.is_active) return json({ error: 'Account suspended' }, 403);

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || file.size === 0) return json({ error: 'No file provided' }, 400);
    if (file.size > MAX_SIZE) return json({ error: 'Photo must be smaller than 2 MB' }, 400);

    const fileType = file.type.toLowerCase();
    if (!ALLOWED_TYPES.includes(fileType)) {
      return json({ error: 'Only JPG, PNG, WebP or GIF images are allowed' }, 400);
    }

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const filePath = `avatars/${user.id}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadErr } = await supabase.storage
      .from('sales-agent-avatars')
      .upload(filePath, buffer, { contentType: file.type, upsert: true });
    if (uploadErr) throw uploadErr;

    const { data: urlData } = supabase.storage
      .from('sales-agent-avatars')
      .getPublicUrl(filePath);
    const avatar_url = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: updateErr } = await supabase
      .from('sales_agent_profiles')
      .update({ avatar_url })
      .eq('id', user.id);
    if (updateErr) throw updateErr;

    return json({ avatar_url });
  } catch (e: any) {
    console.error('API error:', e);
    if (isMissingSchema(e)) {
      return json({ error: 'Photo upload is not configured yet — the storage bucket or avatar_url column is missing. Ask an admin to run the pending Supabase migrations.' }, 503);
    }
    return json({ error: 'Internal server error' }, 500);
  }
};

// Bucket-not-found (storage) or column-not-found (Postgres 42703 / PostgREST
// PGRST204) — both mean the migration that provisions this feature hasn't
// been applied yet, which is a much clearer signal than a bare 500.
function isMissingSchema(e: any): boolean {
  const msg = String(e?.message || '');
  return (
    e?.code === '42703' ||
    e?.code === 'PGRST204' ||
    /bucket not found/i.test(msg) ||
    /column .* does not exist/i.test(msg)
  );
}
