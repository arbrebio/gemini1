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
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

/**
 * GET /api/terrain/login
 * Validates the just-issued Supabase access token and returns the caller's
 * Terrain profile. The client signs in via the Supabase Auth REST API
 * directly (see terrain/login.astro), then calls this to confirm the
 * account is a real, active Terrain account before storing the session.
 *
 * Headers: Authorization: Bearer <access_token>
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
    if (!token) return json({ error: 'Missing token' }, 401);

    const supabase = getSupabaseAdmin();
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return json({ error: 'Invalid or expired token' }, 401);

    const { data: profile, error: profileErr } = await supabase
      .from('terrain_profiles')
      .select('id, full_name, email, role, phone, avatar_url, active, must_change_password')
      .eq('id', user.id)
      .maybeSingle();

    if (profileErr || !profile) return json({ error: 'This account is not a Terrain account.' }, 404);
    if (!profile.active) return json({ error: 'Account deactivated', deactivated: true }, 403);

    return json({ profile });
  } catch (e: any) {
    console.error('[terrain login]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};
