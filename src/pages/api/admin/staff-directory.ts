export const prerender = false;

/**
 * Company-wide staff directory: every employee (with matricule) and every
 * platform account (admin, HR, terrain, sales), linked or not.
 *
 * GET  /api/admin/staff-directory → { employees, accounts, stats }
 * PUT  /api/admin/staff-directory → { account_type, account_id, employee_id|null } link / unlink
 * POST /api/admin/staff-directory → { action: 'auto-link' } link accounts whose email
 *                                    matches exactly one employee's email
 */

import type { APIRoute } from 'astro';
import { requireAdminAuth } from '../../../lib/adminAuth';
import { getServiceClient, json } from '../../../lib/staff';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const TABLES = {
  admin: 'admin_profiles',
  hr: 'hr_staff',
  terrain: 'terrain_profiles',
  sales: 'sales_agent_profiles',
} as const;
type AccountType = keyof typeof TABLES;

interface Account {
  account_type: AccountType;
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  active: boolean;
  employee_id: string | null;
  last_activity_at: string | null;
  last_activity: string | null;
}

async function loadAccounts(supabase: ReturnType<typeof getServiceClient>): Promise<Account[]> {
  const [admin, hr, terrain, sales] = await Promise.all([
    supabase.from('admin_profiles').select('id, full_name, role, employee_id'),
    supabase.from('hr_staff').select('id, full_name, email, permissions, active, employee_id'),
    supabase.from('terrain_profiles').select('id, full_name, email, role, active, employee_id'),
    supabase.from('sales_agent_profiles').select('id, full_name, email, is_active, employee_id'),
  ]);
  for (const r of [admin, hr, terrain, sales]) if (r.error) throw r.error;

  // admin_profiles has no email column: read it from auth users.
  const adminEmails = new Map<string, string>();
  await Promise.all((admin.data || []).map(async (a: any) => {
    const { data } = await supabase.auth.admin.getUserById(a.id);
    if (data?.user?.email) adminEmails.set(a.id, data.user.email.toLowerCase());
  }));

  const base = { last_activity_at: null, last_activity: null };
  return [
    ...(admin.data || []).map((a: any): Account => ({ ...base, account_type: 'admin', id: a.id, name: a.full_name, email: adminEmails.get(a.id) ?? null, role: a.role, active: true, employee_id: a.employee_id })),
    ...(hr.data || []).map((a: any): Account => ({ ...base, account_type: 'hr', id: a.id, name: a.full_name, email: a.email, role: (a.permissions || []).join(', '), active: a.active, employee_id: a.employee_id })),
    ...(terrain.data || []).map((a: any): Account => ({ ...base, account_type: 'terrain', id: a.id, name: a.full_name, email: a.email, role: a.role, active: a.active, employee_id: a.employee_id })),
    ...(sales.data || []).map((a: any): Account => ({ ...base, account_type: 'sales', id: a.id, name: a.full_name, email: a.email, role: 'sales agent', active: a.is_active, employee_id: a.employee_id })),
  ];
}

export const GET: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getServiceClient();
    const [{ data: employees, error }, accounts, { data: recent }] = await Promise.all([
      supabase.from('career_employees')
        .select('id, matricule, worker_id, first_name, last_name, email, phone, job_title, department, status, photo_url, start_date')
        .order('matricule'),
      loadAccounts(supabase),
      supabase.from('activity_log').select('actor_id, occurred_at, summary, portal')
        .not('actor_id', 'is', null).order('occurred_at', { ascending: false }).limit(2000),
    ]);
    if (error) throw error;

    // Latest action per person.
    const latest = new Map<string, { at: string; what: string }>();
    for (const r of recent || []) {
      if (!latest.has(r.actor_id)) latest.set(r.actor_id, { at: r.occurred_at, what: `${r.summary} (${r.portal})` });
    }
    for (const a of accounts) {
      const l = latest.get(a.id);
      if (l) { a.last_activity_at = l.at; a.last_activity = l.what; }
    }

    const linked = accounts.filter((a) => a.employee_id).length;
    return json({
      employees: employees || [],
      accounts,
      stats: {
        employees: (employees || []).length,
        active_employees: (employees || []).filter((e: any) => e.status === 'active').length,
        accounts: accounts.length,
        linked_accounts: linked,
        unlinked_accounts: accounts.length - linked,
      },
    });
  } catch (e) {
    console.error('[admin staff-directory GET]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};

export const PUT: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getServiceClient();
    const body = await request.json().catch(() => ({}));
    const type = body.account_type as AccountType;
    if (!(type in TABLES)) return json({ error: 'account_type must be admin, hr, terrain or sales' }, 400);
    if (typeof body.account_id !== 'string' || !UUID_RE.test(body.account_id)) return json({ error: 'account_id required' }, 400);
    const employeeId = body.employee_id === null || body.employee_id === ''
      ? null
      : (typeof body.employee_id === 'string' && UUID_RE.test(body.employee_id) ? body.employee_id : undefined);
    if (employeeId === undefined) return json({ error: 'employee_id must be an employee id or null' }, 400);

    if (employeeId) {
      const { data: emp } = await supabase.from('career_employees').select('id').eq('id', employeeId).maybeSingle();
      if (!emp) return json({ error: 'Employee not found' }, 404);
    }

    const { data, error } = await supabase.from(TABLES[type]).update({ employee_id: employeeId })
      .eq('id', body.account_id).select('id').maybeSingle();
    if (error) {
      if ((error as any).code === '23505') return json({ error: 'That employee is already linked to another account on this platform' }, 409);
      throw error;
    }
    if (!data) return json({ error: 'Account not found' }, 404);
    return json({ ok: true });
  } catch (e) {
    console.error('[admin staff-directory PUT]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const body = await request.json().catch(() => ({}));
    if (body.action !== 'auto-link') return json({ error: "action must be 'auto-link'" }, 400);
    const supabase = getServiceClient();

    const [{ data: employees, error }, accounts] = await Promise.all([
      supabase.from('career_employees').select('id, email'),
      loadAccounts(supabase),
    ]);
    if (error) throw error;

    const byEmail = new Map<string, string[]>();
    for (const e of employees || []) {
      const k = String(e.email || '').trim().toLowerCase();
      if (!k) continue;
      byEmail.set(k, [...(byEmail.get(k) || []), e.id]);
    }

    // Employees already linked on each platform (one account per employee per platform).
    const taken = new Set(accounts.filter((a) => a.employee_id).map((a) => `${a.account_type}:${a.employee_id}`));
    let linked = 0;
    const skipped: string[] = [];
    for (const a of accounts) {
      if (a.employee_id || !a.email) continue;
      const matches = byEmail.get(a.email.toLowerCase());
      if (!matches || matches.length !== 1) continue;
      const key = `${a.account_type}:${matches[0]}`;
      if (taken.has(key)) { skipped.push(`${a.name || a.email} (${a.account_type})`); continue; }
      const { error: upErr } = await supabase.from(TABLES[a.account_type]).update({ employee_id: matches[0] }).eq('id', a.id);
      if (upErr) { skipped.push(`${a.name || a.email} (${a.account_type})`); continue; }
      taken.add(key);
      linked++;
    }
    return json({ ok: true, linked, skipped });
  } catch (e) {
    console.error('[admin staff-directory POST]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};
