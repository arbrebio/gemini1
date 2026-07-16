export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { requireAdminAuth } from '../../../../lib/adminAuth';

function getSupabase() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const extraLineSchema = z.object({
  code: z.string().min(1).max(10),
  label: z.string().min(1).max(80),
  amount: z.number().min(0),
  taxable: z.boolean(),
});

const profileSchema = z.object({
  id: z.string().uuid().optional(),
  employee_id: z.string().uuid(),
  matricule: z.string().min(1).max(30),
  base_salary: z.number().min(0),
  sursalaire: z.number().min(0).default(0),
  transport_allowance: z.number().min(0).default(0),
  parts_igr: z.number().min(1).max(5),
  cmu_dependents: z.number().int().min(0).default(0),
  employee_cnps_number: z.string().max(40).nullable().optional(),
  bank_account: z.string().max(80).nullable().optional(),
  category: z.string().max(30).nullable().optional(),
  grade: z.string().max(50).nullable().optional(),
  salary_type: z.string().max(30).default('Mensuel'),
  payment_method: z.string().max(30).default('Virement'),
  seniority_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  extra_lines: z.array(extraLineSchema).default([]),
  active: z.boolean().default(true),
});

// GET — list payroll profiles joined with employee identity (or single via ?employee_id=)
export const GET: APIRoute = async ({ request, url }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();
    const employeeId = url.searchParams.get('employee_id');

    let query = supabase
      .from('employee_payroll_profiles')
      .select('*, employee:career_employees(id, first_name, middle_name, last_name, email, address, city, photo_url, worker_id, job_title, department, start_date, contract_type, status)')
      .order('matricule');
    if (employeeId) query = query.eq('employee_id', employeeId);

    const { data: profiles, error } = await query;
    if (error) throw error;

    // Also return employees without a profile yet, so the UI can offer creation
    const { data: employees, error: empError } = await supabase
      .from('career_employees')
      .select('id, first_name, middle_name, last_name, email, worker_id, job_title, department, start_date, contract_type, status')
      .order('last_name');
    if (empError) throw empError;

    const covered = new Set((profiles || []).map((p) => p.employee_id));
    const withoutProfile = (employees || []).filter((e) => !covered.has(e.id));

    return json({ profiles: profiles || [], employees_without_profile: withoutProfile });
  } catch (e) {
    console.error('API error:', e);
    return json({ error: 'Internal server error' }, 500);
  }
};

// POST — create or update (upsert by employee_id)
export const POST: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();
    const parsed = profileSchema.safeParse(await request.json());
    if (!parsed.success) {
      return json({ error: 'Invalid payload', details: parsed.error.flatten().fieldErrors }, 400);
    }
    const { id, ...fields } = parsed.data;

    const { data: profile, error } = await supabase
      .from('employee_payroll_profiles')
      .upsert({ ...fields, ...(id ? { id } : {}) }, { onConflict: 'employee_id' })
      .select()
      .single();
    if (error) {
      if ((error as any).code === '23505') return json({ error: 'Ce matricule est déjà utilisé' }, 409);
      throw error;
    }
    return json({ profile }, id ? 200 : 201);
  } catch (e) {
    console.error('API error:', e);
    return json({ error: 'Internal server error' }, 500);
  }
};

// DELETE — remove a payroll profile (does not touch the employee record)
export const DELETE: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();
    const { id } = await request.json();
    if (!id) return json({ error: 'id required' }, 400);
    const { error } = await supabase.from('employee_payroll_profiles').delete().eq('id', id);
    if (error) throw error;
    return json({ success: true });
  } catch (e) {
    console.error('API error:', e);
    return json({ error: 'Internal server error' }, 500);
  }
};
