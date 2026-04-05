export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const FROM_ADDRESS = 'Arbre Bio Africa <farms@newsletter.arbrebio.com>';

function getSupabase() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, import.meta.env.SUPABASE_SERVICE_ROLE_KEY || key);
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const resendKey = import.meta.env.RESEND_API_KEY;
  if (!resendKey) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_ADDRESS, to: [to], subject, html }),
  });
}

const statusMessages: Record<string, { subject: string; body: string }> = {
  under_review: {
    subject: 'Your Application is Under Review — Arbre Bio Africa',
    body: 'Great news! Our HR team is now reviewing your application.',
  },
  interview_scheduled: {
    subject: 'Interview Scheduled — Arbre Bio Africa',
    body: 'Congratulations! We would like to invite you for an interview. Our team will contact you shortly with the details.',
  },
  interview_done: {
    subject: 'Interview Complete — Arbre Bio Africa',
    body: 'Thank you for attending the interview. We are currently evaluating your profile and will be in touch soon.',
  },
  offer_sent: {
    subject: 'Offer Letter Sent — Arbre Bio Africa',
    body: 'We are pleased to extend an offer to you. Please check your email for the offer details.',
  },
  hired: {
    subject: 'Welcome to Arbre Bio Africa!',
    body: 'Congratulations! We are delighted to welcome you to the Arbre Bio Africa team. You can now access your employee profile via the Applicant Portal.',
  },
  rejected: {
    subject: 'Application Update — Arbre Bio Africa',
    body: 'Thank you for your interest in Arbre Bio Africa. After careful consideration, we have decided to move forward with other candidates. We encourage you to apply for future openings.',
  },
};

// GET — list applications
export const GET: APIRoute = async ({ url }) => {
  try {
    const supabase = getSupabase();
    const id = url.searchParams.get('id');
    const status = url.searchParams.get('status');
    const jobId = url.searchParams.get('job_id');

    if (id) {
      const { data: application, error } = await supabase
        .from('career_applications')
        .select(`*, career_jobs(title_en, title_fr), career_documents(*), career_application_timeline(*)`)
        .eq('id', id)
        .single();
      if (error) throw error;

      // Generate signed URLs (valid 1 hour) for each document stored in private bucket
      if (application?.career_documents?.length) {
        application.career_documents = await Promise.all(
          application.career_documents.map(async (doc: any) => {
            const { data: signedData } = await supabase.storage
              .from('career-documents')
              .createSignedUrl(doc.file_url, 3600); // 1 hour
            return { ...doc, signed_url: signedData?.signedUrl || null };
          })
        );
      }

      return new Response(JSON.stringify({ application }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    let query = supabase
      .from('career_applications')
      .select(`id, first_name, last_name, email, phone, status, portal_token, submitted_at, job_id, career_jobs(title_en)`)
      .order('submitted_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (jobId) query = query.eq('job_id', jobId);

    const { data: applications, error } = await query;
    if (error) throw error;
    return new Response(JSON.stringify({ applications: applications || [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

// PUT — update application status
export const PUT: APIRoute = async ({ request }) => {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { id, status, note, admin_notes, rejection_reason, notify_applicant } = body;

    if (!id || !status) {
      return new Response(JSON.stringify({ error: 'id and status required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Update application
    const updates: any = { status };
    if (admin_notes !== undefined) updates.admin_notes = admin_notes;
    if (rejection_reason !== undefined) updates.rejection_reason = rejection_reason;
    if (status === 'under_review') updates.reviewed_at = new Date().toISOString();

    const { data: application, error } = await supabase
      .from('career_applications').update(updates).eq('id', id).select().single();
    if (error) throw error;

    // Add timeline entry
    await supabase.from('career_application_timeline').insert({
      application_id: id,
      status,
      note: note || null,
    });

    // Send email notification to applicant
    if (notify_applicant !== false && statusMessages[status]) {
      const msg = statusMessages[status];
      const customNote = note ? `<p><em>${note}</em></p>` : '';
      await sendEmail(
        application.portal_email,
        msg.subject,
        `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;color:#333;line-height:1.6">
          <div style="max-width:600px;margin:0 auto;padding:24px">
            <h2 style="color:#194642">Application Status Update</h2>
            <p>Dear ${application.first_name} ${application.last_name},</p>
            <p>${msg.body}</p>
            ${customNote}
            <p>Track your application: <a href="https://arbrebio.com/en/careers/portal" style="color:#194642">Applicant Portal</a></p>
            <p>Your reference token: <code style="background:#f0f9f0;padding:4px 8px;border-radius:4px">${application.portal_token}</code></p>
            <p>Best regards,<br>Arbre Bio Africa HR Team</p>
          </div>
        </body></html>`
      );
    }

    return new Response(JSON.stringify({ application }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

// DELETE — delete application
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const supabase = getSupabase();
    const { id } = await request.json();
    if (!id) return new Response(JSON.stringify({ error: 'id required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    const { error } = await supabase.from('career_applications').delete().eq('id', id);
    if (error) throw error;
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
