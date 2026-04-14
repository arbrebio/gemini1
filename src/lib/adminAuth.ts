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
 * Verify the request carries a valid Supabase session cookie
 * belonging to a user listed in the `admin_profiles` table.
 *
 * Returns { ok: true, userId } on success, or
 *         { ok: false, response } with a 401/403 Response on failure.
 */
export async function requireAdminAuth(
  request: Request
): Promise<{ ok: true; userId: string } | { ok: false; response: Response }> {
  // Extract Bearer token from Authorization header
  const authHeader = request.headers.get('Authorization') || '';
  let token: string | null = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  // Fall back to sb-access-token cookie (set by the admin login page)
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

    // Verify the user exists in admin_profiles (if the table exists).
    // If the query errors with "relation does not exist" we fall back to
    // accepting any valid authenticated user — this keeps the admin panel
    // working even before an admin_profiles table is created.
    const { data: adminProfile, error: profileErr } = await supabase
      .from('admin_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    const tableNotFound =
      profileErr?.code === '42P01' ||
      profileErr?.message?.includes('does not exist');

    if (profileErr && !tableNotFound) {
      // Table exists but something else went wrong — deny access
      return { ok: false, response: forbiddenJson('Not an admin account') };
    }

    if (!tableNotFound && !adminProfile) {
      return { ok: false, response: forbiddenJson('Not an admin account') };
    }

    return { ok: true, userId: user.id };
  } catch {
    return { ok: false, response: unauthorizedJson('Auth check failed') };
  }
}
