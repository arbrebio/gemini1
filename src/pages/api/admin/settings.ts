export const prerender = false;

import type { APIRoute } from 'astro';
import { requireAdminAuth } from '../../../lib/adminAuth';
import { createClient } from '@supabase/supabase-js';

function sb() {
  return createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const DEFAULT_SETTINGS: Record<string, string> = {
  company_name:        'Arbre Bio Africa',
  company_email:       '',
  company_phone:       '',
  company_address:     '',
  company_city:        'Abidjan',
  company_country:     "Côte d'Ivoire",
  company_website:     '',
  company_vat:         '',
  currency:            'XOF',
  timezone:            'Africa/Abidjan',
  email_notifications: 'true',
  low_stock_threshold: '10',
};

// ── GET ──────────────────────────────────────────────────────────────────────
export const GET: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = sb();

    const { data, error } = await supabase
      .from('admin_site_settings')
      .select('key, value');

    if (error) {
      // Table may not exist yet — return defaults gracefully
      console.warn('admin_site_settings table not ready, returning defaults:', error.message);
      return json({ settings: DEFAULT_SETTINGS });
    }

    // Merge defaults with stored values so all keys are always present
    const settings: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const row of data ?? []) {
      settings[row.key] = row.value ?? '';
    }

    return json({ settings });
  } catch (e: any) {
    return json({ settings: DEFAULT_SETTINGS });
  }
};

// ── POST / PUT ───────────────────────────────────────────────────────────────
// Both POST and PUT upsert a flat {key: value} object.
const upsertSettings: APIRoute = async ({ request }) => {
  try {
    const supabase = sb();
    const body = await request.json();

    if (typeof body !== 'object' || Array.isArray(body)) {
      return json({ error: 'Body must be a flat {key: value} object' }, 400);
    }

    const rows = Object.entries(body as Record<string, any>).map(([key, value]) => ({
      key,
      value: String(value ?? ''),
      updated_at: new Date().toISOString(),
    }));

    if (rows.length === 0) {
      return json({ error: 'No settings provided' }, 400);
    }

    const { error } = await supabase.rpc('upsert_admin_site_settings', { rows_json: rows }).select();

    // If RPC doesn't exist, fall back to raw SQL via the REST API trick:
    // Use individual upserts for each key.
    if (error) {
      // Fallback: upsert row by row using the Supabase client onConflict support
      for (const row of rows) {
        const { error: upsertError } = await supabase
          .from('admin_site_settings')
          .upsert(row, { onConflict: 'key' });
        if (upsertError) throw upsertError;
      }
    }

    // Fetch updated settings
    const { data: updated, error: fetchError } = await supabase
      .from('admin_site_settings')
      .select('key, value');
    if (fetchError) throw fetchError;

    const settings: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const row of updated ?? []) {
      settings[row.key] = row.value ?? '';
    }

    return json({ settings, saved: rows.length });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

export const POST = upsertSettings;
export const PUT  = upsertSettings;
