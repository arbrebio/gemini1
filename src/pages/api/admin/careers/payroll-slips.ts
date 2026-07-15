export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { requireAdminAuth } from '../../../../lib/adminAuth';
import {
  computeAnciennete,
  computeCumuls,
  computePayslip,
  monthNameFr,
  periodBounds,
  type PayrollRules,
} from '../../../../lib/payroll';

const FROM_ADDRESS = 'Arbre Bio Africa <farms@newsletter.arbrebio.com>';
const SITE_URL = 'https://arbrebio.com';

function getSupabase() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const generateSchema = z.object({
  action: z.literal('generate'),
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
  employee_ids: z.array(z.string().uuid()).optional(),
});

const validateSchema = z.object({
  action: z.literal('validate'),
  slip_ids: z.array(z.string().uuid()).min(1),
});

async function loadSettings(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('payroll_settings')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('payroll_settings missing — run the migration');
  return data as { company_cnps_number: string; company_contribuable_number: string; rules: PayrollRules };
}

// GET — list slips (?year=&month=&employee_id=&id=)
export const GET: APIRoute = async ({ request, url }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();
    const id = url.searchParams.get('id');
    if (id) {
      const { data: slip, error } = await supabase.from('payroll_slips').select('*').eq('id', id).single();
      if (error) throw error;
      return json({ slip });
    }

    let query = supabase
      .from('payroll_slips')
      .select('id, employee_id, period_year, period_month, period_start, period_end, payment_date, status, totals, profile_snapshot, validated_at, created_at')
      .order('period_year', { ascending: false })
      .order('period_month', { ascending: false });
    const year = url.searchParams.get('year');
    const month = url.searchParams.get('month');
    const employeeId = url.searchParams.get('employee_id');
    if (year) query = query.eq('period_year', Number(year));
    if (month) query = query.eq('period_month', Number(month));
    if (employeeId) query = query.eq('employee_id', employeeId);

    const { data: slips, error } = await query;
    if (error) throw error;
    return json({ slips: slips || [] });
  } catch (e) {
    console.error('API error:', e);
    return json({ error: 'Internal server error' }, 500);
  }
};

// POST — { action: 'generate' } or { action: 'validate' }
export const POST: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();
    const body = await request.json();

    if (body?.action === 'generate') {
      const parsed = generateSchema.safeParse(body);
      if (!parsed.success) return json({ error: 'Invalid payload', details: parsed.error.flatten().fieldErrors }, 400);
      return await handleGenerate(supabase, parsed.data, auth.userId);
    }
    if (body?.action === 'validate') {
      const parsed = validateSchema.safeParse(body);
      if (!parsed.success) return json({ error: 'Invalid payload', details: parsed.error.flatten().fieldErrors }, 400);
      return await handleValidate(supabase, parsed.data.slip_ids);
    }
    return json({ error: 'Unknown action' }, 400);
  } catch (e) {
    console.error('API error:', e);
    return json({ error: 'Internal server error' }, 500);
  }
};

async function handleGenerate(
  supabase: SupabaseClient,
  input: z.infer<typeof generateSchema>,
  userId: string
) {
  const settings = await loadSettings(supabase);
  const { start, end } = periodBounds(input.year, input.month);

  let query = supabase
    .from('employee_payroll_profiles')
    .select('*, employee:career_employees(id, first_name, middle_name, last_name, email, address, city, worker_id, job_title, department, start_date, contract_type, status)')
    .eq('active', true);
  if (input.employee_ids?.length) query = query.in('employee_id', input.employee_ids);
  const { data: profiles, error: profErr } = await query;
  if (profErr) throw profErr;
  if (!profiles?.length) return json({ error: 'Aucun profil de paie actif trouvé' }, 404);

  const results: Array<{ employee_id: string; matricule: string; slip_id?: string; status: string; error?: string }> = [];

  for (const profile of profiles) {
    const employee = profile.employee;
    if (!employee) {
      results.push({ employee_id: profile.employee_id, matricule: profile.matricule, status: 'error', error: 'Employé introuvable' });
      continue;
    }

    // A validated slip for this period is immutable — skip it.
    const { data: existing } = await supabase
      .from('payroll_slips')
      .select('id, status')
      .eq('employee_id', profile.employee_id)
      .eq('period_year', input.year)
      .eq('period_month', input.month)
      .maybeSingle();
    if (existing?.status === 'validated') {
      results.push({ employee_id: profile.employee_id, matricule: profile.matricule, slip_id: existing.id, status: 'skipped_validated' });
      continue;
    }

    const computed = computePayslip({
      profile: {
        baseSalary: Number(profile.base_salary),
        sursalaire: Number(profile.sursalaire),
        transportAllowance: Number(profile.transport_allowance),
        partsIgr: Number(profile.parts_igr),
        cmuDependents: profile.cmu_dependents,
        extraLines: profile.extra_lines || [],
      },
      rules: settings.rules,
    });

    // Année row = prior VALIDATED slips of the same year + this one.
    const { data: priorSlips, error: priorErr } = await supabase
      .from('payroll_slips')
      .select('totals, period_month')
      .eq('employee_id', profile.employee_id)
      .eq('period_year', input.year)
      .eq('status', 'validated')
      .lt('period_month', input.month);
    if (priorErr) throw priorErr;
    const cumuls = computeCumuls(computed, (priorSlips || []).map((s) => ({ totals: s.totals })));

    const seniorityDate = profile.seniority_date || employee.start_date;
    const anciennete = seniorityDate
      ? computeAnciennete(new Date(`${seniorityDate}T00:00:00`), new Date(`${end}T00:00:00`))
      : null;

    const profileSnapshot = {
      matricule: profile.matricule,
      base_salary: Number(profile.base_salary),
      sursalaire: Number(profile.sursalaire),
      transport_allowance: Number(profile.transport_allowance),
      parts_igr: Number(profile.parts_igr),
      cmu_dependents: profile.cmu_dependents,
      employee_cnps_number: profile.employee_cnps_number,
      bank_account: profile.bank_account,
      category: profile.category,
      grade: profile.grade,
      salary_type: profile.salary_type,
      payment_method: profile.payment_method,
      seniority_date: seniorityDate,
      anciennete_label: anciennete?.label || null,
      employee: {
        id: employee.id,
        full_name: [employee.last_name, employee.first_name, employee.middle_name].filter(Boolean).join(' ').toUpperCase(),
        email: employee.email,
        address: [employee.address, employee.city].filter(Boolean).join(' '),
        worker_id: employee.worker_id,
        job_title: employee.job_title,
        department: employee.department,
        start_date: employee.start_date,
        contract_type: employee.contract_type,
      },
    };

    const row = {
      employee_id: profile.employee_id,
      period_year: input.year,
      period_month: input.month,
      period_start: start,
      period_end: end,
      payment_date: end,
      profile_snapshot: profileSnapshot,
      rules_snapshot: settings.rules,
      company_snapshot: {
        cnps_number: settings.company_cnps_number,
        contribuable_number: settings.company_contribuable_number,
      },
      lines: computed.lines,
      totals: computed.totals,
      cumuls,
      conges: {},
      status: 'draft',
      created_by: userId,
    };

    let slipId = existing?.id;
    if (existing) {
      const { error } = await supabase.from('payroll_slips').update(row).eq('id', existing.id);
      if (error) {
        results.push({ employee_id: profile.employee_id, matricule: profile.matricule, status: 'error', error: error.message });
        continue;
      }
    } else {
      const { data: inserted, error } = await supabase.from('payroll_slips').insert(row).select('id').single();
      if (error) {
        results.push({ employee_id: profile.employee_id, matricule: profile.matricule, status: 'error', error: error.message });
        continue;
      }
      slipId = inserted.id;
    }
    results.push({ employee_id: profile.employee_id, matricule: profile.matricule, slip_id: slipId, status: existing ? 'regenerated' : 'generated' });
  }

  return json({ results });
}

async function handleValidate(supabase: SupabaseClient, slipIds: string[]) {
  const results: Array<{ slip_id: string; status: string; error?: string }> = [];

  for (const slipId of slipIds) {
    const { data: slip, error: readErr } = await supabase
      .from('payroll_slips')
      .select('id, status, period_year, period_month, employee_id, profile_snapshot')
      .eq('id', slipId)
      .single();
    if (readErr || !slip) {
      results.push({ slip_id: slipId, status: 'error', error: 'Bulletin introuvable' });
      continue;
    }
    if (slip.status === 'validated') {
      results.push({ slip_id: slipId, status: 'already_validated' });
      continue;
    }

    const { error: updateErr } = await supabase
      .from('payroll_slips')
      .update({ status: 'validated', validated_at: new Date().toISOString() })
      .eq('id', slipId);
    if (updateErr) {
      results.push({ slip_id: slipId, status: 'error', error: updateErr.message });
      continue;
    }

    await sendPayslipEmail(supabase, slip).catch((e) => console.error('Payslip email failed:', e));
    results.push({ slip_id: slipId, status: 'validated' });
  }

  return json({ results });
}

async function sendPayslipEmail(
  supabase: SupabaseClient,
  slip: { employee_id: string; period_year: number; period_month: number; profile_snapshot: any }
) {
  const resendKey = import.meta.env.RESEND_API_KEY;
  if (!resendKey) return;

  const { data: employee } = await supabase
    .from('career_employees')
    .select('first_name, last_name, email')
    .eq('id', slip.employee_id)
    .single();
  if (!employee?.email) return;

  const periodLabel = `${monthNameFr(slip.period_month)} ${slip.period_year}`;
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f6f4;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#194642,#2a5e59);padding:28px 32px;text-align:center">
      <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700">Bulletin de paie disponible</h1>
      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px">Période : ${periodLabel}</p>
    </div>
    <div style="padding:32px">
      <p style="color:#333;font-size:15px;margin:0 0 20px">Bonjour <strong>${employee.first_name} ${employee.last_name}</strong>,</p>
      <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 24px">
        Votre bulletin de paie du mois de <strong>${periodLabel}</strong> est disponible.
        Connectez-vous à votre portail employé pour le consulter, le télécharger ou l'imprimer.
      </p>
      <div style="text-align:center;margin:0 0 24px">
        <a href="${SITE_URL}/careers/portal/"
           style="display:inline-block;background:#194642;color:#ffffff;font-weight:700;font-size:14px;padding:14px 28px;border-radius:8px;text-decoration:none">
          Consulter mon bulletin de paie
        </a>
      </div>
      <p style="color:#555;font-size:13px;line-height:1.6;margin:0">
        Pour toute question, contactez le service RH :
        <a href="mailto:farms@arbrebio.com" style="color:#194642">farms@arbrebio.com</a>.
      </p>
    </div>
    <div style="background:#f8f8f8;padding:16px 32px;text-align:center;border-top:1px solid #eee">
      <p style="color:#aaa;font-size:12px;margin:0">© ${new Date().getFullYear()} Arbre Bio Africa · <a href="${SITE_URL}" style="color:#194642;text-decoration:none">arbrebio.com</a></p>
    </div>
  </div>
</body></html>`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [employee.email],
      subject: `Votre bulletin de paie — ${periodLabel}`,
      html,
    }),
  });
}

// DELETE — drafts only (DB trigger also guards validated slips)
export const DELETE: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();
    const { id } = await request.json();
    if (!id) return json({ error: 'id required' }, 400);
    const { error } = await supabase.from('payroll_slips').delete().eq('id', id).eq('status', 'draft');
    if (error) throw error;
    return json({ success: true });
  } catch (e) {
    console.error('API error:', e);
    return json({ error: 'Internal server error' }, 500);
  }
};
