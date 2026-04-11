export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function extractToken(request: Request): string | null {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7).trim();
}

async function verifyAgent(token: string, supabase: ReturnType<typeof getSupabaseAdmin>) {
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  const { data: profile } = await supabase
    .from('sales_agent_profiles')
    .select('id, is_active')
    .eq('id', user.id)
    .single();
  if (!profile?.is_active) return null;
  return user;
}

/**
 * GET /api/sales-agent/customers
 *   ?search=   ?limit=   ?offset=
 *
 * POST /api/sales-agent/customers
 *   Body: { full_name, email?, phone?, company_name?, address?, city?, country?, customer_type?, notes? }
 *
 * PUT /api/sales-agent/customers
 *   Body: { id, ...fields }
 *
 * DELETE /api/sales-agent/customers
 *   Body: { id }
 */
export const GET: APIRoute = async ({ request, url }) => {
  try {
    const token = extractToken(request);
    if (!token) return json({ error: 'Missing token' }, 401);
    const supabase = getSupabaseAdmin();
    const user = await verifyAgent(token, supabase);
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const search = url.searchParams.get('search') || '';
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '50')));
    const offset = Math.max(0, parseInt(url.searchParams.get('offset') ?? '0'));

    let query = supabase
      .from('admin_customers')
      .select('id, full_name, email, phone, company_name, address, city, country, customer_type, notes, created_at')
      .order('full_name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,company_name.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return json({ customers: data ?? [] });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const token = extractToken(request);
    if (!token) return json({ error: 'Missing token' }, 401);
    const supabase = getSupabaseAdmin();
    const user = await verifyAgent(token, supabase);
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const body = await request.json();
    const { full_name, email, phone, company_name, address, city, country, customer_type, notes } = body;

    if (!full_name?.trim()) return json({ error: 'full_name is required' }, 400);
    if (!email?.trim()) return json({ error: 'email is required' }, 400);

    const { data, error } = await supabase
      .from('admin_customers')
      .insert({
        full_name: full_name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        company_name: company_name?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        country: country?.trim() || 'Côte d\'Ivoire',
        customer_type: customer_type || 'farmer',
        notes: notes?.trim() || null,
      })
      .select()
      .single();

    if (error) throw error;
    return json({ customer: data }, 201);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const token = extractToken(request);
    if (!token) return json({ error: 'Missing token' }, 401);
    const supabase = getSupabaseAdmin();
    const user = await verifyAgent(token, supabase);
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return json({ error: 'id is required' }, 400);

    const allowed = ['full_name', 'email', 'phone', 'company_name', 'address', 'city', 'country', 'customer_type', 'notes'];
    const safe: Record<string, any> = {};
    for (const k of allowed) {
      if (k in updates) safe[k] = updates[k];
    }

    const { data, error } = await supabase
      .from('admin_customers')
      .update(safe)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return json({ customer: data });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const token = extractToken(request);
    if (!token) return json({ error: 'Missing token' }, 401);
    const supabase = getSupabaseAdmin();
    const user = await verifyAgent(token, supabase);
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const body = await request.json();
    if (!body.id) return json({ error: 'id is required' }, 400);

    const { error } = await supabase
      .from('admin_customers')
      .delete()
      .eq('id', body.id);

    if (error) throw error;
    return json({ success: true });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};
