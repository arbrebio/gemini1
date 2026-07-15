export const prerender = false;

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

function isMissingTable(e: any): boolean {
  return e?.code === '42P01' || e?.code === 'PGRST205' || /could not find the table/i.test(String(e?.message || ''));
}

async function authenticate(request: Request) {
  const token = extractToken(request);
  if (!token) return { ok: false as const, response: json({ error: 'Missing token' }, 401) };

  const supabase = getSupabaseAdmin();
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return { ok: false as const, response: json({ error: 'Invalid or expired token' }, 401) };

  const { data: profile, error: profileErr } = await supabase
    .from('sales_agent_profiles')
    .select('id, is_active')
    .eq('id', user.id)
    .single();
  if (profileErr || !profile) return { ok: false as const, response: json({ error: 'Agent not found' }, 404) };
  if (!profile.is_active) return { ok: false as const, response: json({ error: 'Account suspended' }, 403) };

  return { ok: true as const, supabase, agentId: user.id };
}

/**
 * GET /api/sales-agent/notifications
 *   ?limit=15        — number of notifications to return (default 15, max 50)
 *   ?count_only=true — return only { unread_count } (for polling)
 *
 * PUT /api/sales-agent/notifications
 *   Body: { id, is_read: true }   — mark single notification read
 *   Body: { mark_all_read: true } — mark all of this agent's notifications read
 */
export const GET: APIRoute = async ({ request, url }) => {
  const auth = await authenticate(request);
  if (!auth.ok) return auth.response;
  try {
    const { supabase, agentId } = auth;
    const countOnly = url.searchParams.get('count_only') === 'true';
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') ?? '15')));

    if (countOnly) {
      const { count } = await supabase
        .from('agent_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', agentId)
        .eq('is_read', false);
      return json({ unread_count: count ?? 0 });
    }

    const { data, error } = await supabase
      .from('agent_notifications')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      // Table not created yet (migration pending) — degrade gracefully
      // instead of breaking the whole portal header over a missing feature.
      if (isMissingTable(error)) return json({ notifications: [], unread_count: 0 });
      throw error;
    }

    const { count: unreadCount } = await supabase
      .from('agent_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', agentId)
      .eq('is_read', false);

    return json({ notifications: data ?? [], unread_count: unreadCount ?? 0 });
  } catch (e: any) {
    console.error('API error:', e);
    return json({ error: 'Internal server error' }, 500);
  }
};

export const PUT: APIRoute = async ({ request }) => {
  const auth = await authenticate(request);
  if (!auth.ok) return auth.response;
  try {
    const { supabase, agentId } = auth;
    const body = await request.json();

    if (body.mark_all_read) {
      const { error } = await supabase
        .from('agent_notifications')
        .update({ is_read: true })
        .eq('agent_id', agentId)
        .eq('is_read', false);
      if (error) throw error;
      return json({ success: true });
    }

    if (body.id) {
      const { error } = await supabase
        .from('agent_notifications')
        .update({ is_read: !!body.is_read })
        .eq('id', body.id)
        .eq('agent_id', agentId);
      if (error) throw error;
      return json({ success: true });
    }

    return json({ error: 'id or mark_all_read is required' }, 400);
  } catch (e: any) {
    console.error('API error:', e);
    return json({ error: 'Internal server error' }, 500);
  }
};
