/**
 * Pure helpers that turn an API request into an activity-log entry.
 * No I/O here, so it is unit-tested (src/lib/__tests__/activityDescribe.test.ts).
 */

export type Portal = 'admin' | 'hr' | 'terrain' | 'sales' | 'system';

/** API prefixes whose calls are tracked, mapped to their default portal. */
const TRACKED: Array<[string, Portal]> = [
  ['/api/admin/', 'admin'],
  ['/api/hr/', 'hr'],
  ['/api/terrain/', 'terrain'],
  ['/api/sales-agent/', 'sales'],
  ['/api/activity/', 'system'],
];

export function trackedPortal(pathname: string): Portal | null {
  for (const [prefix, portal] of TRACKED) if (pathname.startsWith(prefix)) return portal;
  return null;
}

/** GET endpoints that expose sensitive data: reading them is logged too. */
const SENSITIVE_GETS = [
  '/api/admin/careers/payroll-slips',
  '/api/admin/careers/payroll-profiles',
  '/api/admin/careers/payroll-settings',
  '/api/admin/activity',
  '/api/admin/hr-staff',
];

export function isSensitiveGet(pathname: string, search: URLSearchParams): boolean {
  const p = pathname.replace(/\/$/, '');
  if (SENSITIVE_GETS.includes(p)) return true;
  // Opening one employee's full record (ID card, contract, …).
  if (p === '/api/admin/careers/employees' && search.has('id')) return true;
  return false;
}

/** GET endpoints that mean "this person just signed in to a portal". */
const LOGIN_GETS: Record<string, Portal> = {
  '/api/terrain/login': 'terrain',
};

export function loginPortal(method: string, pathname: string): Portal | null {
  if (method !== 'GET') return null;
  return LOGIN_GETS[pathname.replace(/\/$/, '')] ?? null;
}

const RESOURCE_LABELS: Record<string, string> = {
  // careers / HR / payroll
  'careers.employees': 'employee',
  'careers.applications': 'job application',
  'careers.jobs': 'job posting',
  'careers.payroll-slips': 'payslips',
  'careers.payroll-profiles': 'payroll profile',
  'careers.payroll-settings': 'payroll settings',
  'careers.payroll-logo': 'payroll logo',
  'careers.upload-asset': 'employee document',
  'careers.scan-id': 'ID card scan',
  // admin
  'hr-staff': 'HR portal access',
  'staff-directory': 'staff account link',
  'activity': 'activity log',
  'terrain-users': 'terrain account',
  'sales-agents': 'sales agent',
  'sales': 'sale',
  'customers': 'customer',
  'products': 'product',
  'orders': 'order',
  'projects': 'project',
  'suppliers': 'supplier',
  'blog': 'blog post',
  'blog-presign': 'blog media',
  'settings': 'settings',
  'notifications': 'notifications',
  'whatsapp': 'WhatsApp message',
  'upload-asset': 'image',
  'agent-documents': 'agent document',
  'agent-documents-presign': 'agent document',
  // terrain
  'users': 'terrain account',
  'visits': 'site visit',
  'tasks': 'task',
  'task-comments': 'task comment',
  'task-photos': 'task photo',
  'upload': 'photo',
  'profile': 'profile',
  'forgot-password': 'password reset request',
  // sales agent
  'upload-proof': 'payment proof',
  'upload-avatar': 'profile photo',
  'invoice': 'invoice',
  'documents': 'documents',
  'inventory': 'inventory',
  'categories': 'categories',
};

const VERBS: Record<string, string> = { POST: 'Created', PUT: 'Updated', PATCH: 'Updated', DELETE: 'Deleted', GET: 'Viewed' };
const VERB_KEYS: Record<string, string> = { POST: 'create', PUT: 'update', PATCH: 'update', DELETE: 'delete', GET: 'view' };

/** "/api/admin/careers/payroll-slips/" → "careers.payroll-slips" */
export function resourceKey(pathname: string): string {
  const parts = pathname.replace(/^\/api\//, '').replace(/\/$/, '').split('/').filter(Boolean);
  parts.shift(); // admin | hr | terrain | sales-agent | activity
  return parts.join('.') || 'root';
}

function humanize(s: string): string {
  const t = s.replace(/[-_]+/g, ' ').trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export interface Described {
  action: string;
  summary: string;
}

export function describe(method: string, pathname: string, body: Record<string, unknown> | undefined, status: number): Described {
  const resource = resourceKey(pathname);
  const label = RESOURCE_LABELS[resource] ?? RESOURCE_LABELS[resource.split('.').pop() || ''] ?? humanize(resource.replace(/\./g, ' '));
  const scope = pathname.split('/')[2] || 'api';

  if (status === 403) return { action: `${scope}.${resource}.denied`, summary: `Access denied — ${label}` };
  if (resource === 'login' || resource === 'session') return { action: `${scope}.login`, summary: 'Signed in' };
  if (resource === 'change-password' || resource.endsWith('.change-password')) {
    return { action: `${scope}.password.change`, summary: 'Changed own password' };
  }

  const custom = typeof body?.action === 'string' ? String(body.action).slice(0, 40) : '';
  if (custom) {
    return { action: `${scope}.${resource}.${custom.replace(/[^a-z0-9_-]/gi, '')}`, summary: `${humanize(custom)} — ${label}` };
  }
  const verb = VERBS[method] ?? method;
  return { action: `${scope}.${resource}.${VERB_KEYS[method] ?? method.toLowerCase()}`, summary: `${verb} ${label}` };
}

/**
 * Keys copied from request bodies / query strings into the log. Anything not
 * listed (passwords, tokens, salaries, bank accounts, free text, …) is dropped.
 */
const SAFE_KEYS = new Set([
  'action', 'id', 'ids', 'employee_id', 'agent_id', 'project_id', 'task_id', 'user_id', 'visit_id',
  'application_id', 'job_id', 'slip_id', 'slip_ids', 'sale_id', 'customer_id', 'product_id', 'order_id',
  'status', 'type', 'role', 'title', 'name', 'full_name', 'email', 'first_name', 'last_name',
  'job_title', 'department', 'permissions', 'year', 'month', 'period_year', 'period_month',
  'active', 'is_active', 'category', 'matricule', 'portal', 'account_type', 'account_id', 'folder',
  'file_name', 'contract_type', 'start_date', 'quantity', 'payment_method',
]);

function safeValue(v: unknown): unknown {
  if (v === null || typeof v === 'boolean' || typeof v === 'number') return v;
  if (typeof v === 'string') return v.length > 160 ? v.slice(0, 160) + '…' : v;
  if (Array.isArray(v)) return v.slice(0, 25).map((x) => (typeof x === 'object' && x !== null ? '[object]' : safeValue(x)));
  return undefined;
}

export function pickSafe(source: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!source || typeof source !== 'object' || Array.isArray(source)) return out;
  for (const [k, v] of Object.entries(source as Record<string, unknown>)) {
    if (!SAFE_KEYS.has(k)) continue;
    const sv = safeValue(v);
    if (sv !== undefined) out[k] = sv;
  }
  return out;
}

export function entityIdFrom(details: Record<string, unknown>): string | null {
  for (const k of ['id', 'employee_id', 'slip_id', 'application_id', 'job_id', 'user_id', 'agent_id', 'project_id', 'task_id', 'sale_id', 'account_id']) {
    const v = details[k];
    if (typeof v === 'string' && v) return v.slice(0, 80);
  }
  const ids = details.slip_ids ?? details.ids;
  if (Array.isArray(ids) && ids.length) return ids.slice(0, 5).join(',').slice(0, 200);
  return null;
}

/** Reads the `sub`/`email` claims of a JWT without verifying it. Only used
 *  for logging AFTER the route handler has already verified the token. */
export function jwtClaims(token: string | null): { sub: string | null; email: string | null } {
  if (!token) return { sub: null, email: null };
  try {
    const payload = token.split('.')[1];
    if (!payload) return { sub: null, email: null };
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const claims = JSON.parse(atob(b64));
    const sub = typeof claims.sub === 'string' && /^[0-9a-f-]{36}$/i.test(claims.sub) ? claims.sub : null;
    return { sub, email: typeof claims.email === 'string' ? claims.email.toLowerCase() : null };
  } catch {
    return { sub: null, email: null };
  }
}
