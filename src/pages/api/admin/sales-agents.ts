export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../../../lib/agentEmail';

function getSupabase() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role not configured');
  return createClient(url, key);
}

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * GET /api/admin/sales-agents
 *   Returns all sales agent profiles with sales counts.
 *
 * POST /api/admin/sales-agents
 *   { full_name, email, password, employee_id?, phone? }
 *   Creates a Supabase auth user + sales_agent_profiles row.
 *   Returns the new profile (NEVER returns the plain-text password again).
 *
 * PUT /api/admin/sales-agents
 *   { id, action: 'suspend' | 'activate', reason? }
 *   Toggles agent active status.
 *   OR { id, full_name?, phone? } — update profile fields
 *
 * DELETE /api/admin/sales-agents
 *   { id }
 *   Deletes the Supabase auth user (profile cascades).
 */

export const GET: APIRoute = async () => {
  try {
    const supabase = getSupabase();

    const { data: agents, error } = await supabase
      .from('sales_agent_profiles')
      .select(`
        id, full_name, email, worker_id, phone, is_active,
        suspended_at, suspended_reason, created_at,
        must_change_password, temp_password,
        career_employees(first_name, last_name, job_title, department, hired_at)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Attach sales counts per agent
    const agentIds = (agents || []).map(a => a.id);
    let salesCounts: Record<string, { total: number; validated: number; pending: number; commission: number }> = {};

    if (agentIds.length > 0) {
      const year = new Date().getFullYear();
      const { data: sales } = await supabase
        .from('sales_records')
        .select('agent_id, status, commission_amount')
        .in('agent_id', agentIds)
        .gte('created_at', `${year}-01-01`)
        .lt('created_at', `${year + 1}-01-01`);

      for (const s of sales || []) {
        if (!salesCounts[s.agent_id]) {
          salesCounts[s.agent_id] = { total: 0, validated: 0, pending: 0, commission: 0 };
        }
        salesCounts[s.agent_id].total++;
        if (s.status === 'validated') {
          salesCounts[s.agent_id].validated++;
          salesCounts[s.agent_id].commission += Number(s.commission_amount);
        } else if (s.status === 'pending') {
          salesCounts[s.agent_id].pending++;
        }
      }
    }

    const result = (agents || []).map(a => ({
      ...a,
      sales_ytd: salesCounts[a.id] || { total: 0, validated: 0, pending: 0, commission: 0 },
    }));

    return json({ agents: result });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { full_name, email, password, employee_id, phone } = body;

    if (!full_name?.trim()) return json({ error: 'full_name is required' }, 400);
    if (!email?.trim()) return json({ error: 'email is required' }, 400);
    if (!password || password.length < 8) return json({ error: 'password must be at least 8 characters' }, 400);

    // Create Supabase auth user
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true, // Auto-confirm so they can log in immediately
    });

    if (authErr || !authData.user) {
      return json({ error: authErr?.message || 'Failed to create auth user' }, 400);
    }

    const userId = authData.user.id;

    // Fetch worker_id from employee if linked
    let worker_id: string | null = null;
    if (employee_id) {
      const { data: emp } = await supabase
        .from('career_employees')
        .select('worker_id')
        .eq('id', employee_id)
        .single();
      worker_id = emp?.worker_id ?? null;
    }

    // Insert sales_agent_profiles row
    const { data: profile, error: profileErr } = await supabase
      .from('sales_agent_profiles')
      .insert({
        id: userId,
        full_name: full_name.trim(),
        email: email.trim().toLowerCase(),
        employee_id: employee_id || null,
        phone: phone?.trim() || null,
        worker_id,
        is_active: true,
        must_change_password: true,
        temp_password: password, // stored until agent sets their own password
      })
      .select()
      .single();

    if (profileErr) {
      // Rollback: delete the auth user
      await supabase.auth.admin.deleteUser(userId);
      throw profileErr;
    }

    // Send welcome email with credentials (non-blocking)
    sendWelcomeEmail({
      to: email.trim().toLowerCase(),
      full_name: full_name.trim(),
      temp_password: password,
    }).catch((e) => console.error('[agentEmail] welcome email failed:', e));

    return json({ profile }, 201);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { id, action, reason, ...rest } = body;

    if (!id) return json({ error: 'id is required' }, 400);

    // Suspend / activate
    if (action === 'suspend' || action === 'activate') {
      const update: Record<string, any> = {
        is_active: action === 'activate',
      };
      if (action === 'suspend') {
        update.suspended_at = new Date().toISOString();
        update.suspended_reason = reason?.trim() || null;
      } else {
        update.suspended_at = null;
        update.suspended_reason = null;
      }

      const { data, error } = await supabase
        .from('sales_agent_profiles')
        .update(update)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return json({ profile: data });
    }

    // Reset password — admin generates a new temp password
    if (action === 'reset-password') {
      const { new_password } = body as { new_password?: string };
      if (!new_password || new_password.length < 8) {
        return json({ error: 'new_password must be at least 8 characters' }, 400);
      }

      // Update Supabase Auth password
      const { error: pwErr } = await supabase.auth.admin.updateUserById(id, {
        password: new_password,
      });
      if (pwErr) throw pwErr;

      // Store temp_password + flag must_change_password
      const { data, error: profileErr } = await supabase
        .from('sales_agent_profiles')
        .update({ must_change_password: true, temp_password: new_password })
        .eq('id', id)
        .select('email, full_name')
        .single();
      if (profileErr) throw profileErr;

      // Email agent their new credentials
      sendPasswordResetEmail({
        to: data.email,
        full_name: data.full_name,
        temp_password: new_password,
      }).catch((e) => console.error('[agentEmail] reset email failed:', e));

      return json({ success: true });
    }

    // General profile field update
    const allowed = ['full_name', 'phone', 'worker_id'];
    const safe: Record<string, any> = {};
    for (const k of allowed) {
      if (k in rest) safe[k] = rest[k];
    }

    if (Object.keys(safe).length === 0) {
      return json({ error: 'No updatable fields provided' }, 400);
    }

    const { data, error } = await supabase
      .from('sales_agent_profiles')
      .update(safe)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return json({ profile: data });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    if (!body.id) return json({ error: 'id is required' }, 400);

    // Delete Supabase auth user — this cascades to sales_agent_profiles
    const { error } = await supabase.auth.admin.deleteUser(body.id);
    if (error) throw error;

    return json({ success: true });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};
