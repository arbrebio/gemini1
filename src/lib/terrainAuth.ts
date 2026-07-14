/**
 * Server-side authentication utility for the Terrain field-operations
 * platform. Mirrors lib/adminAuth.ts, but checks the `terrain_profiles`
 * table (a separate role system from the main site's admin_profiles —
 * Terrain has its own super_admin/engineer/technician accounts).
 *
 * Usage inside any /api/terrain/* route:
 *
 *   import { requireTerrainAuth } from '../../../lib/terrainAuth';
 *   const auth = await requireTerrainAuth(request);
 *   if (!auth.ok) return auth.response;
 *   // auth.profile.role, auth.profile.id, ...
 *
 *   // Restrict to specific roles:
 *   const auth = await requireTerrainAuth(request, ['super_admin']);
 */

import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export interface TerrainProfile {
  id: string;
  full_name: string;
  email: string;
  role: 'super_admin' | 'engineer' | 'technician';
  phone: string | null;
  avatar_url: string | null;
  active: boolean;
  must_change_password: boolean;
}

function json(body: any, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function unauthorizedJson(message = 'Unauthorized') {
  return json({ error: message }, 401);
}

export function forbiddenJson(message = 'Forbidden') {
  return json({ error: message }, 403);
}

/**
 * Verify the request carries a valid Supabase access token belonging to
 * a known, active Terrain account. Optionally restrict to specific roles.
 */
export async function requireTerrainAuth(
  request: Request,
  allowedRoles?: Array<'super_admin' | 'engineer' | 'technician'>
): Promise<
  | { ok: true; profile: TerrainProfile }
  | { ok: false; response: Response }
> {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  if (!token) return { ok: false, response: unauthorizedJson('Missing auth token') };

  try {
    const supabase = getServiceClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return { ok: false, response: unauthorizedJson('Invalid or expired session') };

    const { data: profile, error: profileErr } = await supabase
      .from('terrain_profiles')
      .select('id, full_name, email, role, phone, avatar_url, active, must_change_password')
      .eq('id', user.id)
      .maybeSingle();

    if (profileErr || !profile) return { ok: false, response: forbiddenJson('Not a Terrain account') };
    if (!profile.active) return { ok: false, response: forbiddenJson('Account is deactivated') };

    if (allowedRoles && !allowedRoles.includes(profile.role)) {
      return { ok: false, response: forbiddenJson('Insufficient role') };
    }

    return { ok: true, profile: profile as TerrainProfile };
  } catch {
    return { ok: false, response: unauthorizedJson('Auth check failed') };
  }
}
