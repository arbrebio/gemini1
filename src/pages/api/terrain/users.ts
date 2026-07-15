export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { requireTerrainAuth } from '../../../lib/terrainAuth';

const FROM_ADDRESS = 'Arbre Bio Africa <farms@newsletter.arbrebio.com>';

function getSupabase() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const resendKey = import.meta.env.RESEND_API_KEY;
  if (!resendKey) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_ADDRESS, to: [to], subject, html }),
  });
}

function credentialsEmailHtml(full_name: string, email: string, temp_password: string, isReset: boolean): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;color:#333;line-height:1.6">
    <div style="max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#194642">${isReset ? 'Votre mot de passe a été réinitialisé' : 'Bienvenue sur la Plateforme Terrain'}</h2>
      <p>Bonjour ${full_name},</p>
      <p>${isReset ? 'Un administrateur a réinitialisé votre mot de passe.' : 'Un compte a été créé pour vous sur la Plateforme Terrain Arbre Bio Africa.'} Voici vos identifiants :</p>
      <div style="background:#f0f9f0;border:1px solid #c6e8c6;border-radius:8px;padding:16px;margin:20px 0">
        <p style="margin:0 0 8px"><strong>E-mail :</strong> ${email}</p>
        <p style="margin:0"><strong>Mot de passe temporaire :</strong> <span style="font-family:monospace;font-size:16px;color:#194642">${temp_password}</span></p>
      </div>
      <p>Connectez-vous sur <a href="https://arbrebio.com/terrain/login/" style="color:#194642">arbrebio.com/terrain/login/</a> — vous devrez choisir un nouveau mot de passe à la première connexion.</p>
      <p>Cordialement,<br>Arbre Bio Africa</p>
    </div>
  </body></html>`;
}

function genTempPassword(): string {
  return 'AB' + Math.random().toString(36).slice(2, 8) + Math.floor(Math.random() * 90 + 10);
}

/**
 * GET /api/terrain/users — list all Terrain accounts (super_admin only).
 * POST /api/terrain/users — create a new account { full_name, email, role, phone? }.
 * PUT /api/terrain/users — { id, action: 'reset-password' | 'toggle-active' } or
 *                           { id, full_name?, role?, phone? } for a general field update.
 * DELETE /api/terrain/users — { id } — permanently removes the account.
 */
export const GET: APIRoute = async ({ request }) => {
  const auth = await requireTerrainAuth(request, ['super_admin']);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();
    const { data: users, error } = await supabase
      .from('terrain_profiles')
      .select('id, full_name, email, role, phone, avatar_url, active, must_change_password, created_at')
      .neq('role', 'super_admin')
      .order('created_at', { ascending: false });
    if (error) throw error;

    const { data: resetRequests } = await supabase
      .from('terrain_password_reset_requests')
      .select('user_id, requested_at');

    const pendingByUser = new Map((resetRequests || []).map(r => [r.user_id, r.requested_at]));
    const result = (users || []).map(u => ({ ...u, pending_reset_at: pendingByUser.get(u.id) || null }));

    return json({ users: result });
  } catch (e: any) {
    console.error('[terrain users GET]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  const auth = await requireTerrainAuth(request, ['super_admin']);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const full_name = String(body.full_name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const role = body.role;
    const phone = body.phone ? String(body.phone).trim() : null;

    if (!full_name) return json({ error: 'full_name is required' }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'A valid email is required' }, 400);
    if (!['engineer', 'technician'].includes(role)) return json({ error: 'role must be engineer or technician' }, 400);

    const temp_password = genTempPassword();

    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email, password: temp_password, email_confirm: true,
    });
    if (authErr || !authData.user) {
      return json({ error: authErr?.message || 'Failed to create account (email may already be in use)' }, 400);
    }

    const userId = authData.user.id;
    const { data: profile, error: profileErr } = await supabase
      .from('terrain_profiles')
      .insert({
        id: userId, full_name, email, role, phone,
        active: true, must_change_password: true,
        temp_password, created_by: auth.profile.id,
      })
      .select('id, full_name, email, role, phone, avatar_url, active, must_change_password, created_at')
      .single();

    if (profileErr) {
      await supabase.auth.admin.deleteUser(userId);
      throw profileErr;
    }

    sendEmail(email, 'Vos identifiants — Plateforme Terrain', credentialsEmailHtml(full_name, email, temp_password, false))
      .catch((e) => console.error('[terrain] welcome email failed:', e));

    return json({ user: profile, temp_password }, 201);
  } catch (e: any) {
    console.error('[terrain users POST]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};

export const PUT: APIRoute = async ({ request }) => {
  const auth = await requireTerrainAuth(request, ['super_admin']);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { id, action } = body;
    if (!id) return json({ error: 'id is required' }, 400);

    if (action === 'reset-password') {
      const temp_password = genTempPassword();
      const { error: pwErr } = await supabase.auth.admin.updateUserById(id, { password: temp_password });
      if (pwErr) throw pwErr;

      const { data: profile, error: profileErr } = await supabase
        .from('terrain_profiles')
        .update({ must_change_password: true, temp_password })
        .eq('id', id)
        .select('email, full_name')
        .single();
      if (profileErr) throw profileErr;

      // Password reset resolves any pending self-service reset request.
      await supabase.from('terrain_password_reset_requests').delete().eq('user_id', id);

      sendEmail(profile.email, 'Votre mot de passe a été réinitialisé — Plateforme Terrain', credentialsEmailHtml(profile.full_name, profile.email, temp_password, true))
        .catch((e) => console.error('[terrain] reset email failed:', e));

      return json({ success: true, temp_password });
    }

    if (action === 'toggle-active') {
      const { data: current } = await supabase.from('terrain_profiles').select('active').eq('id', id).single();
      const { data: profile, error } = await supabase
        .from('terrain_profiles')
        .update({ active: !current?.active })
        .eq('id', id)
        .select('id, full_name, email, role, phone, avatar_url, active, must_change_password, created_at')
        .single();
      if (error) throw error;
      return json({ user: profile });
    }

    // General field update
    const allowed = ['full_name', 'role', 'phone'];
    const safe: Record<string, any> = {};
    for (const k of allowed) if (k in body) safe[k] = body[k];
    if ('role' in safe && !['engineer', 'technician'].includes(safe.role)) {
      return json({ error: 'role must be engineer or technician' }, 400);
    }
    if (Object.keys(safe).length === 0) return json({ error: 'No updatable fields provided' }, 400);

    const { data: profile, error } = await supabase
      .from('terrain_profiles')
      .update(safe)
      .eq('id', id)
      .select('id, full_name, email, role, phone, avatar_url, active, must_change_password, created_at')
      .single();
    if (error) throw error;
    return json({ user: profile });
  } catch (e: any) {
    console.error('[terrain users PUT]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  const auth = await requireTerrainAuth(request, ['super_admin']);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();
    const body = await request.json();
    if (!body.id) return json({ error: 'id is required' }, 400);

    // Deleting the auth user cascades to terrain_profiles (ON DELETE CASCADE).
    const { error } = await supabase.auth.admin.deleteUser(body.id);
    if (error) throw error;
    return json({ success: true });
  } catch (e: any) {
    console.error('[terrain users DELETE]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};
