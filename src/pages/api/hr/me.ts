export const prerender = false;

import type { APIRoute } from 'astro';
import { authenticateStaff, json, HR_AREAS } from '../../../lib/staff';

/**
 * GET /api/hr/me — who is signed in to the HR & Payroll portal.
 * Admins get every area; HR staff get the areas the admin granted them.
 * 403 for accounts with no (or deactivated) HR access.
 */
export const GET: APIRoute = async ({ request }) => {
  const auth = await authenticateStaff(request);
  if (!auth.ok) return auth.response;
  const { identity } = auth;

  if (identity.isAdmin) {
    return json({
      kind: 'admin',
      name: identity.name,
      email: identity.email,
      matricule: identity.matricule,
      permissions: HR_AREAS,
      must_change_password: false,
    });
  }
  if (!identity.hr) return json({ error: 'This account has no HR portal access.' }, 403);
  if (!identity.hr.active) return json({ error: 'Your HR portal access has been deactivated.', deactivated: true }, 403);

  return json({
    kind: 'hr',
    name: identity.name,
    email: identity.email,
    matricule: identity.matricule,
    permissions: identity.hr.permissions,
    must_change_password: identity.hr.mustChangePassword,
  });
};
