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

async function canAccessProject(supabase: any, profile: { id: string; role: string }, projectId: string): Promise<boolean> {
  if (profile.role === 'super_admin') return true;
  const { data } = await supabase.from('terrain_projects').select('assigned_to').eq('id', projectId).single();
  return data?.assigned_to === profile.id;
}

/**
 * GET /api/terrain/tasks?project_id=      — list tasks for a project (kanban board)
 * GET /api/terrain/tasks?id=              — single task + comments + photos
 * POST /api/terrain/tasks                 — create (super_admin only)
 * PUT /api/terrain/tasks                  — { id, ...fields } update, or { id, action:'complete' }
 * DELETE /api/terrain/tasks               — { id } (super_admin only)
 */
export const GET: APIRoute = async ({ url, request }) => {
  const auth = await requireTerrainAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();
    const id = url.searchParams.get('id');
    const projectId = url.searchParams.get('project_id');

    if (id) {
      const { data: task, error } = await supabase.from('terrain_tasks').select('*').eq('id', id).single();
      if (error || !task) return json({ error: 'Task not found' }, 404);
      if (!(await canAccessProject(supabase, auth.profile, task.project_id))) return json({ error: 'Forbidden' }, 403);

      const { data: comments } = await supabase
        .from('terrain_task_comments')
        .select('*, terrain_profiles(full_name)')
        .eq('task_id', id).order('created_at', { ascending: true });
      const { data: photos } = await supabase
        .from('terrain_task_photos')
        .select('*, terrain_profiles(full_name)')
        .eq('task_id', id).order('uploaded_at', { ascending: true });

      return json({ task: { ...task, comments: comments || [], photos: photos || [] } });
    }

    if (!projectId) return json({ error: 'project_id is required' }, 400);
    if (!(await canAccessProject(supabase, auth.profile, projectId))) return json({ error: 'Forbidden' }, 403);

    const { data: tasks, error } = await supabase
      .from('terrain_tasks').select('*').eq('project_id', projectId).order('created_at', { ascending: true });
    if (error) throw error;
    return json({ tasks: tasks || [] });
  } catch (e: any) {
    console.error('[terrain tasks GET]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  const auth = await requireTerrainAuth(request, ['super_admin']);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();
    const body = await request.json();
    if (!body.project_id) return json({ error: 'project_id is required' }, 400);
    if (!body.title?.trim()) return json({ error: 'title is required' }, 400);

    const { data: task, error } = await supabase
      .from('terrain_tasks')
      .insert({
        project_id: body.project_id,
        title: body.title.trim(),
        description: body.description || null,
        priority: body.priority || 'medium',
        category: body.category || null,
        due_date: body.due_date || null,
        status: body.status || 'todo',
        assignees: body.assignees || [],
      })
      .select().single();
    if (error) throw error;
    return json({ task }, 201);
  } catch (e: any) {
    console.error('[terrain tasks POST]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};

export const PUT: APIRoute = async ({ request }) => {
  const auth = await requireTerrainAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { id, action } = body;
    if (!id) return json({ error: 'id is required' }, 400);

    const { data: existing } = await supabase.from('terrain_tasks').select('project_id').eq('id', id).single();
    if (!existing) return json({ error: 'Task not found' }, 404);
    if (!(await canAccessProject(supabase, auth.profile, existing.project_id))) return json({ error: 'Forbidden' }, 403);

    if (action === 'complete') {
      const { data: task, error } = await supabase
        .from('terrain_tasks')
        .update({ status: 'done', completed_by: auth.profile.id, completed_at: new Date().toISOString() })
        .eq('id', id).select().single();
      if (error) throw error;
      return json({ task });
    }

    const allowed = ['title', 'description', 'priority', 'category', 'due_date', 'status', 'assignees'];
    const safe: Record<string, any> = {};
    for (const k of allowed) if (k in body) safe[k] = body[k];
    if (Object.keys(safe).length === 0) return json({ error: 'No updatable fields provided' }, 400);

    const { data: task, error } = await supabase
      .from('terrain_tasks').update(safe).eq('id', id).select().single();
    if (error) throw error;
    return json({ task });
  } catch (e: any) {
    console.error('[terrain tasks PUT]', e);
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
    const { error } = await supabase.from('terrain_tasks').delete().eq('id', body.id);
    if (error) throw error;
    return json({ success: true });
  } catch (e: any) {
    console.error('[terrain tasks DELETE]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};
