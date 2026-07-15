export const prerender = false;

// Admin uploads the official Arbre Bio logo used on the printed bulletin de
// paie. Stored in payroll_settings.logo_url and snapshotted onto each slip
// at generation time so historical bulletins keep the logo used then.

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '../../../../lib/adminAuth';

function getSupabase() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];

export const POST: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file || file.size === 0) return json({ error: 'No file provided' }, 400);
    if (file.size > 5 * 1024 * 1024) return json({ error: 'File too large (max 5 MB)' }, 400);
    if (!ALLOWED_TYPES.includes(file.type)) return json({ error: 'Format must be PNG, JPG, WEBP or SVG' }, 400);

    const supabase = getSupabase();
    const ext = (file.name.split('.').pop() || 'png').toLowerCase();
    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const path = `payroll/logo-${stamp}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadErr } = await supabase.storage
      .from('career-photos')
      .upload(path, buffer, { contentType: file.type, upsert: true });
    if (uploadErr) throw uploadErr;

    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/career-photos/${path}`;

    const { data: existing, error: readError } = await supabase
      .from('payroll_settings')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (readError) throw readError;
    if (!existing) return json({ error: 'Payroll settings row missing — run the migration first' }, 404);

    const { error: updateErr } = await supabase
      .from('payroll_settings')
      .update({ logo_url: publicUrl })
      .eq('id', existing.id);
    if (updateErr) throw updateErr;

    return json({ url: publicUrl }, 200);
  } catch (e) {
    console.error('API error:', e);
    return json({ error: 'Internal server error' }, 500);
  }
};
