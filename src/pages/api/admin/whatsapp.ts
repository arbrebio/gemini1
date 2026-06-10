export const prerender = false;

import type { APIRoute } from 'astro';
import { requireAdminAuth } from '../../../lib/adminAuth';
import { sendWhatsApp } from '../../../lib/notify';

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * POST /api/admin/whatsapp
 * Sends a WhatsApp task-assignment notification via Meta Cloud API.
 *
 * Body:
 *   to            — WhatsApp number in international format, e.g. "+221771234567"
 *   employee_name — Display name of the employee
 *   task_title    — Title of the assigned task
 *   project_name  — Name of the project
 *   priority      — low | medium | high
 *   due_date      — ISO date string (optional)
 */
export const POST: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const body = await request.json();
    const { to, employee_name, task_title, project_name, priority, due_date } = body;

    if (!to || !task_title) {
      return json({ error: 'to and task_title are required' }, 400);
    }

    const result = await sendWhatsApp({ to, task_title, employee_name, project_name, priority, due_date });
    return json(result);
  } catch (e: any) {
    // Don't surface WhatsApp failures as blocking errors — log only
    console.error('[whatsapp]', e.message);
    return json({ error: e.message }, 500);
  }
};
