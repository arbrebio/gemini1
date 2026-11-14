/**
 * Persist website leads (contact form, quote requests) in `site_leads`.
 *
 * Leads used to exist only as an e-mail to the team: if the mail provider
 * rejected the send, the visitor still saw "message sent" and the lead was
 * gone. Storing a row first means a delivery failure is recoverable.
 *
 * Best-effort by design — returns null instead of throwing (e.g. when
 * migration 20261114000000 has not been applied yet), so the caller can
 * decide what to do based on whether the e-mail went out.
 */
import { createClient } from '@supabase/supabase-js';

export interface LeadInput {
  kind: 'contact' | 'quote';
  name: string;
  email: string;
  phone?: string | null;
  lang?: string | null;
  payload: Record<string, unknown>;
}

function getServiceClient() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/** Store a lead. Returns its id, or null if it could not be stored. */
export async function storeLead(input: LeadInput): Promise<string | null> {
  try {
    const supabase = getServiceClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('site_leads')
      .insert({
        kind: input.kind,
        name: input.name.slice(0, 200),
        email: input.email.slice(0, 200),
        phone: input.phone ? input.phone.slice(0, 50) : null,
        lang: input.lang ?? null,
        payload: input.payload,
      })
      .select('id')
      .single();
    if (error) {
      console.error('[leads] could not store lead:', error.message);
      return null;
    }
    return data.id as string;
  } catch (e) {
    console.error('[leads] could not store lead:', e);
    return null;
  }
}

/** Record that the team notification e-mail for a stored lead was delivered. */
export async function markLeadEmailed(id: string | null): Promise<void> {
  if (!id) return;
  try {
    const supabase = getServiceClient();
    if (!supabase) return;
    await supabase.from('site_leads').update({ email_sent: true }).eq('id', id);
  } catch {
    // non-fatal
  }
}
