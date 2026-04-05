export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = import.meta.env.SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const supabase = getSupabase();
    const { email, token } = await request.json();

    if (!email || !token) {
      return new Response(JSON.stringify({ error: 'Email and token are required.' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    // Find application by token + email
    const { data: application, error } = await supabase
      .from('career_applications')
      .select(`
        id, job_id, first_name, middle_name, last_name, email, phone,
        birth_date, nationality, city, address, status, portal_token,
        submitted_at, reviewed_at, admin_notes, employee_id
      `)
      .eq('portal_token', token.trim())
      .eq('portal_email', email.trim().toLowerCase())
      .single();

    if (error || !application) {
      return new Response(JSON.stringify({ error: 'Invalid email or reference token.' }), {
        status: 401, headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch job info
    const { data: job } = await supabase
      .from('career_jobs')
      .select('id, title_en, title_fr, title_es, title_af, location, job_type')
      .eq('id', application.job_id)
      .single();

    // Fetch timeline
    const { data: timeline } = await supabase
      .from('career_application_timeline')
      .select('status, note, created_at')
      .eq('application_id', application.id)
      .order('created_at', { ascending: true });

    // Fetch documents (names only for security — no direct URLs)
    const { data: documents } = await supabase
      .from('career_documents')
      .select('id, doc_type, file_name, uploaded_at')
      .eq('application_id', application.id);

    // Fetch employee record if hired
    let employee = null;
    if (application.employee_id) {
      const { data: emp } = await supabase
        .from('career_employees')
        .select('first_name, last_name, job_title, worker_id, photo_url, contract_url, department, start_date')
        .eq('id', application.employee_id)
        .single();
      employee = emp;
    }

    return new Response(JSON.stringify({
      application,
      job,
      timeline: timeline || [],
      documents: documents || [],
      employee,
    }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Server error.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
