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

/**
 * GET /api/sales-agent/inventory
 * Returns products list — READ-ONLY for agents (no mutation exposed).
 *
 * Query params:
 *   search      — text search on name/sku
 *   category_id — filter by category UUID
 *   in_stock    — 'true' to show only products with stock > 0
 *   limit       — max results (default 50, max 200)
 *   offset      — pagination offset
 */
export const GET: APIRoute = async ({ request, url }) => {
  try {
    const token = extractToken(request);
    if (!token) return json({ error: 'Missing token' }, 401);

    const supabase = getSupabaseAdmin();
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return json({ error: 'Invalid or expired token' }, 401);

    const { data: profile } = await supabase
      .from('sales_agent_profiles')
      .select('id, is_active')
      .eq('id', user.id)
      .single();
    if (!profile?.is_active) return json({ error: 'Account suspended' }, 403);

    const search = url.searchParams.get('search') || '';
    const categoryId = url.searchParams.get('category_id') || '';
    const inStockOnly = url.searchParams.get('in_stock') === 'true';
    const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') ?? '50')));
    const offset = Math.max(0, parseInt(url.searchParams.get('offset') ?? '0'));

    let query = supabase
      .from('admin_products')
      .select(`
        id, name, sku, description, unit_price, stock_quantity, unit_of_measure,
        photo_url, is_active,
        admin_product_categories(id, name)
      `)
      .eq('is_active', true)
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    if (inStockOnly) {
      query = query.gt('stock_quantity', 0);
    }

    const { data: products, error } = await query;
    if (error) throw error;

    return json({ products: products ?? [] });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};
