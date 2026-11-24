export const prerender = false;

/**
 * POST /api/hr/change-password — HR portal user replaces their (temporary)
 * password. Body: { current_password, new_password }.
 */

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { getServiceClient, bearerToken, json } from '../../../lib/staff';

function getAnonClient() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase anon key not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const token = bearerToken(request);
    if (!token) return json({ error: 'Missing auth token' }, 401);

    const admin = getServiceClient();
    const { data: { user }, error: authErr } = await admin.auth.getUser(token);
    if (authErr || !user) return json({ error: 'Invalid or expired session' }, 401);

    const body = await request.json().catch(() => null);
    const current_password = typeof body?.current_password === 'string' ? body.current_password : '';
    const new_password = typeof body?.new_password === 'string' ? body.new_password : '';
    if (!current_password) return json({ error: 'Current password is required' }, 400);
    if (new_password.length < 10) return json({ error: 'New password must be at least 10 characters' }, 400);
    if (!/[A-Za-z]/.test(new_password) || !/[0-9]/.test(new_password)) {
      return json({ error: 'New password must contain letters and numbers' }, 400);
    }
    if (current_password === new_password) return json({ error: 'New password must be different from the current one' }, 400);

    const { data: staff } = await admin.from('hr_staff').select('id, email, active').eq('id', user.id).maybeSingle();
    if (!staff) return json({ error: 'HR account not found' }, 404);
    if (!staff.active) return json({ error: 'Your HR portal access has been deactivated.' }, 403);

    const { error: signInErr } = await getAnonClient().auth.signInWithPassword({
      email: user.email || staff.email,
      password: current_password,
    });
    if (signInErr) return json({ error: 'Current password is incorrect.' }, 400);

    const { error: updateErr } = await admin.auth.admin.updateUserById(user.id, { password: new_password });
    if (updateErr) throw updateErr;

    await admin.from('hr_staff').update({ must_change_password: false }).eq('id', user.id);
    return json({ success: true });
  } catch (e) {
    console.error('[hr change-password]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};
