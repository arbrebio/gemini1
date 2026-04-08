export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

function sb() {
  return createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ── GET ──────────────────────────────────────────────────────────────────────
export const GET: APIRoute = async ({ url }) => {
  try {
    const supabase   = sb();
    const id         = url.searchParams.get('id') ?? '';
    const action     = url.searchParams.get('action') ?? '';
    const project_id = url.searchParams.get('project_id') ?? '';

    // Just tasks for a project
    if (action === 'tasks' && project_id) {
      const { data, error } = await supabase
        .from('admin_project_tasks')
        .select('*')
        .eq('project_id', project_id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return json({ tasks: data ?? [] });
    }

    // Single project with tasks
    if (id) {
      const { data: project, error: projectError } = await supabase
        .from('admin_projects')
        .select('*, admin_customers(id, full_name, email, company_name)')
        .eq('id', id)
        .single();
      if (projectError) throw projectError;

      const { data: tasks, error: tasksError } = await supabase
        .from('admin_project_tasks')
        .select('*')
        .eq('project_id', id)
        .order('due_date', { ascending: true });
      if (tasksError) throw tasksError;

      return json({ project: { ...project, tasks: tasks ?? [] } });
    }

    // List all projects with customer join
    const { data, error, count } = await supabase
      .from('admin_projects')
      .select('*, admin_customers(id, full_name, email, company_name)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return json({ projects: data ?? [], total: count ?? 0 });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

// ── POST ─────────────────────────────────────────────────────────────────────
export const POST: APIRoute = async ({ request }) => {
  try {
    const supabase = sb();
    const body = await request.json();
    const { _action, ...payload } = body;

    // Add a task to an existing project
    if (_action === 'add_task') {
      const { project_id, title, description, status, priority, due_date, assignee_name } = payload;
      if (!project_id) return json({ error: 'project_id is required' }, 400);
      if (!title)      return json({ error: 'title is required' }, 400);

      const { data, error } = await supabase
        .from('admin_project_tasks')
        .insert({
          project_id,
          title,
          description: description ?? null,
          status: status ?? 'todo',
          priority: priority ?? 'medium',
          due_date: due_date ?? null,
          assignee_name: assignee_name ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return json({ task: data }, 201);
    }

    // Create a new project
    const {
      name,
      customer_id,
      status,
      start_date,
      end_date,
      budget,
      budget_currency,
      description,
      tags,
    } = payload;

    if (!name) return json({ error: 'name is required' }, 400);

    const { data, error } = await supabase
      .from('admin_projects')
      .insert({
        name,
        customer_id: customer_id ?? null,
        status: status ?? 'planning',
        start_date: start_date ?? null,
        end_date: end_date ?? null,
        budget: budget ?? null,
        budget_currency: budget_currency ?? 'XOF',
        description: description ?? null,
        tags: tags ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    // Log notification (fire-and-forget)
    supabase.from('admin_notifications').insert({
      type: 'project', message: `New project created: ${name}`, entity_id: data.id, entity_type: 'project', is_read: false,
    }).then(() => {});
    return json({ project: data }, 201);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

// ── PUT ──────────────────────────────────────────────────────────────────────
export const PUT: APIRoute = async ({ request }) => {
  try {
    const supabase = sb();
    const body = await request.json();
    const { id, _action, ...updates } = body;

    if (!id) return json({ error: 'id is required' }, 400);

    // Add a task to a project
    if (_action === 'add_task') {
      const { title, description, priority, due_date, assignee_name, employee_id } = updates;
      if (!title) return json({ error: 'title is required' }, 400);
      const taskData: Record<string, any> = {
        project_id: id,
        title,
        description: description ?? null,
        status: 'todo',
        priority: priority ?? 'medium',
        due_date: due_date ?? null,
        assignee_name: assignee_name ?? null,
      };
      if (employee_id) taskData.employee_id = employee_id;
      const { data, error } = await supabase
        .from('admin_project_tasks')
        .insert(taskData)
        .select()
        .single();
      if (error) throw error;
      // Log notification (fire-and-forget)
      supabase.from('admin_notifications').insert({
        type: 'task', message: `Task assigned: "${title}"${assignee_name ? ` → ${assignee_name}` : ''}`, entity_id: data.id, entity_type: 'task', is_read: false,
      }).then(() => {});
      return json({ task: data }, 201);
    }

    // Update a task
    if (_action === 'update_task') {
      const { task_id, ...taskUpdates } = updates;
      if (!task_id) return json({ error: 'task_id is required' }, 400);
      const { data, error } = await supabase
        .from('admin_project_tasks')
        .update(taskUpdates)
        .eq('id', task_id)
        .select()
        .single();
      if (error) throw error;
      return json({ task: data });
    }

    // Delete a task
    if (_action === 'delete_task') {
      const { task_id } = updates;
      if (!task_id) return json({ error: 'task_id is required' }, 400);
      const { error } = await supabase
        .from('admin_project_tasks')
        .delete()
        .eq('id', task_id);
      if (error) throw error;
      return json({ success: true });
    }

    // Update a project
    const { data, error } = await supabase
      .from('admin_projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return json({ project: data });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

// ── DELETE ───────────────────────────────────────────────────────────────────
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const supabase = sb();
    const { id, _target } = await request.json();

    if (!id) return json({ error: 'id is required' }, 400);

    if (_target === 'task') {
      const { error } = await supabase
        .from('admin_project_tasks')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } else {
      // Cascade on admin_project_tasks handles task deletion
      const { error } = await supabase
        .from('admin_projects')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }

    return json({ success: true });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};
