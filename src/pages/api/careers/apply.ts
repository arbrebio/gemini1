export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { escapeHtml, globalRateLimiter, getClientIp } from '../../../lib/securityHeaders';

const ADMIN_EMAIL = 'farms@arbrebio.com';
const FROM_ADDRESS = 'Arbre Bio Africa <farms@newsletter.arbrebio.com>';

// Upload restrictions — documents only, capped size, allowlisted extensions.
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB per file
const ALLOWED_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getSupabase() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

async function sendEmail(to: string | string[], subject: string, html: string): Promise<void> {
  const resendKey = import.meta.env.RESEND_API_KEY;
  if (!resendKey) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_ADDRESS, to: Array.isArray(to) ? to : [to], subject, html }),
  });
}

async function uploadFile(supabase: any, file: File, folder: string): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_UPLOAD_BYTES) return null;
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) return null;
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  const { data, error } = await supabase.storage
    .from('career-documents')
    .upload(fileName, arrayBuffer, { contentType: file.type });
  if (error) return null;
  return data.path;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!globalRateLimiter.isAllowed(getClientIp(request))) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
        status: 429, headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = getSupabase();
    const formData = await request.formData();

    const str = (name: string, max: number) =>
      String(formData.get(name) || '').trim().slice(0, max);

    const jobId = str('job_id', 64);
    const firstName = str('first_name', 80);
    const middleName = str('middle_name', 80);
    const lastName = str('last_name', 80);
    const email = str('email', 120).toLowerCase();
    const phone = str('phone', 30);
    const birthDate = str('birth_date', 20);
    const nationality = str('nationality', 80);
    const city = str('city', 80);
    const address = str('address', 200);
    const coverLetter = str('cover_letter', 5000);

    if (!firstName || !lastName || !email || !jobId) {
      return new Response(JSON.stringify({ error: 'Missing required fields.' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!EMAIL_RE.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address.' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch job info
    const { data: job } = await supabase
      .from('career_jobs')
      .select('id, title_en, status')
      .eq('id', jobId)
      .single();

    if (!job || job.status !== 'published') {
      return new Response(JSON.stringify({ error: 'Job not found or no longer accepting applications.' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create application record
    const { data: application, error: appError } = await supabase
      .from('career_applications')
      .insert({
        job_id: jobId,
        first_name: firstName,
        middle_name: middleName || null,
        last_name: lastName,
        email,
        phone: phone || null,
        birth_date: birthDate || null,
        nationality: nationality || null,
        city: city || null,
        address: address || null,
        cover_letter: coverLetter || null,
        portal_email: email,
        status: 'submitted',
      })
      .select('id, portal_token')
      .single();

    if (appError || !application) {
      console.error('Application insert error:', appError);
      return new Response(JSON.stringify({ error: 'Failed to submit application.' }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      });
    }

    const appId = application.id;
    const portalToken = application.portal_token;

    // Upload documents
    const docFields = [
      { name: 'cv', type: 'cv' },
      { name: 'id_card', type: 'id_card' },
      { name: 'diploma', type: 'diploma' },
      { name: 'other', type: 'other' },
    ];

    for (const field of docFields) {
      const file = formData.get(field.name) as File | null;
      if (file && file.size > 0) {
        const path = await uploadFile(supabase, file, `applications/${appId}`);
        if (path) {
          await supabase.from('career_documents').insert({
            application_id: appId,
            doc_type: field.type,
            file_name: file.name,
            file_url: path,
            file_size: file.size,
            mime_type: file.type,
          });
        }
      }
    }

    // Add initial timeline entry
    await supabase.from('career_application_timeline').insert({
      application_id: appId,
      status: 'submitted',
      note: 'Application received',
    });

    // HTML-escape all user-supplied values before interpolating into emails.
    const e = {
      firstName: escapeHtml(firstName),
      middleName: escapeHtml(middleName),
      lastName: escapeHtml(lastName),
      email: escapeHtml(email),
      phone: escapeHtml(phone),
      city: escapeHtml(city),
    };

    // Send confirmation email to applicant
    await sendEmail(email,
      `Application Received — ${job.title_en} | Arbre Bio Africa`,
      `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;color:#333;line-height:1.6">
        <div style="max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#194642">Application Received</h2>
          <p>Dear ${e.firstName} ${e.lastName},</p>
          <p>Thank you for applying for <strong>${job.title_en}</strong> at Arbre Bio Africa. We have received your application.</p>
          <div style="background:#f0f9f0;border:1px solid #c6e8c6;border-radius:8px;padding:16px;margin:20px 0">
            <p style="margin:0 0 8px"><strong>Your Reference Token:</strong></p>
            <p style="font-family:monospace;font-size:18px;color:#194642;margin:0">${portalToken}</p>
          </div>
          <p>Use this token to track your application status at our <a href="https://arbrebio.com/en/careers/portal" style="color:#194642">Applicant Portal</a>.</p>
          <p>Our team will review your application and contact you soon.</p>
          <p>Best regards,<br>The Arbre Bio Africa HR Team</p>
        </div>
      </body></html>`
    );

    // Notify admin
    await sendEmail(ADMIN_EMAIL,
      `New Application: ${firstName} ${lastName} — ${job.title_en}`,
      `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;color:#333">
        <div style="max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#194642">New Job Application</h2>
          <p><strong>Position:</strong> ${job.title_en}</p>
          <p><strong>Applicant:</strong> ${e.firstName} ${e.middleName ? e.middleName + ' ' : ''}${e.lastName}</p>
          <p><strong>Email:</strong> ${e.email}</p>
          <p><strong>Phone:</strong> ${e.phone || 'N/A'}</p>
          <p><strong>City:</strong> ${e.city || 'N/A'}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          <p><a href="https://arbrebio.com/admin/careers/applications" style="background:#194642;color:white;padding:10px 20px;border-radius:6px;text-decoration:none">View in Admin</a></p>
        </div>
      </body></html>`
    );

    return new Response(JSON.stringify({ success: true, portalToken }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('Apply error:', e);
    return new Response(JSON.stringify({ error: 'Server error. Please try again.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
