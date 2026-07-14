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
 * POST /api/terrain/task-photos — { task_id, photo_url, label? }
 * Records a proof photo (already uploaded via /api/terrain/upload) against
 * a task, and — matching the original workflow — bumps the task out of
 * todo/in_progress into 'review' once evidence is attached.
 */
export const POST: APIRoute = async ({ request }) => {
  const auth = await requireTerrainAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();
    const body = await request.json();
    if (!body.task_id) return json({ error: 'task_id is required' }, 400);
    if (!body.photo_url) return json({ error: 'photo_url is required' }, 400);

    const { data: task } = await supabase.from('terrain_tasks').select('project_id, status').eq('id', body.task_id).single();
    if (!task) return json({ error: 'Task not found' }, 404);
    if (auth.profile.role !== 'super_admin') {
      const { data: project } = await supabase.from('terrain_projects').select('assigned_to').eq('id', task.project_id).single();
      if (project?.assigned_to !== auth.profile.id) return json({ error: 'Forbidden' }, 403);
    }

    const { data: photo, error } = await supabase
      .from('terrain_task_photos')
      .insert({ task_id: body.task_id, photo_url: body.photo_url, label: body.label || null, uploaded_by: auth.profile.id })
      .select('*, terrain_profiles(full_name)')
      .single();
    if (error) throw error;

    if (task.status === 'todo' || task.status === 'in_progress') {
      await supabase.from('terrain_tasks').update({ status: 'review' }).eq('id', body.task_id);
    }

    return json({ photo }, 201);
  } catch (e: any) {
    console.error('[terrain task-photos POST]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};
