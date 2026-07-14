export const prerender = false;

/**
 * POST /api/terrain/forgot-password
 * Body: { email }
 * Public, unauthenticated. Always returns { success: true } regardless of
 * whether the email matches an account, to avoid leaking which emails have
 * Terrain accounts. Files a row the super_admin sees on the Users page.
 */

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { globalRateLimiter, getClientIp } from '../../../lib/securityHeaders';

function getSupabase() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!globalRateLimiter.isAllowed(getClientIp(request))) {
      return json({ error: 'Too many requests. Please try again later.' }, 429);
    }

    const body = await request.json().catch(() => null);
    const email = String(body?.email || '').trim().toLowerCase();
    if (!email) return json({ success: true }); // still enumeration-safe

    const supabase = getSupabase();
    const { data: profile } = await supabase
      .from('terrain_profiles')
      .select('id, role')
      .eq('email', email)
      .maybeSingle();

    // Never file a request for super_admin or unknown emails, and never say so.
    if (profile && profile.role !== 'super_admin') {
      await supabase
        .from('terrain_password_reset_requests')
        .upsert({ user_id: profile.id, requested_at: new Date().toISOString() }, { onConflict: 'user_id' });
    }

    return json({ success: true });
  } catch (e: any) {
    console.error('[terrain forgot-password]', e);
    return json({ success: true }); // fail closed on enumeration, not informative on errors
  }
};
