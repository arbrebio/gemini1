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

/** PUT /api/terrain/profile — { full_name?, avatar_url?, phone? } updates the caller's own profile. */
export const PUT: APIRoute = async ({ request }) => {
  const auth = await requireTerrainAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();
    const body = await request.json();

    const allowed = ['full_name', 'avatar_url', 'phone'];
    const safe: Record<string, any> = {};
    for (const k of allowed) if (k in body) safe[k] = body[k];
    if (safe.full_name !== undefined && !String(safe.full_name).trim()) delete safe.full_name;
    if (Object.keys(safe).length === 0) return json({ error: 'No updatable fields provided' }, 400);

    const { data: profile, error } = await supabase
      .from('terrain_profiles')
      .update(safe)
      .eq('id', auth.profile.id)
      .select('id, full_name, email, role, phone, avatar_url, active, must_change_password')
      .single();
    if (error) throw error;
    return json({ profile });
  } catch (e: any) {
    console.error('[terrain profile PUT]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};
