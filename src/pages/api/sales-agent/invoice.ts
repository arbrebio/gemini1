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
 * GET /api/sales-agent/invoice?id=<sale_id>
 * Returns full invoice data for a validated sale owned by the authenticated agent.
 */
export const GET: APIRoute = async ({ request, url }) => {
  try {
    const token = extractToken(request);
    if (!token) return json({ error: 'Missing token' }, 401);

    const supabase = getSupabaseAdmin();
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return json({ error: 'Unauthorized' }, 401);

    const saleId = url.searchParams.get('id');
    if (!saleId) return json({ error: 'id is required' }, 400);

    // Fetch sale — agent can only access their own sales
    const { data: sale, error: saleErr } = await supabase
      .from('sales_records')
      .select('*')
      .eq('id', saleId)
      .eq('agent_id', user.id)
      .single();

    if (saleErr || !sale) return json({ error: 'Sale not found' }, 404);
    if (sale.status !== 'validated') return json({ error: 'Invoice only available for validated sales' }, 400);

    // Fetch line items if they exist (Phase 3 multi-product)
    const { data: lineItems } = await supabase
      .from('sales_line_items')
      .select('*')
      .eq('sale_id', saleId)
      .order('created_at', { ascending: true });

    // Try to find client details in admin_customers by name match
    const { data: clientRecord } = await supabase
      .from('admin_customers')
      .select('full_name, email, phone, address, city, country, company_name')
      .ilike('full_name', sale.client_name)
      .limit(1)
      .maybeSingle();

    // Build items list — prefer line_items, fall back to single product on sale
    const items = (lineItems && lineItems.length > 0)
      ? lineItems.map((li: any) => ({
          product_name: li.product_name,
          quantity:     Number(li.quantity),
          unit_price:   Number(li.unit_price),
          unit:         'Unité',
          line_total:   Number(li.line_total ?? li.quantity * li.unit_price),
        }))
      : [{
          product_name: sale.product_name || 'Produit',
          quantity:     Number(sale.quantity ?? 1),
          unit_price:   Number(sale.unit_price ?? sale.total_amount),
          unit:         'Unité',
          line_total:   Number(sale.total_amount),
        }];

    return json({
      sale: {
        id:                   sale.id,
        invoice_number:       sale.invoice_number || `AB-${new Date().getFullYear()}-XXXX`,
        client_name:          sale.client_name,
        agent_name:           sale.agent_name,
        worker_id:            sale.worker_id,
        total_amount:         Number(sale.total_amount),
        payment_method:       sale.payment_method,
        transaction_reference: sale.transaction_reference,
        notes:                sale.notes,
        created_at:           sale.created_at,
        validated_at:         sale.validated_at,
      },
      items,
      client: clientRecord ?? null,
    });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};
