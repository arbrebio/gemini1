export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

function sb() {
  return createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ── GET ──────────────────────────────────────────────────────────────────────
export const GET: APIRoute = async ({ url }) => {
  try {
    const supabase = sb();
    const id      = url.searchParams.get('id');
    const search  = url.searchParams.get('search') ?? '';
    const page    = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'));
    const limit   = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') ?? '50')));

    // Single customer
    if (id) {
      const { data, error } = await supabase
        .from('admin_customers')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return json({ customer: data });
    }

    // List with optional search + pagination
    let q = supabase
      .from('admin_customers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search) {
      q = q.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }

    const { data, error, count } = await q;
    if (error) throw error;
    return json({ customers: data ?? [], total: count ?? 0, page, limit });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

// ── POST ─────────────────────────────────────────────────────────────────────
export const POST: APIRoute = async ({ request }) => {
  try {
    const supabase = sb();
    const body = await request.json();
    const {
      full_name,
      email,
      phone,
      company_name,
      address,
      city,
      region,
      country,
      farm_size_hectares,
      primary_crops,
      customer_type,
      notes,
    } = body;

    if (!full_name || !email) {
      return json({ error: 'full_name and email are required' }, 400);
    }

    const { data, error } = await supabase
      .from('admin_customers')
      .insert({
        full_name,
        email,
        phone: phone ?? null,
        company_name: company_name ?? null,
        address: address ?? null,
        city: city ?? null,
        region: region ?? null,
        country: country ?? null,
        farm_size_hectares: farm_size_hectares ?? null,
        primary_crops: primary_crops ?? null,
        customer_type: customer_type ?? null,
        notes: notes ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return json({ customer: data }, 201);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

// ── PUT ──────────────────────────────────────────────────────────────────────
export const PUT: APIRoute = async ({ request }) => {
  try {
    const supabase = sb();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return json({ error: 'id is required' }, 400);

    const { data, error } = await supabase
      .from('admin_customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return json({ customer: data });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

// ── DELETE ───────────────────────────────────────────────────────────────────
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const supabase = sb();
    const { id } = await request.json();

    if (!id) return json({ error: 'id is required' }, 400);

    const { error } = await supabase
      .from('admin_customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return json({ success: true });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};
