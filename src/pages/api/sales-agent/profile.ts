export const prerender = false;

/**
 * PUT /api/sales-agent/profile
 *
 * Lets a sales agent update their own display name (full_name).
 * Body: { full_name: string }
 *
 * Headers: Authorization: Bearer <access_token>
 */

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function json(body: unknown, status = 200) {
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

export const PUT: APIRoute = async ({ request }) => {
  try {
    const token = extractToken(request);
    if (!token) return json({ error: 'Missing token' }, 401);

    const supabase = getSupabaseAdmin();
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return json({ error: 'Invalid or expired token' }, 401);

    const body = await request.json().catch(() => null);
    if (!body) return json({ error: 'Invalid JSON body' }, 400);

    const full_name = String(body.full_name || '').trim();
    if (!full_name || full_name.length < 2) {
      return json({ error: 'full_name must be at least 2 characters' }, 400);
    }
    if (full_name.length > 120) {
      return json({ error: 'full_name is too long' }, 400);
    }

    const { data: profile, error } = await supabase
      .from('sales_agent_profiles')
      .update({ full_name })
      .eq('id', user.id)
      .select('id, full_name, email, worker_id, phone, avatar_url')
      .single();

    if (error) throw error;
    return json({ profile });
  } catch (e: any) {
    console.error('[sales-agent/profile]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};
