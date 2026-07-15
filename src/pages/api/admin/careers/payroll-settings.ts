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

const rulesSchema = z.object({
  its_brackets: z.array(z.object({ upTo: z.number().nullable(), rate: z.number().min(0).max(1) })).min(1),
  ricf_per_half_share: z.number().min(0),
  ricf_cap: z.number().min(0),
  cnps_retraite: z.object({ employee_rate: z.number(), employer_rate: z.number(), ceiling: z.number() }),
  prestations_familiales: z.object({ rate: z.number(), ceiling: z.number() }),
  accident_travail: z.object({ rate: z.number(), ceiling: z.number() }),
  taxe_apprentissage_rate: z.number().min(0).max(1),
  fpc_rate: z.number().min(0).max(1),
  fpc_regularisation_rate: z.number().min(0).max(1),
  its_patronal_rate: z.number().min(0).max(1),
  cmu_unit: z.number().min(0),
  monthly_hours: z.number().min(0),
});

// Identifiers stay TEXT and are never stripped of letters/spaces ("2305213 D").
const settingsSchema = z.object({
  company_cnps_number: z.string().trim().min(1).max(40),
  company_contribuable_number: z.string().trim().min(1).max(40),
  rules: rulesSchema,
});

export const GET: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();
    const { data: settings, error } = await supabase
      .from('payroll_settings')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return json({ settings });
  } catch (e) {
    console.error('API error:', e);
    return json({ error: 'Internal server error' }, 500);
  }
};

export const PUT: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();
    const parsed = settingsSchema.safeParse(await request.json());
    if (!parsed.success) {
      return json({ error: 'Invalid payload', details: parsed.error.flatten().fieldErrors }, 400);
    }

    const { data: existing, error: readError } = await supabase
      .from('payroll_settings')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (readError) throw readError;
    if (!existing) return json({ error: 'Payroll settings row missing — run the migration first' }, 404);

    const { data: settings, error } = await supabase
      .from('payroll_settings')
      .update(parsed.data)
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return json({ settings });
  } catch (e) {
    console.error('API error:', e);
    return json({ error: 'Internal server error' }, 500);
  }
};
