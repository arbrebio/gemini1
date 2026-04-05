export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = import.meta.env.SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

// GET /api/careers/jobs — list published jobs or fetch single by slug
export const GET: APIRoute = async ({ url }) => {
  try {
    const supabase = getSupabase();
    const slug = url.searchParams.get('slug');

    if (slug) {
      const { data: job, error } = await supabase
        .from('career_jobs')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error || !job) {
        return new Response(JSON.stringify({ job: null }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ job }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // List all published jobs
    const { data: jobs, error } = await supabase
      .from('career_jobs')
      .select('id, title_en, title_fr, title_es, title_af, slug, location, job_type, department, deadline, positions, status')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify({ jobs: jobs || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message, jobs: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
