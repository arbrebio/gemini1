export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const FROM_ADDRESS = 'Arbre Bio Africa <farms@newsletter.arbrebio.com>';
const SITE_URL = 'https://arbrebio.com';

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

async function sendWorkerIdEmail(employee: {
  first_name: string;
  last_name: string;
  email: string;
  worker_id: string;
  job_title: string;
  department?: string | null;
  start_date?: string | null;
  contract_type?: string | null;
  contract_url?: string | null;
}): Promise<void> {
  const resendKey = import.meta.env.RESEND_API_KEY;
  if (!resendKey) return;

  const startFormatted = employee.start_date
    ? new Date(employee.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  const contractSection = employee.contract_url ? `
      <!-- Contract download -->
      <div style="background:#fff8e1;border:2px solid #f9c74f;border-radius:10px;padding:20px 24px;margin:0 0 24px">
        <p style="color:#7c5a00;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px">
          📄 Your Employment Contract
        </p>
        <p style="color:#555;font-size:13px;line-height:1.5;margin:0 0 14px">
          Your signed employment contract is attached to your employee profile.
          Please download and keep a copy for your records.
        </p>
        <a href="${employee.contract_url}"
           style="display:inline-block;background:#194642;color:#ffffff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none">
          ⬇ Download My Contract
        </a>
      </div>` : '';

  const portalNote = `
      <!-- Portal access -->
      <div style="background:#f0f9f0;border:1px solid #c6e8c6;border-radius:10px;padding:16px 20px;margin:0 0 24px">
        <p style="color:#194642;font-size:13px;font-weight:700;margin:0 0 6px">📋 Access Your Applicant Portal</p>
        <p style="color:#555;font-size:13px;margin:0 0 10px">
          You can view your application status, Worker ID, and download your contract at any time through the portal.
        </p>
        <a href="${SITE_URL}/en/careers/portal"
           style="color:#194642;font-size:13px;font-weight:600;text-decoration:underline">${SITE_URL}/en/careers/portal</a>
      </div>`;

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f4;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#194642,#2a5e59);padding:32px 32px 24px;text-align:center">
      <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700">Welcome to Arbre Bio Africa!</h1>
      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px">Your employee record has been created</p>
    </div>
    <!-- Body -->
    <div style="padding:32px">
      <p style="color:#333;font-size:15px;margin:0 0 20px">Dear <strong>${employee.first_name} ${employee.last_name}</strong>,</p>
      <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 24px">
        We are delighted to officially welcome you to the Arbre Bio Africa team.
        Your employee profile has been created and your unique <strong>Worker ID</strong> is ready.
        Please keep this ID safe — you will need it to access company systems and services.
      </p>

      <!-- Worker ID card -->
      <div style="background:#f0f9f0;border:2px solid #c6e8c6;border-radius:10px;padding:20px 24px;text-align:center;margin:0 0 24px">
        <p style="color:#194642;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px">Your Worker ID</p>
        <p style="color:#194642;font-size:28px;font-weight:700;font-family:monospace;letter-spacing:3px;margin:0">${employee.worker_id}</p>
      </div>

      ${contractSection}

      <!-- Details table -->
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin:0 0 24px">
        <tr style="border-bottom:1px solid #f0f0f0">
          <td style="padding:10px 0;color:#888;width:40%">Position</td>
          <td style="padding:10px 0;color:#333;font-weight:600">${employee.job_title || '—'}</td>
        </tr>
        ${employee.department ? `<tr style="border-bottom:1px solid #f0f0f0">
          <td style="padding:10px 0;color:#888">Department</td>
          <td style="padding:10px 0;color:#333;font-weight:600">${employee.department}</td>
        </tr>` : ''}
        <tr style="border-bottom:1px solid #f0f0f0">
          <td style="padding:10px 0;color:#888">Start Date</td>
          <td style="padding:10px 0;color:#333;font-weight:600">${startFormatted}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#888">Contract Type</td>
          <td style="padding:10px 0;color:#333;font-weight:600">${employee.contract_type || 'CDI'}</td>
        </tr>
      </table>

      ${portalNote}

      <p style="color:#555;font-size:13px;line-height:1.6;margin:0 0 24px">
        If you have any questions, please contact our HR team at
        <a href="mailto:farms@arbrebio.com" style="color:#194642">farms@arbrebio.com</a>.
      </p>

      <p style="color:#333;font-size:14px;margin:0">
        Best regards,<br>
        <strong>The Arbre Bio Africa HR Team</strong>
      </p>
    </div>
    <!-- Footer -->
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
      subject: `Welcome to Arbre Bio Africa — Your Worker ID: ${employee.worker_id}`,
      html,
    }),
  });
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
      .from('career_employees').select('*').order('hired_at', { ascending: false });
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
    const { application_id, job_title, department, start_date, contract_url, photo_url,
            first_name, last_name, middle_name, email, phone, birth_date, nationality } = body;

    const workerId = generateWorkerId();

    // Direct creation (no application_id)
    if (!application_id) {
      if (!first_name || !last_name || !email || !birth_date) {
        return new Response(JSON.stringify({ error: 'first_name, last_name, email and birth_date are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const { data: employee, error } = await supabase
        .from('career_employees')
        .insert({
          first_name, middle_name: middle_name || null, last_name, email,
          phone: phone || null, birth_date,
          nationality: nationality || null,
          address: (body.address) || null,
          city: (body.city) || null,
          country: (body.country) || 'Côte d\'Ivoire',
          job_title: job_title || '', department: department || '',
          start_date: start_date || new Date().toISOString().split('T')[0],
          contract_type: (body.contract_type) || 'CDI',
          worker_id: workerId,
          contract_url: contract_url || null,
          photo_url: photo_url || null,
          id_card_front_url: (body.id_card_front_url) || null,
          id_card_back_url: (body.id_card_back_url) || null,
          id_number: (body.id_number) || null,
          id_card_expiry: (body.id_card_expiry) || null,
          gender: (body.gender) || null,
          status: 'active',
        })
        .select().single();
      if (error) throw error;
      // Send welcome email with Worker ID
      await sendWorkerIdEmail(employee).catch(() => {/* non-fatal */});
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
        middle_name: application.middle_name || null,
        last_name: application.last_name,
        email: application.email,
        phone: application.phone || null,
        birth_date: application.birth_date,
        nationality: application.nationality || null,
        job_title: job_title || '',
        department: department || '',
        start_date: start_date || new Date().toISOString().split('T')[0],
        contract_type: (body.contract_type) || 'CDI',
        worker_id: workerId,
        contract_url: contract_url || null,
        photo_url: photo_url || null,
        status: 'active',
      })
      .select().single();
    if (error) throw error;

    await supabase.from('career_applications').update({ employee_id: employee.id, status: 'hired' }).eq('id', application_id);
    await supabase.from('career_application_timeline').insert({ application_id, status: 'hired', note: `Employee record created. Worker ID: ${workerId}` });

    // Send welcome email with Worker ID
    await sendWorkerIdEmail(employee).catch(() => {/* non-fatal */});

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
