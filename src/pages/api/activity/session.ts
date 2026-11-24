export const prerender = false;

/**
 * POST /api/activity/session — a portal calls this right after a successful
 * sign-in. The middleware records it in the activity log as "Signed in"
 * (portal taken from the body). Body: { portal: 'admin'|'hr'|'terrain'|'sales' }.
 */

import type { APIRoute } from 'astro';
import { authenticateStaff, json } from '../../../lib/staff';

const PORTALS = ['admin', 'hr', 'terrain', 'sales'];

export const POST: APIRoute = async ({ request }) => {
  const auth = await authenticateStaff(request);
  if (!auth.ok) return auth.response;
  const body = await request.json().catch(() => null);
  const portal = typeof body?.portal === 'string' && PORTALS.includes(body.portal) ? body.portal : null;
  if (!portal) return json({ error: 'portal must be admin, hr, terrain or sales' }, 400);

  if (portal === 'hr' && auth.identity.hr) {
    await auth.supabase.from('hr_staff').update({ last_login_at: new Date().toISOString() }).eq('id', auth.identity.userId);
  }
  return json({ ok: true });
};
