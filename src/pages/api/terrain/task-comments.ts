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

/** POST /api/terrain/task-comments — { task_id, text } */
export const POST: APIRoute = async ({ request }) => {
  const auth = await requireTerrainAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const text = String(body.text || '').trim();
    if (!body.task_id) return json({ error: 'task_id is required' }, 400);
    if (!text) return json({ error: 'text is required' }, 400);

    const { data: task } = await supabase.from('terrain_tasks').select('project_id').eq('id', body.task_id).single();
    if (!task) return json({ error: 'Task not found' }, 404);
    if (auth.profile.role !== 'super_admin') {
      const { data: project } = await supabase.from('terrain_projects').select('assigned_to').eq('id', task.project_id).single();
      if (project?.assigned_to !== auth.profile.id) return json({ error: 'Forbidden' }, 403);
    }

    const { data: comment, error } = await supabase
      .from('terrain_task_comments')
      .insert({ task_id: body.task_id, author_id: auth.profile.id, text })
      .select('*, terrain_profiles(full_name)')
      .single();
    if (error) throw error;
    return json({ comment }, 201);
  } catch (e: any) {
    console.error('[terrain task-comments POST]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};
