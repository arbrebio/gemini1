export const prerender = false;

import type { APIRoute } from 'astro';
import { requireAdminAuth } from '../../../lib/adminAuth';

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

    const waToken    = import.meta.env.WHATSAPP_TOKEN;
    const waPhoneId  = import.meta.env.WHATSAPP_PHONE_ID;

    if (!waToken || !waPhoneId) {
      // Silently skip if not configured — don't break the task-save flow
      return json({ skipped: true, reason: 'WhatsApp not configured' });
    }

    // Normalize number: remove spaces, dashes, parentheses; ensure no leading +
    const normalizedTo = to.replace(/[\s\-()]/g, '').replace(/^\+/, '');

    const priorityLabel = priority === 'high' ? '🔴 High' : priority === 'low' ? '🟢 Low' : '🟡 Medium';
    const dueLine = due_date ? `\n📅 Due: ${new Date(due_date).toLocaleDateString('fr-FR')}` : '';

    const messageText =
      `Hello ${employee_name || 'there'} 👋\n\n` +
      `You have been assigned a new task on *Arbre Bio Africa*:\n\n` +
      `📋 *Task:* ${task_title}\n` +
      `🏗️ *Project:* ${project_name || '—'}\n` +
      `⚡ *Priority:* ${priorityLabel}` +
      `${dueLine}\n\n` +
      `Please log in to the admin panel for details.`;

    const res = await fetch(
      `https://graph.facebook.com/v18.0/${waPhoneId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${waToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: normalizedTo,
          type: 'text',
          text: { body: messageText },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `WhatsApp API error: ${res.status}`);
    }

    const data = await res.json();
    return json({ success: true, message_id: data?.messages?.[0]?.id });
  } catch (e: any) {
    // Don't surface WhatsApp failures as blocking errors — log only
    console.error('[whatsapp]', e.message);
    return json({ error: e.message }, 500);
  }
};
