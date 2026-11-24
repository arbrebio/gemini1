export const prerender = false;

/**
 * GET /api/admin/activity — search the activity log (admins only).
 *
 * Query: portal, actor_id, employee_id (actor's employee), matricule,
 *        q (text in name/email/summary/entity), from, to (YYYY-MM-DD),
 *        denied=1 (only refused attempts), limit (≤200), offset
 */

import type { APIRoute } from 'astro';
import { requireAdminAuth } from '../../../lib/adminAuth';
import { getServiceClient, json } from '../../../lib/staff';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const GET: APIRoute = async ({ request, url }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const p = url.searchParams;
    const limit = Math.min(200, Math.max(1, Number(p.get('limit')) || 50));
    const offset = Math.max(0, Number(p.get('offset')) || 0);

    let query = getServiceClient()
      .from('activity_log')
      .select('id, occurred_at, portal, actor_id, actor_kind, actor_name, actor_email, actor_matricule, actor_employee_id, action, summary, method, path, status, entity_id, details, ip', { count: 'exact' })
      .order('occurred_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const portal = p.get('portal');
    if (portal && ['admin', 'hr', 'terrain', 'sales', 'system'].includes(portal)) query = query.eq('portal', portal);
    const actor = p.get('actor_id');
    if (actor && UUID_RE.test(actor)) query = query.eq('actor_id', actor);
    const emp = p.get('employee_id');
    if (emp && UUID_RE.test(emp)) query = query.eq('actor_employee_id', emp);
    const mat = p.get('matricule')?.trim();
    if (mat) query = query.eq('actor_matricule', mat.toUpperCase());
    const from = p.get('from');
    if (from && DATE_RE.test(from)) query = query.gte('occurred_at', `${from}T00:00:00Z`);
    const to = p.get('to');
    if (to && DATE_RE.test(to)) query = query.lte('occurred_at', `${to}T23:59:59Z`);
    if (p.get('denied') === '1') query = query.eq('status', 403);

    const q = p.get('q')?.trim();
    if (q) {
      // Strip characters that have meaning in PostgREST filter syntax.
      const safe = q.replace(/[%_,()*\\:"']/g, ' ').trim().slice(0, 60);
      if (safe) {
        const like = `%${safe}%`;
        query = query.or(`actor_name.ilike.${like},actor_email.ilike.${like},summary.ilike.${like},entity_id.ilike.${like},actor_matricule.ilike.${like}`);
      }
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return json({ entries: data || [], total: count ?? 0, limit, offset });
  } catch (e) {
    console.error('[admin activity GET]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};
