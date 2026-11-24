/**
 * Unified staff identity across the four Arbre Bio platforms.
 *
 * One person = one Supabase Auth user, who may hold one or more accounts:
 *   admin_profiles        → main admin portal (/admin/)
 *   hr_staff              → HR & Payroll portal (/hr/)
 *   terrain_profiles      → field operations portal (/terrain/)
 *   sales_agent_profiles  → sales agent PWA (/sales-agent/)
 * Each account may be linked (employee_id) to a career_employees row, which
 * carries the company-wide matricule (defaults to the Worker ID).
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type HrArea = 'recruitment' | 'employees' | 'payroll';
export const HR_AREAS: HrArea[] = ['recruitment', 'employees', 'payroll'];

export type ActorKind = 'admin' | 'hr' | 'terrain' | 'sales_agent' | 'unknown';

export interface StaffIdentity {
  userId: string;
  email: string | null;
  kind: ActorKind;          // the most privileged account this user holds
  name: string | null;
  employeeId: string | null;
  matricule: string | null;
  isAdmin: boolean;
  hr: { active: boolean; permissions: HrArea[]; mustChangePassword: boolean } | null;
  terrainRole: string | null;
  isSalesAgent: boolean;
}

export function getServiceClient(): SupabaseClient {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

export function bearerToken(request: Request): string | null {
  const h = request.headers.get('Authorization') || '';
  return h.startsWith('Bearer ') ? h.slice(7).trim() || null : null;
}

/** Looks up every account a user holds. Always hits the database (no cache). */
export async function loadStaffIdentity(
  supabase: SupabaseClient,
  userId: string,
  email: string | null,
): Promise<StaffIdentity> {
  const [admin, hr, terrain, sales] = await Promise.all([
    supabase.from('admin_profiles').select('id, full_name, employee_id').eq('id', userId).maybeSingle(),
    supabase.from('hr_staff').select('id, full_name, employee_id, permissions, active, must_change_password').eq('id', userId).maybeSingle(),
    supabase.from('terrain_profiles').select('id, full_name, role, active, employee_id').eq('id', userId).maybeSingle(),
    supabase.from('sales_agent_profiles').select('id, full_name, is_active, employee_id').eq('id', userId).maybeSingle(),
  ]);

  const a = admin.data as any;
  const h = hr.data as any;
  const t = terrain.data as any;
  const s = sales.data as any;

  const employeeId: string | null = a?.employee_id || h?.employee_id || t?.employee_id || s?.employee_id || null;
  let matricule: string | null = null;
  let employeeName: string | null = null;
  if (employeeId) {
    const { data: emp } = await supabase
      .from('career_employees')
      .select('matricule, first_name, last_name')
      .eq('id', employeeId)
      .maybeSingle();
    matricule = (emp as any)?.matricule ?? null;
    if (emp) employeeName = `${(emp as any).first_name} ${(emp as any).last_name}`.trim();
  }

  const kind: ActorKind = a ? 'admin' : h ? 'hr' : t ? 'terrain' : s ? 'sales_agent' : 'unknown';

  return {
    userId,
    email,
    kind,
    name: a?.full_name || h?.full_name || t?.full_name || s?.full_name || employeeName || email,
    employeeId,
    matricule,
    isAdmin: !!a,
    hr: h
      ? {
          active: !!h.active,
          permissions: (Array.isArray(h.permissions) ? h.permissions : []).filter((p: string) =>
            (HR_AREAS as string[]).includes(p),
          ) as HrArea[],
          mustChangePassword: !!h.must_change_password,
        }
      : null,
    terrainRole: t?.role ?? null,
    isSalesAgent: !!s,
  };
}

const ACCOUNT_TABLES = ['admin_profiles', 'hr_staff', 'terrain_profiles', 'sales_agent_profiles'] as const;

/**
 * Removes one platform account. The underlying login is deleted only when no
 * other platform still uses it (one person can be terrain + HR, etc.).
 */
export async function removePlatformAccount(
  supabase: SupabaseClient,
  table: (typeof ACCOUNT_TABLES)[number],
  userId: string,
): Promise<{ loginKept: boolean }> {
  const others = await Promise.all(
    ACCOUNT_TABLES.filter((t) => t !== table).map((t) => supabase.from(t).select('id').eq('id', userId).maybeSingle()),
  );
  if (others.some((r) => r.data)) {
    const { error } = await supabase.from(table).delete().eq('id', userId);
    if (error) throw error;
    return { loginKept: true };
  }
  const { error } = await supabase.auth.admin.deleteUser(userId); // cascades to the profile row
  if (error) throw error;
  return { loginKept: false };
}

/** Validates the bearer token and returns the user's full identity. */
export async function authenticateStaff(
  request: Request,
): Promise<{ ok: true; identity: StaffIdentity; supabase: SupabaseClient } | { ok: false; response: Response }> {
  const token = bearerToken(request);
  if (!token) return { ok: false, response: json({ error: 'Missing auth token' }, 401) };
  try {
    const supabase = getServiceClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return { ok: false, response: json({ error: 'Invalid or expired session' }, 401) };
    const identity = await loadStaffIdentity(supabase, user.id, user.email?.toLowerCase() ?? null);
    return { ok: true, identity, supabase };
  } catch {
    return { ok: false, response: json({ error: 'Auth check failed' }, 401) };
  }
}

/**
 * Gate for the careers / HR / payroll API. Admins always pass. HR portal
 * users pass when their account is active, their temporary password has
 * been changed, and they hold at least one of the requested areas.
 */
export async function requireHrAccess(
  request: Request,
  areas: HrArea | HrArea[],
): Promise<
  | { ok: true; userId: string; email: string | null; identity: StaffIdentity }
  | { ok: false; response: Response }
> {
  const auth = await authenticateStaff(request);
  if (!auth.ok) return auth;
  const { identity } = auth;
  if (identity.isAdmin) return { ok: true, userId: identity.userId, email: identity.email, identity };

  const hr = identity.hr;
  if (!hr) return { ok: false, response: json({ error: 'No HR access for this account' }, 403) };
  if (!hr.active) return { ok: false, response: json({ error: 'HR access is deactivated' }, 403) };
  if (hr.mustChangePassword) return { ok: false, response: json({ error: 'Please change your temporary password first', must_change_password: true }, 403) };

  const wanted = Array.isArray(areas) ? areas : [areas];
  if (!wanted.some((a) => hr.permissions.includes(a))) {
    return { ok: false, response: json({ error: `Your HR access does not include ${wanted.join(' / ')}` }, 403) };
  }
  return { ok: true, userId: identity.userId, email: identity.email, identity };
}
