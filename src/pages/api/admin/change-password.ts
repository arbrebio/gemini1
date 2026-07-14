export const prerender = false;

/**
 * POST /api/admin/change-password
 *
 * Body: { current_password: string, new_password: string }
 * Headers: Authorization: Bearer <access_token>
 *
 * Flow:
 *  1. Validate JWT + confirm the caller is a known admin (requireAdminAuth)
 *  2. Re-authenticate with current_password to confirm identity
 *  3. Update password via the Supabase Admin API
 */

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '../../../lib/adminAuth';

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
  // ── 1. Confirm the caller is an authenticated admin ────────────────────────
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json().catch(() => null);
    if (!body) return json({ error: 'Invalid JSON body' }, 400);

    const { current_password, new_password } = body as {
      current_password?: string;
      new_password?: string;
    };

    if (!current_password?.trim()) return json({ error: 'Current password is required.' }, 400);
    if (!new_password || new_password.length < 8) {
      return json({ error: 'New password must be at least 8 characters.' }, 400);
    }
    if (current_password === new_password) {
      return json({ error: 'New password must be different from the current password.' }, 400);
    }

    // requireAdminAuth resolves the caller's email from the validated token.
    const email = auth.email;
    if (!email) return json({ error: 'Could not determine your account email.' }, 400);

    // ── 2. Verify current_password with a throwaway sign-in ──────────────────
    const supabaseAnon = getSupabaseAnon();
    const { error: signInErr } = await supabaseAnon.auth.signInWithPassword({
      email,
      password: current_password,
    });
    if (signInErr) return json({ error: 'Current password is incorrect.' }, 400);

    // ── 3. Update the password via the Admin API ─────────────────────────────
    const supabaseAdmin = getSupabaseAdmin();
    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(auth.userId, {
      password: new_password,
    });
    if (updateErr) throw updateErr;

    return json({ success: true });
  } catch (e: any) {
    console.error('[admin change-password]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};
