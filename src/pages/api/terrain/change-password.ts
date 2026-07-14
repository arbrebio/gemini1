export const prerender = false;

/**
 * POST /api/terrain/change-password
 * Body: { current_password, new_password }
 * Headers: Authorization: Bearer <access_token>
 */

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function getSupabaseAnon() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase anon key not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
    if (!token) return json({ error: 'Missing token' }, 401);

    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) return json({ error: 'Invalid or expired token' }, 401);

    const body = await request.json().catch(() => null);
    if (!body) return json({ error: 'Invalid JSON body' }, 400);
    const { current_password, new_password } = body as { current_password?: string; new_password?: string };

    if (!current_password?.trim()) return json({ error: 'current_password is required' }, 400);
    if (!new_password || new_password.length < 8) return json({ error: 'new_password must be at least 8 characters' }, 400);
    if (current_password === new_password) return json({ error: 'New password must be different from the current one' }, 400);

    const { data: profile } = await supabaseAdmin
      .from('terrain_profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single();
    if (!profile) return json({ error: 'Terrain account not found' }, 404);

    const supabaseAnon = getSupabaseAnon();
    const { error: signInErr } = await supabaseAnon.auth.signInWithPassword({
      email: profile.email, password: current_password,
    });
    if (signInErr) return json({ error: 'Mot de passe actuel incorrect.' }, 400);

    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, { password: new_password });
    if (updateErr) throw updateErr;

    await supabaseAdmin
      .from('terrain_profiles')
      .update({ must_change_password: false, temp_password: null })
      .eq('id', user.id);

    // A user changing their own password resolves any pending admin-side reset request.
    await supabaseAdmin.from('terrain_password_reset_requests').delete().eq('user_id', user.id);

    return json({ success: true });
  } catch (e: any) {
    console.error('[terrain change-password]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};
