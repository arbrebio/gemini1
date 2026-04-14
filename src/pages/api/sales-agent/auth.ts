export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function extractToken(request: Request): string | null {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7).trim();
}

/**
 * GET /api/sales-agent/auth
 * Validates the agent JWT and returns their profile + annual commission stats.
 *
 * Headers:
 *   Authorization: Bearer <access_token>
 *
 * Returns:
 *   { profile, commissionStats: { year, total_sales, validated_amount, commission_earned } }
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    const token = extractToken(request);
    if (!token) return json({ error: 'Missing token' }, 401);

    const supabase = getSupabaseAdmin();

    // Validate JWT
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return json({ error: 'Invalid or expired token' }, 401);

    // Fetch agent profile
    const { data: profile, error: profileErr } = await supabase
      .from('sales_agent_profiles')
      .select('*, career_employees(hired_at, job_title, department), must_change_password')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile) return json({ error: 'Agent not found' }, 404);
    if (!profile.is_active) return json({ error: 'Account suspended', suspended: true, reason: profile.suspended_reason }, 403);

    // Annual commission stats (validated sales only)
    const year = new Date().getFullYear();
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year + 1}-01-01`;

    const { data: salesData } = await supabase
      .from('sales_records')
      .select('total_amount, commission_rate, commission_amount, status')
      .eq('agent_id', user.id)
      .gte('created_at', yearStart)
      .lt('created_at', yearEnd);

    const stats = (salesData || []).reduce(
      (acc, s) => {
        acc.total_count++;
        if (s.status === 'validated') {
          acc.validated_count++;
          acc.validated_amount += Number(s.total_amount);
          acc.commission_earned += Number(s.commission_amount);
        } else if (s.status === 'pending') {
          acc.pending_count++;
        } else if (s.status === 'rejected') {
          acc.rejected_count++;
        }
        return acc;
      },
      { total_count: 0, validated_count: 0, pending_count: 0, rejected_count: 0, validated_amount: 0, commission_earned: 0 }
    );

    return json({
      profile: {
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        worker_id: profile.worker_id,
        phone: profile.phone,
        is_active: profile.is_active,
        must_change_password: profile.must_change_password ?? false,
        hired_at: profile.career_employees?.hired_at ?? null,
        job_title: profile.career_employees?.job_title ?? null,
      },
      commissionStats: { year, ...stats },
    });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};
