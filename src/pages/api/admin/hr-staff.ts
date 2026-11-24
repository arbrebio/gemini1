export const prerender = false;

/**
 * HR & Payroll portal access, managed by an admin.
 *
 * GET    /api/admin/hr-staff                → { staff, employees }
 * POST   /api/admin/hr-staff                → grant access { employee_id?, full_name, email, permissions[] }
 * PUT    /api/admin/hr-staff                → { id, permissions?, active?, employee_id?, full_name? }
 *                                            or { id, action: 'reset-password' }
 * DELETE /api/admin/hr-staff                → { id } revoke access
 *
 * A person who already has another platform account (terrain, sales…)
 * keeps the same login: HR access is added to that account.
 */

import type { APIRoute } from 'astro';
import { randomBytes, randomInt } from 'node:crypto';
import { requireAdminAuth } from '../../../lib/adminAuth';
import { getServiceClient, json, HR_AREAS, type HrArea } from '../../../lib/staff';

const FROM_ADDRESS = 'Arbre Bio Africa <farms@newsletter.arbrebio.com>';
const PORTAL_URL = 'https://www.arbrebio.com/hr/login/';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function genTempPassword(): string {
  const chars = randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 9);
  return 'HR' + chars + randomInt(10, 100);
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

const AREA_LABELS: Record<HrArea, string> = {
  recruitment: 'Recrutement (offres et candidatures)',
  employees: 'Employés (dossiers, contrats, pièces d’identité)',
  payroll: 'Paie (profils de paie, bulletins)',
};

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const key = import.meta.env.RESEND_API_KEY;
  if (!key) return;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_ADDRESS, to: [to], subject, html }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}`);
}

function accessEmail(name: string, email: string, permissions: HrArea[], tempPassword: string | null, isReset = false): string {
  const areas = permissions.map((p) => `<li>${AREA_LABELS[p]}</li>`).join('');
  const credentials = tempPassword
    ? `<div style="background:#f0f9f0;border:1px solid #c6e8c6;border-radius:8px;padding:16px;margin:20px 0">
         <p style="margin:0 0 8px"><strong>E-mail :</strong> ${esc(email)}</p>
         <p style="margin:0"><strong>Mot de passe temporaire :</strong> <span style="font-family:monospace;font-size:16px;color:#194642">${esc(tempPassword)}</span></p>
       </div>
       <p>Vous devrez choisir un nouveau mot de passe à la première connexion.</p>`
    : `<p>Connectez-vous avec votre adresse <strong>${esc(email)}</strong> et votre mot de passe habituel Arbre Bio.</p>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;color:#333;line-height:1.6">
  <div style="max-width:600px;margin:0 auto;padding:24px">
    <h2 style="color:#194642">${isReset ? 'Votre mot de passe RH a été réinitialisé' : 'Accès au portail RH &amp; Paie'}</h2>
    <p>Bonjour ${esc(name)},</p>
    <p>${isReset ? 'Un administrateur a réinitialisé votre mot de passe.' : 'Un administrateur vous a donné accès au portail RH &amp; Paie d’Arbre Bio Africa pour :'}</p>
    ${isReset ? '' : `<ul>${areas}</ul>`}
    ${credentials}
    <p><a href="${PORTAL_URL}" style="display:inline-block;background:#194642;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Ouvrir le portail RH</a></p>
    <p style="font-size:12px;color:#888">Toutes les actions effectuées sur le portail sont enregistrées.</p>
    <p>Cordialement,<br>Arbre Bio Africa</p>
  </div></body></html>`;
}

/** Exact, case-insensitive email match for .ilike() (escapes % and _). */
function likeExact(email: string): string {
  return email.replace(/[\\%_]/g, (c) => '\\' + c);
}

function cleanPermissions(input: unknown): HrArea[] | null {
  if (!Array.isArray(input)) return null;
  const out = [...new Set(input.filter((p): p is HrArea => (HR_AREAS as string[]).includes(p)))];
  return out.length ? out : null;
}

/** Finds an existing auth user by email through our own profile tables. */
async function existingUserIdByEmail(supabase: ReturnType<typeof getServiceClient>, email: string): Promise<string | null> {
  const tables = ['terrain_profiles', 'sales_agent_profiles', 'hr_staff'];
  for (const t of tables) {
    const { data } = await supabase.from(t).select('id').ilike('email', likeExact(email)).maybeSingle();
    if (data?.id) return data.id;
  }
  // Fall back to scanning auth users (small org: a few pages at most).
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data?.users?.length) break;
    const hit = data.users.find((u) => u.email?.toLowerCase() === email);
    if (hit) return hit.id;
    if (data.users.length < 200) break;
  }
  return null;
}

export const GET: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getServiceClient();
    const [{ data: staff, error }, { data: employees, error: empErr }] = await Promise.all([
      supabase.from('hr_staff')
        .select('id, full_name, email, permissions, active, must_change_password, last_login_at, created_at, employee_id, employee:career_employees(matricule, job_title, department)')
        .order('created_at', { ascending: false }),
      supabase.from('career_employees')
        .select('id, matricule, first_name, last_name, email, job_title, department, status')
        .order('last_name'),
    ]);
    if (error) throw error;
    if (empErr) throw empErr;
    return json({ staff: staff || [], employees: employees || [] });
  } catch (e) {
    console.error('[admin hr-staff GET]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getServiceClient();
    const body = await request.json().catch(() => ({}));
    const permissions = cleanPermissions(body.permissions);
    if (!permissions) return json({ error: 'Choose at least one area: recruitment, employees or payroll' }, 400);

    let employeeId: string | null = typeof body.employee_id === 'string' && UUID_RE.test(body.employee_id) ? body.employee_id : null;
    let fullName = String(body.full_name || '').trim();
    let email = String(body.email || '').trim().toLowerCase();

    if (employeeId) {
      const { data: emp } = await supabase.from('career_employees')
        .select('id, first_name, last_name, email').eq('id', employeeId).maybeSingle();
      if (!emp) return json({ error: 'Employee not found' }, 404);
      fullName ||= `${emp.first_name} ${emp.last_name}`.trim();
      email ||= String(emp.email || '').toLowerCase();
    }
    if (!fullName) return json({ error: 'Full name is required' }, 400);
    if (!EMAIL_RE.test(email)) return json({ error: 'A valid email is required' }, 400);

    const { data: dup } = await supabase.from('hr_staff').select('id').ilike('email', likeExact(email)).maybeSingle();
    if (dup) return json({ error: 'This person already has HR portal access' }, 409);

    // New login, or reuse the person's existing Arbre Bio login.
    let tempPassword: string | null = genTempPassword();
    let userId: string | null = null;
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email, password: tempPassword, email_confirm: true,
    });
    if (created?.user) {
      userId = created.user.id;
    } else {
      userId = await existingUserIdByEmail(supabase, email);
      if (!userId) return json({ error: createErr?.message || 'Could not create the login' }, 400);
      tempPassword = null; // keeps their current password
    }

    // An admin account is already allowed everywhere; don't create a weaker duplicate.
    const { data: isAdmin } = await supabase.from('admin_profiles').select('id').eq('id', userId).maybeSingle();
    if (isAdmin) return json({ error: 'This person is an admin and already has full HR access' }, 409);

    const { data: row, error: insErr } = await supabase.from('hr_staff').insert({
      id: userId,
      employee_id: employeeId,
      full_name: fullName,
      email,
      permissions,
      active: true,
      must_change_password: tempPassword !== null,
      created_by: auth.userId,
    }).select('id, full_name, email, permissions, active, must_change_password, created_at, employee_id').single();

    if (insErr) {
      if (tempPassword !== null) await supabase.auth.admin.deleteUser(userId);
      if ((insErr as any).code === '23505') return json({ error: 'This employee is already linked to another HR account' }, 409);
      throw insErr;
    }

    let emailed = true;
    await sendEmail(email, 'Accès au portail RH & Paie — Arbre Bio Africa', accessEmail(fullName, email, permissions, tempPassword))
      .catch((e) => { emailed = false; console.error('[hr-staff] email failed', e); });

    return json({ staff: row, emailed, reused_existing_login: tempPassword === null }, 201);
  } catch (e) {
    console.error('[admin hr-staff POST]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};

export const PUT: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getServiceClient();
    const body = await request.json().catch(() => ({}));
    const id = typeof body.id === 'string' && UUID_RE.test(body.id) ? body.id : null;
    if (!id) return json({ error: 'id required' }, 400);

    const { data: current } = await supabase.from('hr_staff').select('id, full_name, email, permissions').eq('id', id).maybeSingle();
    if (!current) return json({ error: 'HR account not found' }, 404);

    if (body.action === 'reset-password') {
      const temp = genTempPassword();
      const { error } = await supabase.auth.admin.updateUserById(id, { password: temp });
      if (error) throw error;
      await supabase.from('hr_staff').update({ must_change_password: true }).eq('id', id);
      let emailed = true;
      await sendEmail(current.email, 'Mot de passe RH réinitialisé — Arbre Bio Africa',
        accessEmail(current.full_name, current.email, current.permissions, temp, true))
        .catch((e) => { emailed = false; console.error('[hr-staff] reset email failed', e); });
      return json({ ok: true, emailed });
    }

    const updates: Record<string, unknown> = {};
    if ('permissions' in body) {
      const p = cleanPermissions(body.permissions);
      if (!p) return json({ error: 'Choose at least one area' }, 400);
      updates.permissions = p;
    }
    if ('active' in body) updates.active = !!body.active;
    if ('full_name' in body && String(body.full_name).trim()) updates.full_name = String(body.full_name).trim();
    if ('employee_id' in body) {
      updates.employee_id = typeof body.employee_id === 'string' && UUID_RE.test(body.employee_id) ? body.employee_id : null;
    }
    if (!Object.keys(updates).length) return json({ error: 'Nothing to update' }, 400);

    const { data: row, error } = await supabase.from('hr_staff').update(updates).eq('id', id)
      .select('id, full_name, email, permissions, active, must_change_password, employee_id').single();
    if (error) {
      if ((error as any).code === '23505') return json({ error: 'This employee is already linked to another HR account' }, 409);
      throw error;
    }
    return json({ staff: row });
  } catch (e) {
    console.error('[admin hr-staff PUT]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getServiceClient();
    const body = await request.json().catch(() => ({}));
    const id = typeof body.id === 'string' && UUID_RE.test(body.id) ? body.id : null;
    if (!id) return json({ error: 'id required' }, 400);

    const { error } = await supabase.from('hr_staff').delete().eq('id', id);
    if (error) throw error;

    // Remove the login itself only if no other platform still uses it.
    const others = await Promise.all(['admin_profiles', 'terrain_profiles', 'sales_agent_profiles'].map((t) =>
      supabase.from(t).select('id').eq('id', id).maybeSingle()));
    if (!others.some((r) => r.data)) await supabase.auth.admin.deleteUser(id).catch(() => {});
    return json({ ok: true });
  } catch (e) {
    console.error('[admin hr-staff DELETE]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};
