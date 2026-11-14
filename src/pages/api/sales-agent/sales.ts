export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { createNotification, sendWhatsApp } from '../../../lib/notify';
import { normalizeSaleItems } from '../../../lib/salesStock';
import { attachSignedProofUrls, isOwnProofPath } from '../../../lib/saleProofs';

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

// Compute commission rate based on tenure (days since hired_at)
function computeCommissionRate(hiredAt: string | null): number {
  if (!hiredAt) return 5.0; // Default to lower rate if no hire date
  const msPerDay = 86400000;
  const tenureDays = Math.floor((Date.now() - new Date(hiredAt).getTime()) / msPerDay);
  return tenureDays > 180 ? 8.0 : 5.0;
}

const PAYMENT_LABEL: Record<string, string> = {
  wire_transfer: 'Virement bancaire',
  orange_money: 'Orange Money',
  mtn_money: 'MTN Money',
  moov_money: 'Moov Money',
  wave: 'WAVE',
  cash: 'Espèces',
};

/**
 * GET /api/sales-agent/sales
 * Returns the authenticated agent's own sales.
 *
 * Query params:
 *   status  — pending | validated | rejected
 *   year    — 4-digit year (default current year)
 *   limit   — default 50, max 100
 *   offset  — pagination
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

    const status = url.searchParams.get('status') || '';
    const year = parseInt(url.searchParams.get('year') ?? String(new Date().getFullYear()));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '50')));
    const offset = Math.max(0, parseInt(url.searchParams.get('offset') ?? '0'));

    let query = supabase
      .from('sales_records')
      .select('*')
      .eq('agent_id', user.id)
      .gte('created_at', `${year}-01-01`)
      .lt('created_at', `${year + 1}-01-01`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && ['pending', 'validated', 'rejected'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data: sales, error } = await query;
    if (error) throw error;

    return json({ sales: await attachSignedProofUrls(supabase, sales ?? []) });
  } catch (e: any) {
    console.error("API error:", e);
    return json({ error: "Internal server error" }, 500);
  }
};

/**
 * POST /api/sales-agent/sales
 * Registers a new sale with one or more line items.
 *
 * Body (New format with items array):
 *   items                 — array of { product_name, product_id?, quantity, unit_price }
 *   client_name           — required
 *   payment_method        — required (wire_transfer | orange_money | mtn_money | moov_money | wave | cash)
 *   transaction_reference — optional
 *   proof_url             — optional (storage path from upload-proof API)
 *   proof_file_name       — optional
 *   notes                 — optional
 *
 * Body (Legacy format with single product, for backward compatibility):
 *   product_name          — required
 *   product_id            — optional (UUID of admin_products)
 *   quantity              — required (> 0)
 *   unit_price            — required (>= 0)
 *   total_amount          — required (>= 0)
 *   client_name           — required
 *   payment_method        — required
 *   transaction_reference — optional
 *   proof_url             — optional
 *   proof_file_name       — optional
 *   notes                 — optional
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const token = extractToken(request);
    if (!token) return json({ error: 'Missing token' }, 401);

    const supabase = getSupabaseAdmin();
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return json({ error: 'Invalid or expired token' }, 401);

    // Fetch full agent profile + hire date
    const { data: agent, error: agentErr } = await supabase
      .from('sales_agent_profiles')
      .select('id, full_name, worker_id, is_active, employee_id, career_employees(hired_at)')
      .eq('id', user.id)
      .single();

    if (agentErr || !agent) return json({ error: 'Agent not found' }, 404);
    if (!agent.is_active) return json({ error: 'Account suspended' }, 403);

    const body = await request.json();
    const { client_name, payment_method, transaction_reference, proof_url, proof_file_name, notes } = body;

    // Validation
    if (typeof client_name !== 'string' || !client_name.trim()) return json({ error: 'client_name is required' }, 400);
    if (client_name.length > 200) return json({ error: 'client_name is too long' }, 400);
    const VALID_METHODS = ['wire_transfer', 'orange_money', 'mtn_money', 'moov_money', 'wave', 'cash'];
    if (!VALID_METHODS.includes(payment_method)) return json({ error: 'Invalid payment_method' }, 400);

    const optionalText = (value: unknown, max: number): string | null =>
      typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null;

    // Accept the items array, or the legacy single-product fields (converted
    // to a one-item array). Either way every number is coerced and validated
    // server-side and the total is ALWAYS recomputed from quantity × price —
    // a client-supplied total_amount is never trusted, since it drives the
    // commission.
    const rawItems = Array.isArray(body.items) && body.items.length > 0
      ? body.items
      : [{
          product_name: body.product_name,
          product_id: body.product_id,
          quantity: body.quantity,
          unit_price: body.unit_price,
        }];

    const normalized = normalizeSaleItems(rawItems);
    if (!normalized.ok) return json({ error: normalized.error }, 400);
    const { items, total } = normalized;

    if (total <= 0) return json({ error: 'total_amount must be > 0' }, 400);

    // The proof must be a file this agent uploaded. Without this check the
    // service role would sign ANY path in the bucket, exposing other agents'
    // payment proofs.
    if (proof_url != null && proof_url !== '' && !isOwnProofPath(proof_url, user.id)) {
      return json({ error: 'Invalid proof_url' }, 400);
    }
    const proofPath: string | null = proof_url || null;

    // Commission calculation — locked at creation time
    const hiredAt = (agent.career_employees as any)?.hired_at ?? null;
    const commission_rate = computeCommissionRate(hiredAt);
    const commission_amount = parseFloat(((total * commission_rate) / 100).toFixed(2));

    // Build summary fields for backward-compat display in admin panel
    // (first item used as representative; line_items table holds full detail)
    const firstItem = items[0];
    const productNameSummary = items.length === 1
      ? firstItem.product_name
      : items.map(i => i.product_name).join(', ').slice(0, 1000);

    // Insert sale — keep legacy columns populated so admin panel renders correctly
    const { data: sale, error: insertErr } = await supabase
      .from('sales_records')
      .insert({
        agent_id:             user.id,
        agent_name:           agent.full_name,
        worker_id:            agent.worker_id,
        product_id:           firstItem.product_id,
        product_name:         productNameSummary,
        quantity:             items.reduce((s, i) => s + i.quantity, 0),
        unit_price:           firstItem.unit_price,
        total_amount:         total,
        client_name:          client_name.trim(),
        payment_method,
        transaction_reference: optionalText(transaction_reference, 200),
        proof_url:            proofPath, // storage path — signed on read
        proof_file_name:      optionalText(proof_file_name, 255),
        commission_rate,
        commission_amount,
        status:               'pending',
        notes:                optionalText(notes, 2000),
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    // Insert line items. If this fails the sale row is removed again so the
    // agent's retry does not create a duplicate sale with no line items.
    const lineItemsData = items.map((item) => ({
      sale_id: sale.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));

    const { error: lineItemsErr } = await supabase
      .from('sales_line_items')
      .insert(lineItemsData);

    if (lineItemsErr) {
      const { error: rollbackErr } = await supabase.from('sales_records').delete().eq('id', sale.id);
      if (rollbackErr) console.error('[sales] rollback of sale without line items failed:', rollbackErr);
      throw lineItemsErr;
    }

    // ── Side effects ──────────────────────────────────────────────────────
    // Awaited (in parallel): on serverless the function can be frozen as soon
    // as the response is returned, which silently dropped fire-and-forget
    // notifications. Failures are logged and never fail the sale.

    const baseUrl = import.meta.env.SITE || 'https://www.arbrebio.com';
    const adminSalesUrl = `${baseUrl}/admin/sales/`;
    const amountFormatted = new Intl.NumberFormat('fr-FR').format(total);
    const commissionFormatted = new Intl.NumberFormat('fr-FR').format(commission_amount);
    const clientName = client_name.trim();

    // WhatsApp notification to super admin (+225 05 00 55 25 25)
    const superAdminWhatsApp = '+2250500552525';
    const itemsText = items.map((item) => `  • ${item.product_name} (${item.quantity} × ${item.unit_price} FCFA)`).join('\n');
    const messageText =
      `🔔 *Nouvelle vente à valider*\n\n` +
      `👤 Agent: *${agent.full_name}* (${agent.worker_id || 'N/A'})\n` +
      `🛒 Articles:\n${itemsText}\n` +
      `👨‍💼 Client: *${clientName}*\n` +
      `💰 Montant: *${amountFormatted} FCFA*\n` +
      `💳 Paiement: ${PAYMENT_LABEL[payment_method] || payment_method}\n` +
      `🔖 Réf: ${optionalText(transaction_reference, 200) || 'N/A'}\n` +
      `📊 Commission: ${commission_rate}% = ${commissionFormatted} FCFA\n\n` +
      `→ Validez sur: ${adminSalesUrl}`;

    const sideEffects = await Promise.allSettled([
      // Admin in-app notification (direct DB insert — no unauthenticated HTTP hop)
      createNotification({
        type: 'sale_pending',
        message: `Nouvelle vente à valider — ${agent.full_name} • ${clientName} • ${amountFormatted} FCFA`,
        entity_id: sale.id,
        entity_type: 'sale',
      }),
      sendWhatsApp({ to: superAdminWhatsApp, task_title: messageText, raw: true }),
    ]);
    for (const r of sideEffects) {
      if (r.status === 'rejected') console.error('[sales] notification failed:', r.reason);
    }

    await attachSignedProofUrls(supabase, [sale]);
    return json({ sale, commission_rate, commission_amount }, 201);
  } catch (e: any) {
    console.error("API error:", e);
    return json({ error: "Internal server error" }, 500);
  }
};
