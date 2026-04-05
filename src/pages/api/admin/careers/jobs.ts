export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

function getSupabase(request: Request) {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  // Use service role for admin ops
  return createClient(url, import.meta.env.SUPABASE_SERVICE_ROLE_KEY || key);
}

function slugify(text: string): string {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

// GET — list all jobs (admin sees all statuses)
export const GET: APIRoute = async ({ request, url }) => {
  try {
    const supabase = getSupabase(request);
    const id = url.searchParams.get('id');

    if (id) {
      const { data: job, error } = await supabase
        .from('career_jobs').select('*').eq('id', id).single();
      if (error) throw error;
      return new Response(JSON.stringify({ job }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const { data: jobs, error } = await supabase
      .from('career_jobs').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return new Response(JSON.stringify({ jobs: jobs || [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

// POST — create new job
export const POST: APIRoute = async ({ request }) => {
  try {
    const supabase = getSupabase(request);
    const body = await request.json();

    const slug = body.slug || slugify(body.title_en || '');
    const { data: job, error } = await supabase
      .from('career_jobs')
      .insert({ ...body, slug })
      .select().single();

    if (error) throw error;
    return new Response(JSON.stringify({ job }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

// PUT — update job
export const PUT: APIRoute = async ({ request }) => {
  try {
    const supabase = getSupabase(request);
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return new Response(JSON.stringify({ error: 'id required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    const { data: job, error } = await supabase
      .from('career_jobs').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return new Response(JSON.stringify({ job }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

// DELETE — delete job
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const supabase = getSupabase(request);
    const { id } = await request.json();
    if (!id) return new Response(JSON.stringify({ error: 'id required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    const { error } = await supabase.from('career_jobs').delete().eq('id', id);
    if (error) throw error;
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
