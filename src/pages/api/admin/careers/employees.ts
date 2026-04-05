export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, import.meta.env.SUPABASE_SERVICE_ROLE_KEY || key);
}

function generateWorkerId(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 900000 + 100000).toString();
  return `ARB-${year}-${random}`;
}

// GET — list employees
export const GET: APIRoute = async ({ url }) => {
  try {
    const supabase = getSupabase();
    const id = url.searchParams.get('id');

    if (id) {
      const { data: employee, error } = await supabase
        .from('career_employees').select('*').eq('id', id).single();
      if (error) throw error;
      return new Response(JSON.stringify({ employee }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const { data: employees, error } = await supabase
      .from('career_employees').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return new Response(JSON.stringify({ employees: employees || [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

// POST — create employee (from application OR directly)
export const POST: APIRoute = async ({ request }) => {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { application_id, job_title, department, start_date, contract_url, photo_url, notes,
            first_name, last_name, middle_name, email, phone, birth_date, nationality } = body;

    const workerId = generateWorkerId();

    // Direct creation (no application_id)
    if (!application_id) {
      if (!first_name || !last_name || !email) {
        return new Response(JSON.stringify({ error: 'first_name, last_name and email are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const { data: employee, error } = await supabase
        .from('career_employees')
        .insert({
          first_name, middle_name: middle_name || null, last_name, email,
          phone: phone || null, birth_date: birth_date || null, nationality: nationality || null,
          job_title: job_title || '', department: department || '',
          start_date: start_date || new Date().toISOString().split('T')[0],
          worker_id: workerId, portal_token: null,
          contract_url: contract_url || null, photo_url: photo_url || null,
          notes: notes || null, status: 'active',
        })
        .select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ employee }), { status: 201, headers: { 'Content-Type': 'application/json' } });
    }

    // From application
    const { data: application, error: appError } = await supabase
      .from('career_applications').select('*').eq('id', application_id).single();
    if (appError || !application) throw new Error('Application not found');

    const { data: employee, error } = await supabase
      .from('career_employees')
      .insert({
        application_id,
        first_name: application.first_name,
        middle_name: application.middle_name,
        last_name: application.last_name,
        email: application.email,
        phone: application.phone,
        birth_date: application.birth_date,
        nationality: application.nationality,
        job_title: job_title || '',
        department: department || '',
        start_date: start_date || new Date().toISOString().split('T')[0],
        worker_id: workerId,
        portal_token: application.portal_token,
        contract_url: contract_url || null,
        photo_url: photo_url || null,
        notes: notes || null,
        status: 'active',
      })
      .select().single();
    if (error) throw error;

    await supabase.from('career_applications').update({ employee_id: employee.id, status: 'hired' }).eq('id', application_id);
    await supabase.from('career_application_timeline').insert({ application_id, status: 'hired', note: `Employee record created. Worker ID: ${workerId}` });

    return new Response(JSON.stringify({ employee }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

// PUT — update employee
export const PUT: APIRoute = async ({ request }) => {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return new Response(JSON.stringify({ error: 'id required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    const { data: employee, error } = await supabase
      .from('career_employees').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return new Response(JSON.stringify({ employee }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

// DELETE — remove employee
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const supabase = getSupabase();
    const { id } = await request.json();
    if (!id) return new Response(JSON.stringify({ error: 'id required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    const { error } = await supabase.from('career_employees').delete().eq('id', id);
    if (error) throw error;
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
