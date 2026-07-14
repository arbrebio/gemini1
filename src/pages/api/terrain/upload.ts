export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { requireTerrainAuth } from '../../../lib/terrainAuth';

function getSupabase() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role not configured');
  return createClient(url, key);
}

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

const EXTENSION_MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', heic: 'image/heic',
};
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * POST /api/terrain/upload
 * FormData: file (required), folder ('visits'|'tasks'|'avatars', default 'misc')
 * Returns: { url }
 */
export const POST: APIRoute = async ({ request }) => {
  const auth = await requireTerrainAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'misc';

    if (!file || file.size === 0) return json({ error: 'No file provided' }, 400);
    if (file.size > MAX_BYTES) return json({ error: 'File exceeds the 8 MB limit.' }, 400);

    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const contentType = EXTENSION_MIME[ext];
    if (!contentType) return json({ error: 'Unsupported file type. Use JPG, PNG, WebP or HEIC.' }, 400);

    const supabase = getSupabase();
    const path = `${folder}/${auth.profile.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadErr } = await supabase.storage
      .from('terrain-photos')
      .upload(path, arrayBuffer, { contentType });
    if (uploadErr) throw uploadErr;

    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const url = `${supabaseUrl}/storage/v1/object/public/terrain-photos/${path}`;
    return json({ url });
  } catch (e: any) {
    console.error('[terrain upload]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};
