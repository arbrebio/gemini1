/**
 * Server-side admin authentication utility.
 *
 * Usage inside any /api/admin/* route:
 *
 *   import { requireAdminAuth, unauthorizedJson } from '../../../lib/adminAuth';
 *   const authResult = await requireAdminAuth(request);
 *   if (!authResult.ok) return authResult.response;
 */

import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export function unauthorizedJson(message = 'Unauthorized') {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function forbiddenJson(message = 'Forbidden') {
  return new Response(JSON.stringify({ error: message }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Comma-separated allowlist of admin email addresses, used as a fail-safe
 * when the `admin_profiles` table does not exist yet. Configure in env as:
 *   ADMIN_EMAILS=alice@arbrebio.com,bob@arbrebio.com
 */
function getAdminEmailAllowlist(): string[] {
  return (import.meta.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Verify the request carries a valid Supabase access token belonging to a
 * known admin. Admin status is determined by membership in the
 * `admin_profiles` table; if that table does not exist yet, we fall back to
 * the ADMIN_EMAILS allowlist. If NEITHER is configured, access is DENIED
 * (fail-closed) rather than granted to every authenticated user.
 *
 * Returns { ok: true, userId, email } on success, or
 *         { ok: false, response } with a 401/403 Response on failure.
 */
export async function requireAdminAuth(
  request: Request
): Promise<{ ok: true; userId: string; email: string | null } | { ok: false; response: Response }> {
  // Extract Bearer token from Authorization header
  const authHeader = request.headers.get('Authorization') || '';
  let token: string | null = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  // Fall back to a Supabase access-token cookie if present
  if (!token) {
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.match(/sb-access-token=([^;]+)/);
    if (match) token = decodeURIComponent(match[1]);
  }

  if (!token) return { ok: false, response: unauthorizedJson('Missing auth token') };

  try {
    const supabase = getServiceClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return { ok: false, response: unauthorizedJson('Invalid or expired session') };

    const email = user.email?.toLowerCase() ?? null;

    // Primary check: membership in admin_profiles.
    const { data: adminProfile, error: profileErr } = await supabase
      .from('admin_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    const tableNotFound =
      profileErr?.code === '42P01' ||
      profileErr?.message?.includes('does not exist');

    if (profileErr && !tableNotFound) {
      // Table exists but the query failed for another reason — deny.
      return { ok: false, response: forbiddenJson('Not an admin account') };
    }

    if (!tableNotFound) {
      // Table exists — membership is authoritative.
      if (!adminProfile) return { ok: false, response: forbiddenJson('Not an admin account') };
      return { ok: true, userId: user.id, email };
    }

    // Table missing — fail-safe to the email allowlist (fail-CLOSED if empty).
    const allowlist = getAdminEmailAllowlist();
    if (allowlist.length === 0) {
      return {
        ok: false,
        response: forbiddenJson(
          'Admin access not configured. Create an admin_profiles table or set ADMIN_EMAILS.'
        ),
      };
    }
    if (!email || !allowlist.includes(email)) {
      return { ok: false, response: forbiddenJson('Not an admin account') };
    }
    return { ok: true, userId: user.id, email };
  } catch {
    return { ok: false, response: unauthorizedJson('Auth check failed') };
  }
}
