export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { requireTerrainAuth } from '../../../lib/terrainAuth';

function getSupabase() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role not configured');
  return createClient(url, key);
}

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

/**
 * GET /api/terrain/projects            — list (scoped by role)
 * GET /api/terrain/projects?id=        — single project + its visits + task counts
 * POST /api/terrain/projects           — create directly (super_admin only; visits auto-create their own)
 * PUT /api/terrain/projects            — { id, ...fields } update (super_admin, or assigned engineer/technician for status only)
 */
export const GET: APIRoute = async ({ url, request }) => {
  const auth = await requireTerrainAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();
    const id = url.searchParams.get('id');
    const isAdmin = auth.profile.role === 'super_admin';

    if (id) {
      let query = supabase.from('terrain_projects').select('*, terrain_profiles!terrain_projects_assigned_to_fkey(id, full_name, role)').eq('id', id);
      if (!isAdmin) query = query.eq('assigned_to', auth.profile.id);
      const { data: project, error } = await query.single();
      if (error || !project) return json({ error: 'Project not found' }, 404);

      const { data: visits } = await supabase
        .from('terrain_visits')
        .select('id, status, client_name, zone, project_types, created_at, visited_by')
        .eq('project_id', id)
        .order('created_at', { ascending: false });

      const { data: taskCounts } = await supabase.from('terrain_tasks').select('status').eq('project_id', id);
      const counts = { todo: 0, in_progress: 0, review: 0, done: 0 };
      for (const t of taskCounts || []) counts[t.status as keyof typeof counts]++;

      return json({ project, visits: visits || [], task_counts: counts });
    }

    let query = supabase
      .from('terrain_projects')
      .select('*, terrain_profiles!terrain_projects_assigned_to_fkey(id, full_name, role)')
      .order('created_at', { ascending: false });
    if (!isAdmin) query = query.eq('assigned_to', auth.profile.id);

    const search = url.searchParams.get('search');
    if (search) query = query.or(`client_name.ilike.%${search}%,zone.ilike.%${search}%,location.ilike.%${search}%`);
    const type = url.searchParams.get('type');
    if (type) query = query.contains('project_types', [type]);

    const { data: projects, error } = await query;
    if (error) throw error;
    return json({ projects: projects || [] });
  } catch (e: any) {
    console.error('[terrain projects GET]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  const auth = await requireTerrainAuth(request, ['super_admin']);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const title = String(body.title || body.client_name || '').trim();
    const client_name = String(body.client_name || '').trim();
    if (!client_name) return json({ error: 'client_name is required' }, 400);

    const { data: project, error } = await supabase
      .from('terrain_projects')
      .insert({
        title: title || `Projet ${client_name}`,
        client_name,
        client_phone: body.client_phone || null,
        location: body.location || null,
        zone: body.zone || null,
        project_types: body.project_types || [],
        assigned_to: body.assigned_to || null,
        status: 'active',
      })
      .select().single();
    if (error) throw error;
    return json({ project }, 201);
  } catch (e: any) {
    console.error('[terrain projects POST]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};

export const PUT: APIRoute = async ({ request }) => {
  const auth = await requireTerrainAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { id } = body;
    if (!id) return json({ error: 'id is required' }, 400);

    const isAdmin = auth.profile.role === 'super_admin';
    const { data: existing } = await supabase.from('terrain_projects').select('assigned_to').eq('id', id).single();
    if (!existing) return json({ error: 'Project not found' }, 404);
    if (!isAdmin && existing.assigned_to !== auth.profile.id) return json({ error: 'Forbidden' }, 403);

    const allowedForAll = ['status'];
    const allowedForAdmin = ['title', 'client_name', 'client_phone', 'location', 'zone', 'assigned_to', 'status'];
    const allowed = isAdmin ? allowedForAdmin : allowedForAll;

    const safe: Record<string, any> = {};
    for (const k of allowed) if (k in body) safe[k] = body[k];
    if (safe.status === 'in_progress' && !safe.started_at) safe.started_at = new Date().toISOString();
    if (Object.keys(safe).length === 0) return json({ error: 'No updatable fields provided' }, 400);

    const { data: project, error } = await supabase
      .from('terrain_projects').update(safe).eq('id', id).select().single();
    if (error) throw error;
    return json({ project });
  } catch (e: any) {
    console.error('[terrain projects PUT]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};
