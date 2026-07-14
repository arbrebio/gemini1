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
 * GET /api/terrain/visits                  — list (scoped: admin sees all, others see own)
 * GET /api/terrain/visits?id=               — single visit detail
 * GET /api/terrain/visits?action=stats      — dashboard stats (scoped by role)
 * POST /api/terrain/visits                  — submit the full site-visit intake form
 * PUT /api/terrain/visits                   — { id, action: 'confirm' | 'start-project' }
 *                                              or { id, status } direct update (admin)
 */
export const GET: APIRoute = async ({ url, request }) => {
  const auth = await requireTerrainAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();
    const isAdmin = auth.profile.role === 'super_admin';
    const id = url.searchParams.get('id');
    const action = url.searchParams.get('action');

    if (action === 'stats') {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      let visitsQuery = supabase.from('terrain_visits').select('id, client_name, photos, created_at, project_id, visited_by');
      if (!isAdmin) visitsQuery = visitsQuery.eq('visited_by', auth.profile.id);
      const { data: visits } = await visitsQuery;

      const totalPhotos = (visits || []).reduce((sum, v) => sum + (Array.isArray(v.photos) ? v.photos.length : 0), 0);
      const thisMonth = (visits || []).filter(v => v.created_at >= monthStart).length;
      const uniqueProjects = new Set((visits || []).map(v => v.project_id).filter(Boolean)).size;

      if (isAdmin) {
        const { count: totalProjects } = await supabase.from('terrain_projects').select('*', { count: 'exact', head: true });
        const { data: users } = await supabase.from('terrain_profiles').select('role').eq('active', true);
        const engineers = (users || []).filter(u => u.role === 'engineer').length;
        const technicians = (users || []).filter(u => u.role === 'technician').length;
        return json({
          stats: {
            totalUsers: engineers + technicians, engineers, technicians,
            totalProjects: totalProjects || 0,
            totalVisits: (visits || []).length, thisMonth,
          },
        });
      }

      return json({
        stats: {
          totalVisits: (visits || []).length, thisMonth,
          totalProjects: uniqueProjects, totalPhotos,
        },
      });
    }

    if (id) {
      let query = supabase.from('terrain_visits').select('*, terrain_profiles!terrain_visits_visited_by_fkey(id, full_name, role)').eq('id', id);
      if (!isAdmin) query = query.eq('visited_by', auth.profile.id);
      const { data: visit, error } = await query.single();
      if (error || !visit) return json({ error: 'Visit not found' }, 404);
      return json({ visit });
    }

    let listQuery = supabase
      .from('terrain_visits')
      .select('id, status, client_name, zone, project_types, created_at, project_id, visited_by, terrain_profiles!terrain_visits_visited_by_fkey(full_name)')
      .order('created_at', { ascending: false })
      .limit(200);
    if (!isAdmin) listQuery = listQuery.eq('visited_by', auth.profile.id);
    const projectId = url.searchParams.get('project_id');
    if (projectId) listQuery = listQuery.eq('project_id', projectId);

    const { data: visits, error } = await listQuery;
    if (error) throw error;
    return json({ visits: visits || [] });
  } catch (e: any) {
    console.error('[terrain visits GET]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};

const REQUIRED_FIELDS = ['client_name', 'zone', 'site_address', 'visit_date'];

export const POST: APIRoute = async ({ request }) => {
  const auth = await requireTerrainAuth(request, ['engineer', 'technician']);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();
    const body = await request.json();

    for (const f of REQUIRED_FIELDS) {
      if (!body[f]) return json({ error: `${f} is required` }, 400);
    }
    if (!Array.isArray(body.project_types) || body.project_types.length === 0) {
      return json({ error: 'At least one project type is required' }, 400);
    }

    // Auto-create (or reuse) the project for this client, matching the
    // original app's behavior of grouping visits under one project.
    let projectId = body.project_id || null;
    if (!projectId) {
      const { data: project, error: projErr } = await supabase
        .from('terrain_projects')
        .insert({
          title: `Projet ${body.client_name}`,
          client_name: body.client_name,
          client_phone: body.client_phone || null,
          location: body.site_address || null,
          zone: body.zone || null,
          project_types: body.project_types,
          assigned_to: auth.profile.id,
          status: 'active',
        })
        .select('id').single();
      if (projErr) throw projErr;
      projectId = project.id;
    }

    const { data: visit, error } = await supabase
      .from('terrain_visits')
      .insert({
        project_id: projectId,
        visited_by: auth.profile.id,
        status: 'submitted',
        client_name: body.client_name,
        client_phone: body.client_phone || null,
        client_email: body.client_email || null,
        zone: body.zone,
        site_address: body.site_address,
        site_gps: body.site_gps || null,
        visit_date: body.visit_date,
        land_area: body.land_area || null,
        land_tenure: body.land_tenure || null,
        client_experience: body.client_experience || null,
        project_types: body.project_types,
        project_objective: body.project_objective || null,
        organic_cert: body.organic_cert || null,
        project_budget_range: body.project_budget_range || null,
        greenhouse_data: body.greenhouse_data || null,
        irrigation_data: body.irrigation_data || null,
        substrate_data: body.substrate_data || null,
        crops_data: body.crops_data || null,
        equipment_data: body.equipment_data || null,
        site_observations: body.site_observations || null,
        photos: body.photos || [],
        photo_notes: body.photo_notes || null,
        blocking_issues: body.blocking_issues || null,
        recommendations: body.recommendations || null,
        next_steps: body.next_steps || null,
        estimated_budget: body.estimated_budget || null,
      })
      .select().single();
    if (error) throw error;

    return json({ visit }, 201);
  } catch (e: any) {
    console.error('[terrain visits POST]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};

export const PUT: APIRoute = async ({ request }) => {
  const auth = await requireTerrainAuth(request, ['super_admin']);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { id, action } = body;
    if (!id) return json({ error: 'id is required' }, 400);

    if (action === 'confirm') {
      const { data: visit, error } = await supabase
        .from('terrain_visits')
        .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
        .eq('id', id).select('project_id').single();
      if (error) throw error;
      if (visit.project_id) {
        await supabase.from('terrain_projects').update({ status: 'confirmed' }).eq('id', visit.project_id);
      }
      return json({ success: true });
    }

    if (action === 'start-project') {
      const nowIso = new Date().toISOString();
      const { data: visit, error } = await supabase
        .from('terrain_visits')
        .update({ status: 'in_progress', started_at: nowIso })
        .eq('id', id).select('project_id').single();
      if (error) throw error;
      if (visit.project_id) {
        await supabase.from('terrain_projects').update({ status: 'in_progress', started_at: nowIso }).eq('id', visit.project_id);
      }
      return json({ success: true });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (e: any) {
    console.error('[terrain visits PUT]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};
