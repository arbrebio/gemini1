export const prerender = false;

/**
 * POST /api/sales-agent/change-password
 *
 * Body: { current_password: string, new_password: string }
 * Headers: Authorization: Bearer <access_token>
 *
 * Flow:
 *  1. Validate JWT → get user
 *  2. Re-authenticate with current_password to confirm identity
 *  3. Update password via Supabase Admin API
 *  4. Clear must_change_password + temp_password in sales_agent_profiles
 *  5. Send confirmation email
 */

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { sendPasswordChangedEmail } from '../../../lib/agentEmail';

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
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // ── 1. Extract & validate token ──────────────────────────────────────────
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) return json({ error: 'Missing token' }, 401);
    const token = auth.slice(7).trim();

    const supabaseAdmin = getSupabaseAdmin();

    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) return json({ error: 'Invalid or expired token' }, 401);

    // ── 2. Parse & validate body ─────────────────────────────────────────────
    const body = await request.json().catch(() => null);
    if (!body) return json({ error: 'Invalid JSON body' }, 400);

    const { current_password, new_password } = body as {
      current_password?: string;
      new_password?: string;
    };

    if (!current_password?.trim()) return json({ error: 'current_password is required' }, 400);
    if (!new_password || new_password.length < 8) {
      return json({ error: 'new_password must be at least 8 characters' }, 400);
    }
    if (current_password === new_password) {
      return json({ error: 'New password must be different from the current password' }, 400);
    }

    // ── 3. Verify current_password by attempting a sign-in ───────────────────
    // Fetch email from profile (user.email may not always be populated server-side)
    const { data: profile } = await supabaseAdmin
      .from('sales_agent_profiles')
      .select('email, full_name, must_change_password')
      .eq('id', user.id)
      .single();

    if (!profile) return json({ error: 'Agent profile not found' }, 404);

    const supabaseAnon = getSupabaseAnon();
    const { error: signInErr } = await supabaseAnon.auth.signInWithPassword({
      email: profile.email,
      password: current_password,
    });

    if (signInErr) {
      return json({ error: 'Mot de passe actuel incorrect.' }, 400);
    }

    // ── 4. Update password via Admin API ─────────────────────────────────────
    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: new_password,
    });
    if (updateErr) throw updateErr;

    // ── 5. Clear must_change_password + temp_password ────────────────────────
    await supabaseAdmin
      .from('sales_agent_profiles')
      .update({ must_change_password: false, temp_password: null })
      .eq('id', user.id);

    // ── 6. Send confirmation email (non-blocking — don't fail if email errors) ─
    sendPasswordChangedEmail({
      to: profile.email,
      full_name: profile.full_name,
    }).catch((e) => console.error('[agentEmail] confirmation email failed:', e));

    return json({ success: true });
  } catch (e: any) {
    console.error('[change-password]', e);
    return json({ error: e.message || 'Internal server error' }, 500);
  }
};
