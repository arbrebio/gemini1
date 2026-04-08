export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

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
 * GET /api/admin/notifications
 *   ?limit=15        — number of notifications to return (default 15, max 50)
 *   ?count_only=true — return only { unread_count } (for polling)
 *
 * POST /api/admin/notifications
 *   Body: { type, message, entity_id?, entity_type? }
 *   Creates a new notification.
 *
 * PUT /api/admin/notifications
 *   Body: { id, is_read: true }   — mark single notification read
 *   Body: { mark_all_read: true } — mark all notifications read
 */

export const GET: APIRoute = async ({ url }) => {
  try {
    const supabase = getSupabase();
    const countOnly = url.searchParams.get('count_only') === 'true';
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') ?? '15')));

    if (countOnly) {
      const { count } = await supabase
        .from('admin_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);
      return json({ unread_count: count ?? 0 });
    }

    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const { count: unreadCount } = await supabase
      .from('admin_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    return json({ notifications: data ?? [], unread_count: unreadCount ?? 0 });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { type, message, entity_id, entity_type } = body;

    if (!message) return json({ error: 'message is required' }, 400);

    const { data, error } = await supabase
      .from('admin_notifications')
      .insert({
        type: type ?? 'default',
        message,
        entity_id: entity_id ?? null,
        entity_type: entity_type ?? null,
        is_read: false,
      })
      .select()
      .single();

    if (error) throw error;
    return json({ notification: data }, 201);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const supabase = getSupabase();
    const body = await request.json();

    if (body.mark_all_read) {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('is_read', false);
      if (error) throw error;
      return json({ success: true });
    }

    const { id, is_read } = body;
    if (!id) return json({ error: 'id is required' }, 400);

    const { data, error } = await supabase
      .from('admin_notifications')
      .update({ is_read: is_read ?? true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return json({ notification: data });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};
