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
    const action       = url.searchParams.get('action') ?? '';
    const id           = url.searchParams.get('id') ?? '';
    const search       = url.searchParams.get('search') ?? '';
    const category_id  = url.searchParams.get('category_id') ?? '';
    const stock_filter = url.searchParams.get('stock_filter') ?? ''; // low | out | in

    // List all categories
    if (action === 'categories') {
      const { data, error } = await supabase
        .from('admin_product_categories')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return json({ categories: data ?? [] });
    }

    // Single product with category
    if (id) {
      const { data, error } = await supabase
        .from('admin_products')
        .select('*, admin_product_categories(id, name, description)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return json({ product: data });
    }

    // List products with optional filters
    let q = supabase
      .from('admin_products')
      .select('*, admin_product_categories(id, name)', { count: 'exact' })
      .order('name', { ascending: true });

    if (search)      q = q.ilike('name', `%${search}%`);
    if (category_id) q = q.eq('category_id', category_id);

    if (stock_filter === 'out') {
      q = q.eq('stock_quantity', 0);
    } else if (stock_filter === 'low') {
      // stock_quantity > 0 but <= reorder_level
      q = q.gt('stock_quantity', 0).lte('stock_quantity', supabase.from('admin_products').select('reorder_level'));
      // Supabase JS v2 doesn't support column-to-column comparison directly; use filter
      // Reset and use raw filter
      q = supabase
        .from('admin_products')
        .select('*, admin_product_categories(id, name)', { count: 'exact' })
        .order('name', { ascending: true })
        .gt('stock_quantity', 0)
        .filter('stock_quantity', 'lte', 'reorder_level');
      if (search)      q = q.ilike('name', `%${search}%`);
      if (category_id) q = q.eq('category_id', category_id);
    } else if (stock_filter === 'in') {
      q = q.gt('stock_quantity', 0);
    }

    const { data, error, count } = await q;
    if (error) throw error;
    return json({ products: data ?? [], total: count ?? 0 });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

// ── POST ─────────────────────────────────────────────────────────────────────
export const POST: APIRoute = async ({ request }) => {
  try {
    const supabase = sb();
    const body = await request.json();
    const { _action, ...payload } = body;

    // Create category
    if (_action === 'create_category') {
      const { name, description } = payload;
      if (!name) return json({ error: 'name is required' }, 400);

      const { data, error } = await supabase
        .from('admin_product_categories')
        .insert({ name, description: description ?? null })
        .select()
        .single();
      if (error) throw error;
      return json({ category: data }, 201);
    }

    // Adjust stock
    if (_action === 'adjust_stock') {
      const { product_id, adjustment, reason } = payload;
      if (!product_id) return json({ error: 'product_id is required' }, 400);
      const adj = parseInt(adjustment, 10) || 0;
      // Fetch current stock
      const { data: prod, error: fetchErr } = await supabase
        .from('admin_products').select('stock_quantity').eq('id', product_id).single();
      if (fetchErr) throw fetchErr;
      const newQty = (prod?.stock_quantity ?? 0) + adj;
      const { data, error } = await supabase
        .from('admin_products')
        .update({ stock_quantity: Math.max(0, newQty) })
        .eq('id', product_id)
        .select().single();
      if (error) throw error;
      return json({ product: data });
    }

    // Create product
    const {
      name,
      description,
      sku,
      category_id,
      unit_price,
      unit_of_measure,
      stock_quantity,
      reorder_level,
      is_active,
    } = payload;

    if (!name) return json({ error: 'name is required' }, 400);

    const { data, error } = await supabase
      .from('admin_products')
      .insert({
        name,
        description: description ?? null,
        sku: sku ?? null,
        category_id: category_id ?? null,
        unit_price: unit_price ?? 0,
        unit_of_measure: unit_of_measure ?? 'piece',
        stock_quantity: stock_quantity ?? 0,
        reorder_level: reorder_level ?? 0,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single();
    if (error) throw error;
    return json({ product: data }, 201);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

// ── PUT ──────────────────────────────────────────────────────────────────────
export const PUT: APIRoute = async ({ request }) => {
  try {
    const supabase = sb();
    const body = await request.json();
    const { id, _target, ...updates } = body;

    if (!id) return json({ error: 'id is required' }, 400);

    // Update category
    if (_target === 'category') {
      const { data, error } = await supabase
        .from('admin_product_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return json({ category: data });
    }

    // Update product
    const { data, error } = await supabase
      .from('admin_products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return json({ product: data });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

// ── DELETE ───────────────────────────────────────────────────────────────────
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const supabase = sb();
    const { id, _target } = await request.json();

    if (!id) return json({ error: 'id is required' }, 400);

    if (_target === 'category') {
      const { error } = await supabase
        .from('admin_product_categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('admin_products')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }

    return json({ success: true });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};
