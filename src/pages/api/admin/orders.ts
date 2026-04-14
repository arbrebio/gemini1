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

async function generateOrderNumber(supabase: ReturnType<typeof sb>): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ORD-${year}-`;

  // Find the highest existing order number for this year
  const { data } = await supabase
    .from('admin_orders')
    .select('order_number')
    .ilike('order_number', `${prefix}%`)
    .order('order_number', { ascending: false })
    .limit(1);

  let seq = 1;
  if (data && data.length > 0) {
    const last = data[0].order_number as string;
    const parts = last.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) seq = lastSeq + 1;
  }

  return `${prefix}${String(seq).padStart(4, '0')}`;
}

// ── GET ──────────────────────────────────────────────────────────────────────
export const GET: APIRoute = async ({ url, request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = sb();
    const id        = url.searchParams.get('id');
    const search    = url.searchParams.get('search') ?? '';
    const status    = url.searchParams.get('status') ?? '';
    const from_date = url.searchParams.get('from_date') ?? '';
    const to_date   = url.searchParams.get('to_date') ?? '';

    // Single order with items and status history
    if (id) {
      const { data: order, error: orderError } = await supabase
        .from('admin_orders')
        .select('*, admin_customers(id, full_name, email, phone, company_name)')
        .eq('id', id)
        .single();
      if (orderError) throw orderError;

      const { data: items, error: itemsError } = await supabase
        .from('admin_order_items')
        .select('*, admin_products(id, name, sku, unit_of_measure)')
        .eq('order_id', id)
        .order('created_at', { ascending: true });
      if (itemsError) throw itemsError;

      const { data: history, error: historyError } = await supabase
        .from('admin_order_status_history')
        .select('*')
        .eq('order_id', id)
        .order('created_at', { ascending: false });
      if (historyError) throw historyError;

      return json({ order: { ...order, items: items ?? [], history: history ?? [] } });
    }

    // List orders
    let q = supabase
      .from('admin_orders')
      .select('*, admin_customers(id, full_name, email, company_name)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status)    q = q.eq('status', status);
    if (from_date) q = q.gte('created_at', from_date);
    if (to_date)   q = q.lte('created_at', to_date + 'T23:59:59Z');

    if (search) {
      q = q.or(`order_number.ilike.%${search}%,notes.ilike.%${search}%`);
    }

    const { data, error, count } = await q;
    if (error) throw error;
    return json({ orders: data ?? [], total: count ?? 0 });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

// ── POST ─────────────────────────────────────────────────────────────────────
export const POST: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = sb();
    const body = await request.json();
    const {
      customer_id,
      notes,
      delivery_address,
      delivery_date,
      items,
    } = body;

    if (!customer_id) return json({ error: 'customer_id is required' }, 400);
    if (!items || !Array.isArray(items) || items.length === 0) {
      return json({ error: 'items array is required and must not be empty' }, 400);
    }

    // Calculate total_amount
    const total_amount: number = items.reduce(
      (sum: number, item: { quantity: number; unit_price: number }) =>
        sum + (item.quantity ?? 0) * (item.unit_price ?? 0),
      0
    );

    const order_number = await generateOrderNumber(supabase);

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('admin_orders')
      .insert({
        order_number,
        customer_id,
        status: 'draft',
        total_amount,
        notes: notes ?? null,
        delivery_address: delivery_address ?? null,
        delivery_date: delivery_date ?? null,
      })
      .select()
      .single();
    if (orderError) throw orderError;

    // Insert items
    const itemRows = items.map((item: { product_id: string; quantity: number; unit_price: number }) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: (item.quantity ?? 0) * (item.unit_price ?? 0),
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from('admin_order_items')
      .insert(itemRows)
      .select();
    if (itemsError) throw itemsError;

    // Insert initial status history entry
    await supabase.from('admin_order_status_history').insert({
      order_id: order.id,
      status: 'draft',
      notes: 'Order created',
    });

    return json({ order: { ...order, items: insertedItems ?? [] } }, 201);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

// ── PUT ──────────────────────────────────────────────────────────────────────
export const PUT: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = sb();
    const body = await request.json();
    const { id, status, notes, delivery_address, delivery_date, items, ...rest } = body;

    if (!id) return json({ error: 'id is required' }, 400);

    // Fetch current order to check status change
    const { data: existing, error: fetchError } = await supabase
      .from('admin_orders')
      .select('status')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;

    // Build updates object
    const updates: Record<string, any> = { ...rest };
    if (status !== undefined)           updates.status           = status;
    if (notes !== undefined)            updates.notes            = notes;
    if (delivery_address !== undefined) updates.delivery_address = delivery_address;
    if (delivery_date !== undefined)    updates.delivery_date    = delivery_date;

    // Recalculate total if items are being replaced
    if (items && Array.isArray(items)) {
      updates.total_amount = items.reduce(
        (sum: number, item: { quantity: number; unit_price: number }) =>
          sum + (item.quantity ?? 0) * (item.unit_price ?? 0),
        0
      );
    }

    // Mark fulfilled_at if transitioning to delivered
    if (status === 'delivered' && existing.status !== 'delivered') {
      updates.fulfilled_at = new Date().toISOString();
    }

    const { data: order, error: updateError } = await supabase
      .from('admin_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (updateError) throw updateError;

    // Log status change
    if (status && status !== existing.status) {
      await supabase.from('admin_order_status_history').insert({
        order_id: id,
        status,
        notes: notes ?? null,
      });
    }

    // Replace items if provided
    let updatedItems = null;
    if (items && Array.isArray(items)) {
      // Delete existing items first
      await supabase.from('admin_order_items').delete().eq('order_id', id);

      const itemRows = items.map((item: { product_id: string; quantity: number; unit_price: number }) => ({
        order_id: id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: (item.quantity ?? 0) * (item.unit_price ?? 0),
      }));

      const { data: newItems, error: itemsError } = await supabase
        .from('admin_order_items')
        .insert(itemRows)
        .select();
      if (itemsError) throw itemsError;
      updatedItems = newItems;
    }

    return json({ order: updatedItems ? { ...order, items: updatedItems } : order });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

// ── DELETE ───────────────────────────────────────────────────────────────────
export const DELETE: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = sb();
    const { id } = await request.json();

    if (!id) return json({ error: 'id is required' }, 400);

    // Cascade delete handles order_items and status_history
    const { error } = await supabase
      .from('admin_orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return json({ success: true });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};
