export const prerender = false;

/**
 * POST /api/admin/terrain-link
 *
 * Bridges the currently logged-in main-panel admin into the Terrain
 * field-operations platform, so there is a single super-admin account
 * instead of two separate logins (admin_profiles vs. a standalone
 * terrain_profiles super_admin).
 *
 * Terrain auth (lib/terrainAuth.ts) verifies callers purely via Supabase
 * JWT + a `terrain_profiles` row keyed on the same auth.users id — so an
 * admin's own access token already works for /api/terrain/* once such a
 * row exists. This route just ensures that row exists (idempotent) and
 * hands back the profile shape the Terrain client expects; the browser
 * then reuses the admin's own session token as the Terrain token.
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

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const supabase = getSupabaseAdmin();

    const { data: existing } = await supabase
      .from('terrain_profiles')
      .select('id, full_name, email, role, phone, avatar_url, active, must_change_password')
      .eq('id', auth.userId)
      .maybeSingle();

    if (existing) {
      if (!existing.active || existing.role !== 'super_admin') {
        const { data: reactivated, error: reactivateErr } = await supabase
          .from('terrain_profiles')
          .update({ active: true, role: 'super_admin' })
          .eq('id', auth.userId)
          .select('id, full_name, email, role, phone, avatar_url, active, must_change_password')
          .single();
        if (reactivateErr) throw reactivateErr;
        return json({ profile: reactivated });
      }
      return json({ profile: existing });
    }

    // No terrain_profiles row yet for this admin — create one, reusing
    // their admin_profiles display name where available.
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('full_name, avatar_url')
      .eq('id', auth.userId)
      .maybeSingle();

    const { data: created, error: insertErr } = await supabase
      .from('terrain_profiles')
      .insert({
        id: auth.userId,
        full_name: adminProfile?.full_name || auth.email || 'Super Admin',
        email: auth.email || `${auth.userId}@admin.local`,
        role: 'super_admin',
        avatar_url: adminProfile?.avatar_url || null,
        active: true,
        must_change_password: false,
      })
      .select('id, full_name, email, role, phone, avatar_url, active, must_change_password')
      .single();

    if (insertErr) throw insertErr;
    return json({ profile: created });
  } catch (e: any) {
    console.error('[admin/terrain-link]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};
