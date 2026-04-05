export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

function generateOrderNumber(): string {
  const d = new Date();
  return `PO-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${Math.floor(Math.random()*9000+1000)}`;
}

// ── GET ─────────────────────────────────────────────────────────
export const GET: APIRoute = async ({ url }) => {
  try {
    const sb = getSupabase();
    const id      = url.searchParams.get('id');
    const action  = url.searchParams.get('action'); // orders | deliveries | notes
    const status  = url.searchParams.get('status');
    const category= url.searchParams.get('category');

    // Single supplier detail with sub-resources
    if (id && action === 'orders') {
      const { data, error } = await sb.from('supplier_orders').select('*').eq('supplier_id', id).order('created_at', { ascending: false });
      if (error) throw error;
      return json({ orders: data || [] });
    }
    if (id && action === 'deliveries') {
      const { data, error } = await sb.from('supplier_deliveries').select('*, supplier_orders(order_number)').eq('supplier_id', id).order('created_at', { ascending: false });
      if (error) throw error;
      return json({ deliveries: data || [] });
    }
    if (id && action === 'notes') {
      const { data, error } = await sb.from('supplier_notes').select('*').eq('supplier_id', id).order('created_at', { ascending: false });
      if (error) throw error;
      return json({ notes: data || [] });
    }
    if (id && action === 'contacts') {
      const { data, error } = await sb.from('supplier_contacts').select('*').eq('supplier_id', id).order('is_primary', { ascending: false });
      if (error) throw error;
      return json({ contacts: data || [] });
    }
    if (id) {
      const { data: supplier, error } = await sb.from('suppliers').select('*').eq('id', id).single();
      if (error) throw error;
      return json({ supplier });
    }

    // List with optional filters
    let q = sb.from('suppliers').select('*').order('created_at', { ascending: false });
    if (status) q = q.eq('status', status);
    if (category) q = q.eq('category', category);
    const { data, error } = await q;
    if (error) throw error;
    return json({ suppliers: data || [] });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

// ── POST ─────────────────────────────────────────────────────────
export const POST: APIRoute = async ({ request }) => {
  try {
    const sb = getSupabase();
    const body = await request.json();
    const { _action, ...payload } = body;

    if (_action === 'add_note') {
      const { supplier_id, content } = payload;
      const { data, error } = await sb.from('supplier_notes').insert({ supplier_id, content }).select().single();
      if (error) throw error;
      return json({ note: data }, 201);
    }
    if (_action === 'add_contact') {
      const { data, error } = await sb.from('supplier_contacts').insert(payload).select().single();
      if (error) throw error;
      return json({ contact: data }, 201);
    }
    if (_action === 'create_order') {
      const { supplier_id, items, total_amount, currency, notes, expected_at } = payload;
      const { data, error } = await sb.from('supplier_orders').insert({
        supplier_id,
        order_number: generateOrderNumber(),
        items: items || [],
        total_amount: total_amount || null,
        currency: currency || 'XOF',
        notes: notes || null,
        expected_at: expected_at || null,
        status: 'draft',
      }).select().single();
      if (error) throw error;
      return json({ order: data }, 201);
    }
    if (_action === 'record_delivery') {
      const { order_id, supplier_id, tracking_number, carrier, items_received, quality_ok, quality_notes } = payload;
      const isComplete = (items_received || []).every((i: any) => i.qty_received >= i.qty_ordered);
      const { data: delivery, error } = await sb.from('supplier_deliveries').insert({
        order_id, supplier_id, tracking_number, carrier,
        items_received: items_received || [],
        is_complete: isComplete,
        quality_ok: quality_ok ?? true,
        quality_notes: quality_notes || null,
        received_at: new Date().toISOString(),
      }).select().single();
      if (error) throw error;
      // Update order status
      const newStatus = isComplete ? 'delivered' : 'partially_delivered';
      await sb.from('supplier_orders').update({ status: newStatus }).eq('id', order_id);
      return json({ delivery }, 201);
    }

    // Create supplier
    const { data: supplier, error } = await sb.from('suppliers').insert(payload).select().single();
    if (error) throw error;
    return json({ supplier }, 201);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

// ── PUT ──────────────────────────────────────────────────────────
export const PUT: APIRoute = async ({ request }) => {
  try {
    const sb = getSupabase();
    const body = await request.json();
    const { id, _action, ...updates } = body;
    if (!id) return json({ error: 'id required' }, 400);

    if (_action === 'update_status') {
      const { status, reason } = updates;
      const { data: sup } = await sb.from('suppliers').select('status').eq('id', id).single();
      await sb.from('supplier_status_log').insert({ supplier_id: id, old_status: sup?.status, new_status: status, reason });
      const { data, error } = await sb.from('suppliers').update({ status }).eq('id', id).select().single();
      if (error) throw error;
      return json({ supplier: data });
    }
    if (_action === 'update_order') {
      const { data, error } = await sb.from('supplier_orders').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return json({ order: data });
    }

    const { data: supplier, error } = await sb.from('suppliers').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return json({ supplier });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

// ── DELETE ───────────────────────────────────────────────────────
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const sb = getSupabase();
    const { id, _target } = await request.json();
    if (!id) return json({ error: 'id required' }, 400);

    if (_target === 'note') {
      await sb.from('supplier_notes').delete().eq('id', id);
    } else if (_target === 'contact') {
      await sb.from('supplier_contacts').delete().eq('id', id);
    } else if (_target === 'order') {
      await sb.from('supplier_orders').delete().eq('id', id);
    } else {
      await sb.from('suppliers').delete().eq('id', id);
    }
    return json({ success: true });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
