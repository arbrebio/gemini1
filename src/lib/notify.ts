/**
 * Internal notification + WhatsApp helpers.
 *
 * These run server-side with the service-role key and are called DIRECTLY
 * (no HTTP round-trip) from other API routes. This lets the public-facing
 * /api/admin/notifications and /api/admin/whatsapp endpoints stay fully
 * locked behind requireAdminAuth while internal flows (e.g. a sales agent
 * registering a sale) can still create notifications.
 *
 * Never expose these over an unauthenticated route.
 */
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export interface NotificationInput {
  type?: string;
  message: string;
  entity_id?: string | null;
  entity_type?: string | null;
}

/** Insert an admin notification row. Returns the created row, or null on failure. */
export async function createNotification(input: NotificationInput) {
  if (!input?.message) throw new Error('message is required');
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('admin_notifications')
    .insert({
      type: input.type ?? 'default',
      message: input.message,
      entity_id: input.entity_id ?? null,
      entity_type: input.entity_type ?? null,
      is_read: false,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export interface WhatsAppInput {
  to: string;
  task_title: string;
  employee_name?: string;
  project_name?: string;
  priority?: 'low' | 'medium' | 'high' | string;
  due_date?: string;
  /** When true, `task_title` is treated as the full pre-formatted message body. */
  raw?: boolean;
}

/**
 * Send a WhatsApp message via the Meta Cloud API.
 * Silently no-ops (returns { skipped: true }) when WhatsApp env vars are absent.
 */
export async function sendWhatsApp(input: WhatsAppInput): Promise<{ success?: boolean; skipped?: boolean; message_id?: string; reason?: string }> {
  const { to, task_title } = input;
  if (!to || !task_title) throw new Error('to and task_title are required');

  const waToken = import.meta.env.WHATSAPP_TOKEN;
  const waPhoneId = import.meta.env.WHATSAPP_PHONE_ID;
  if (!waToken || !waPhoneId) {
    return { skipped: true, reason: 'WhatsApp not configured' };
  }

  const normalizedTo = to.replace(/[\s\-()]/g, '').replace(/^\+/, '');

  let messageText: string;
  if (input.raw) {
    messageText = task_title;
  } else {
    const priorityLabel =
      input.priority === 'high' ? '🔴 High' : input.priority === 'low' ? '🟢 Low' : '🟡 Medium';
    const dueLine = input.due_date ? `\n📅 Due: ${new Date(input.due_date).toLocaleDateString('fr-FR')}` : '';
    messageText =
      `Hello ${input.employee_name || 'there'} 👋\n\n` +
      `You have been assigned a new task on *Arbre Bio Africa*:\n\n` +
      `📋 *Task:* ${task_title}\n` +
      `🏗️ *Project:* ${input.project_name || '—'}\n` +
      `⚡ *Priority:* ${priorityLabel}` +
      `${dueLine}\n\n` +
      `Please log in to the admin panel for details.`;
  }

  const res = await fetch(`https://graph.facebook.com/v18.0/${waPhoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${waToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: normalizedTo,
      type: 'text',
      text: { body: messageText },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `WhatsApp API error: ${res.status}`);
  }
  const data = await res.json();
  return { success: true, message_id: data?.messages?.[0]?.id };
}
