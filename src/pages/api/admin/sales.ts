export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '../../../lib/adminAuth';
import { createNotification, createAgentNotification } from '../../../lib/notify';
import { computeStockDeductions } from '../../../lib/salesStock';
import { attachSignedProofUrls } from '../../../lib/saleProofs';

function getSupabase() {
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

/**
 * Deduct stock for one product. Uses the atomic `decrement_product_stock`
 * database function; if that function has not been created yet (migration
 * 20261114000000 not applied), falls back to read-then-write.
 */
async function deductStock(supabase: ReturnType<typeof getSupabase>, productId: string, quantity: number) {
  const { error: rpcErr } = await supabase.rpc('decrement_product_stock', {
    p_product_id: productId,
    p_quantity: quantity,
  });
  if (!rpcErr) return;

  const fnMissing = rpcErr.code === 'PGRST202' || rpcErr.code === '42883';
  if (!fnMissing) throw rpcErr;

  const { data: product, error: readErr } = await supabase
    .from('admin_products')
    .select('stock_quantity')
    .eq('id', productId)
    .maybeSingle();
  if (readErr) throw readErr;
  if (!product) return; // product was deleted — nothing to deduct

  const newStock = Math.max(0, Number(product.stock_quantity) - Math.ceil(quantity));
  const { error: writeErr } = await supabase
    .from('admin_products')
    .update({ stock_quantity: newStock })
    .eq('id', productId);
  if (writeErr) throw writeErr;
}

/**
 * GET /api/admin/sales
 *   ?status=pending|validated|rejected
 *   ?agent_id=<uuid>
 *   ?year=2026
 *   ?limit=50
 *   ?offset=0
 *   ?stats=true   — returns commission report grouped by agent
 *
 * PUT /api/admin/sales
 *   { id, action: 'validate' | 'reject', rejection_reason? }
 *   Validates or rejects a sale and triggers notifications.
 *
 * DELETE /api/admin/sales
 *   { id }  — removes a sale record (admin only)
 */

export const GET: APIRoute = async ({ url, request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();

    // Commission report mode
    if (url.searchParams.get('stats') === 'true') {
      const year = parseInt(url.searchParams.get('year') ?? String(new Date().getFullYear()));
      const yearStart = `${year}-01-01`;
      const yearEnd = `${year + 1}-01-01`;

      const { data: agents } = await supabase
        .from('sales_agent_profiles')
        .select('id, full_name, worker_id, email, is_active');

      const { data: sales } = await supabase
        .from('sales_records')
        .select('agent_id, total_amount, commission_rate, commission_amount, status')
        .gte('created_at', yearStart)
        .lt('created_at', yearEnd);

      const report = (agents || []).map(agent => {
        const agentSales = (sales || []).filter(s => s.agent_id === agent.id);
        const validated = agentSales.filter(s => s.status === 'validated');
        return {
          ...agent,
          total_count: agentSales.length,
          validated_count: validated.length,
          pending_count: agentSales.filter(s => s.status === 'pending').length,
          rejected_count: agentSales.filter(s => s.status === 'rejected').length,
          validated_amount: validated.reduce((sum, s) => sum + Number(s.total_amount), 0),
          commission_rate: agentSales[0]?.commission_rate ?? null,
          commission_earned: validated.reduce((sum, s) => sum + Number(s.commission_amount), 0),
        };
      });

      return json({ report, year });
    }

    // List sales
    const status = url.searchParams.get('status') || '';
    const agentId = url.searchParams.get('agent_id') || '';
    const year = parseInt(url.searchParams.get('year') ?? String(new Date().getFullYear()));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '50')));
    const offset = Math.max(0, parseInt(url.searchParams.get('offset') ?? '0'));

    let query = supabase
      .from('sales_records')
      .select(`
        *,
        sales_agent_profiles(id, full_name, worker_id, email)
      `)
      .gte('created_at', `${year}-01-01`)
      .lt('created_at', `${year + 1}-01-01`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && ['pending', 'validated', 'rejected'].includes(status)) {
      query = query.eq('status', status);
    }
    if (agentId) {
      query = query.eq('agent_id', agentId);
    }

    const { data: sales, error } = await query;
    if (error) throw error;

    // Counts per status for the same filters. Each status needs its own
    // fresh query builder — Supabase's builder mutates and returns `this`,
    // so reusing one instance across multiple .eq() calls ANDs all three
    // status filters together instead of running three independent counts.
    const countByStatus = (status: string) =>
      supabase
        .from('sales_records')
        .select('status', { count: 'exact', head: true })
        .gte('created_at', `${year}-01-01`)
        .lt('created_at', `${year + 1}-01-01`)
        .eq('status', status);

    const [{ count: pendingCount }, { count: validatedCount }, { count: rejectedCount }] = await Promise.all([
      countByStatus('pending'),
      countByStatus('validated'),
      countByStatus('rejected'),
    ]);

    return json({
      sales: await attachSignedProofUrls(supabase, sales ?? []),
      counts: {
        pending: pendingCount ?? 0,
        validated: validatedCount ?? 0,
        rejected: rejectedCount ?? 0,
      },
    });
  } catch (e: any) {
    console.error("API error:", e);
    return json({ error: "Internal server error" }, 500);
  }
};

export const PUT: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { id, action, rejection_reason } = body;

    if (!id) return json({ error: 'id is required' }, 400);
    if (!['validate', 'reject'].includes(action)) {
      return json({ error: 'action must be validate or reject' }, 400);
    }
    if (action === 'reject' && !rejection_reason?.trim()) {
      return json({ error: 'rejection_reason is required when rejecting' }, 400);
    }

    const update: Record<string, any> = {
      status: action === 'validate' ? 'validated' : 'rejected',
      validated_at: new Date().toISOString(),
    };
    if (action === 'reject') {
      update.rejection_reason = rejection_reason.trim();
    }

    // Generate a collision-resistant invoice number when validating.
    // Using timestamp + random suffix avoids the COUNT→INSERT race condition
    // that occurred with a SELECT count() + 1 approach under concurrent requests.
    if (action === 'validate') {
      const year = new Date().getFullYear();
      const ts = Date.now().toString(36).toUpperCase();
      const rnd = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      update.invoice_number = `AB-${year}-${ts}${rnd}`;
    }

    // Only a PENDING sale can be validated or rejected. The status filter makes
    // the transition atomic: a double click, a retry, or two admins acting at
    // once can match the row only once, so stock is never deducted twice and
    // an already-issued invoice number is never replaced.
    const { data: sale, error } = await supabase
      .from('sales_records')
      .update(update)
      .eq('id', id)
      .eq('status', 'pending')
      .select('*, sales_agent_profiles(full_name, worker_id)')
      .maybeSingle();

    if (error) throw error;
    if (!sale) {
      const { data: existing } = await supabase
        .from('sales_records')
        .select('status')
        .eq('id', id)
        .maybeSingle();
      if (!existing) return json({ error: 'Sale not found' }, 404);
      return json({ error: `Sale has already been ${existing.status}` }, 409);
    }

    // Deduct inventory when validating — per line item, so every product in a
    // multi-product sale is deducted by its own quantity.
    const stockWarnings: string[] = [];
    if (action === 'validate') {
      const { data: lineItems, error: lineErr } = await supabase
        .from('sales_line_items')
        .select('product_id, quantity')
        .eq('sale_id', id);
      if (lineErr) console.error('[admin sales] could not load line items:', lineErr);

      const deductions = computeStockDeductions(sale, lineErr ? null : lineItems);
      for (const [productId, quantity] of deductions) {
        try {
          await deductStock(supabase, productId, quantity);
        } catch (e) {
          console.error(`[admin sales] stock deduction failed for product ${productId}:`, e);
          stockWarnings.push(productId);
        }
      }
    }

    // Notifications are awaited (in parallel): on serverless the function can
    // be frozen as soon as the response is returned, which silently dropped
    // fire-and-forget notifications. Failures are logged, never fatal.
    const statusLabel = action === 'validate' ? '✅ Vente validée' : '❌ Vente rejetée';
    const agentName = (sale.sales_agent_profiles as any)?.full_name || 'Agent';
    const amount = new Intl.NumberFormat('fr-FR').format(Number(sale.total_amount));

    const agentMessage = action === 'validate'
      ? `Votre vente à ${sale.client_name} (${amount} FCFA) a été validée.`
      : `Votre vente à ${sale.client_name} a été rejetée${sale.rejection_reason ? ` : ${sale.rejection_reason}` : '.'}`;

    const results = await Promise.allSettled([
      createNotification({
        type: action === 'validate' ? 'sale_validated' : 'sale_rejected',
        message: `${statusLabel} — ${agentName} • ${sale.client_name} • ${amount} FCFA`,
        entity_id: id,
        entity_type: 'sale',
      }),
      createAgentNotification({
        agent_id: sale.agent_id,
        type: action === 'validate' ? 'sale_validated' : 'sale_rejected',
        message: agentMessage,
        entity_id: id,
        entity_type: 'sale',
      }),
    ]);
    for (const r of results) {
      if (r.status === 'rejected') console.error('[admin sales] notification failed:', r.reason);
    }

    await attachSignedProofUrls(supabase, [sale]);

    if (stockWarnings.length) {
      return json({ sale, warning: 'Sale validated, but stock could not be updated for some products.', stock_failed_product_ids: stockWarnings });
    }

    return json({ sale });
  } catch (e: any) {
    console.error("API error:", e);
    return json({ error: "Internal server error" }, 500);
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();
    const body = await request.json();
    if (!body.id) return json({ error: 'id is required' }, 400);

    const { error } = await supabase.from('sales_records').delete().eq('id', body.id);
    if (error) throw error;
    return json({ success: true });
  } catch (e: any) {
    console.error("API error:", e);
    return json({ error: "Internal server error" }, 500);
  }
};
