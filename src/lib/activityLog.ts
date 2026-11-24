/**
 * Server-side activity recorder. Called from src/middleware.ts after an API
 * route has answered, so every portal is tracked without touching each
 * endpoint. Never throws and never changes the response.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { getServiceClient, loadStaffIdentity, type StaffIdentity } from './staff';
import { describe, entityIdFrom, type Portal } from './activityDescribe';

// Identity cache for logging only (auth checks never use it).
const CACHE_TTL_MS = 5 * 60 * 1000;
const identityCache = new Map<string, { value: StaffIdentity; expires: number }>();

let client: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (!client) client = getServiceClient();
  return client;
}

async function identityFor(userId: string, email: string | null): Promise<StaffIdentity | null> {
  const hit = identityCache.get(userId);
  if (hit && hit.expires > Date.now()) return hit.value;
  try {
    const value = await loadStaffIdentity(db(), userId, email);
    identityCache.set(userId, { value, expires: Date.now() + CACHE_TTL_MS });
    if (identityCache.size > 500) identityCache.delete(identityCache.keys().next().value as string);
    return value;
  } catch {
    return null;
  }
}

export interface ActivityInput {
  portal: Portal;
  method: string;
  path: string;
  status: number;
  userId: string | null;
  email: string | null;
  details: Record<string, unknown>;
  ip: string | null;
  userAgent: string | null;
  /** Override the generated summary/action (e.g. sign-ins). */
  forceSummary?: { action: string; summary: string };
}

export async function recordActivity(input: ActivityInput): Promise<void> {
  try {
    const who = input.userId ? await identityFor(input.userId, input.email) : null;

    // Careers endpoints are shared by the admin and HR portals: attribute
    // the entry to the portal the person actually used.
    let portal = input.portal;
    if (portal === 'admin' && input.path.startsWith('/api/admin/careers/') && who && !who.isAdmin && who.hr) portal = 'hr';
    if (portal === 'system' && typeof input.details.portal === 'string' &&
        ['admin', 'hr', 'terrain', 'sales'].includes(input.details.portal)) {
      portal = input.details.portal as Portal;
    }

    const { action, summary } = input.forceSummary ?? describe(input.method, input.path, input.details, input.status);

    await db().from('activity_log').insert({
      portal,
      actor_id: input.userId,
      actor_kind: who?.kind ?? 'unknown',
      actor_name: who?.name ?? input.email,
      actor_email: who?.email ?? input.email,
      actor_employee_id: who?.employeeId ?? null,
      actor_matricule: who?.matricule ?? null,
      action,
      summary,
      method: input.method,
      path: input.path.slice(0, 200),
      status: input.status,
      entity_id: entityIdFrom(input.details),
      details: input.details,
      ip: input.ip?.slice(0, 64) ?? null,
      user_agent: input.userAgent?.slice(0, 300) ?? null,
    });
  } catch (e) {
    console.error('[activity] failed to record', e);
  }
}

export function clientIp(request: Request): string | null {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip');
}
