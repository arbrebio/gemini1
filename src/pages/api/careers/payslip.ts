export const prerender = false;

// Employee-facing payslip fetch, authenticated with the careers portal
// credentials (portal e-mail + reference token). Only validated slips
// belonging to the authenticated employee are returned.

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { globalRateLimiter, getClientIp } from '../../../lib/securityHeaders';

function getSupabase() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!globalRateLimiter.isAllowed(getClientIp(request))) {
      return json({ error: 'Too many requests. Please try again later.' }, 429);
    }

    const supabase = getSupabase();
    const { email, token, slip_id } = await request.json();
    if (typeof email !== 'string' || typeof token !== 'string' || typeof slip_id !== 'string' || !email || !token || !slip_id) {
      return json({ error: 'email, token and slip_id are required.' }, 400);
    }

    const { data: application, error } = await supabase
      .from('career_applications')
      .select('id, employee_id')
      .eq('portal_token', token.trim())
      .eq('portal_email', email.trim().toLowerCase())
      .single();
    if (error || !application?.employee_id) {
      return json({ error: 'Invalid credentials.' }, 401);
    }

    const { data: slip, error: slipError } = await supabase
      .from('payroll_slips')
      .select('*')
      .eq('id', slip_id)
      .eq('employee_id', application.employee_id)
      .eq('status', 'validated')
      .single();
    if (slipError || !slip) {
      return json({ error: 'Bulletin introuvable.' }, 404);
    }

    return json({ slip });
  } catch {
    return json({ error: 'Server error.' }, 500);
  }
};
