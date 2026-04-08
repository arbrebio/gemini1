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

    return json({ sales: sales ?? [] });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

/**
 * POST /api/sales-agent/sales
 * Registers a new sale.
 *
 * Body:
 *   product_name          — required
 *   product_id            — optional (UUID of admin_products)
 *   quantity              — required (> 0)
 *   unit_price            — required (>= 0)
 *   total_amount          — required (>= 0)
 *   client_name           — required
 *   payment_method        — required (wire_transfer | orange_money | mtn_money | moov_money | wave | cash)
 *   transaction_reference — optional
 *   proof_url             — optional (storage path from upload-proof API)
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
    const {
      product_name, product_id, quantity, unit_price, total_amount,
      client_name, payment_method, transaction_reference, proof_url, proof_file_name, notes,
    } = body;

    // Validation
    if (!product_name?.trim()) return json({ error: 'product_name is required' }, 400);
    if (!client_name?.trim()) return json({ error: 'client_name is required' }, 400);
    const VALID_METHODS = ['wire_transfer', 'orange_money', 'mtn_money', 'moov_money', 'wave', 'cash'];
    if (!VALID_METHODS.includes(payment_method)) return json({ error: 'Invalid payment_method' }, 400);
    const qty = Number(quantity);
    const uprice = Number(unit_price);
    const total = Number(total_amount);
    if (!qty || qty <= 0) return json({ error: 'quantity must be > 0' }, 400);
    if (isNaN(uprice) || uprice < 0) return json({ error: 'unit_price must be >= 0' }, 400);
    if (isNaN(total) || total < 0) return json({ error: 'total_amount must be >= 0' }, 400);

    // Commission calculation — locked at creation time
    const hiredAt = (agent.career_employees as any)?.hired_at ?? null;
    const commission_rate = computeCommissionRate(hiredAt);
    const commission_amount = parseFloat(((total * commission_rate) / 100).toFixed(2));

    // Build signed URL for proof if path provided
    let fullProofUrl: string | null = null;
    if (proof_url) {
      const { data: signedData } = await supabase.storage
        .from('sale-proofs')
        .createSignedUrl(proof_url, 220752000);
      fullProofUrl = signedData?.signedUrl ?? proof_url;
    }

    // Insert sale
    const { data: sale, error: insertErr } = await supabase
      .from('sales_records')
      .insert({
        agent_id:             user.id,
        agent_name:           agent.full_name,
        worker_id:            agent.worker_id,
        product_id:           product_id || null,
        product_name:         product_name.trim(),
        quantity:             qty,
        unit_price:           uprice,
        total_amount:         total,
        client_name:          client_name.trim(),
        payment_method,
        transaction_reference: transaction_reference?.trim() || null,
        proof_url:            fullProofUrl,
        proof_file_name:      proof_file_name || null,
        commission_rate,
        commission_amount,
        status:               'pending',
        notes:                notes?.trim() || null,
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    // ── Non-blocking side effects ─────────────────────────────────────────

    const baseUrl = import.meta.env.SITE || 'https://arbrebioafrica.com';
    const adminSalesUrl = `${baseUrl}/admin/sales`;
    const amountFormatted = new Intl.NumberFormat('fr-FR').format(total);
    const commissionFormatted = new Intl.NumberFormat('fr-FR').format(commission_amount);

    // 1. Admin in-app notification
    fetch(`${baseUrl}/api/admin/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'sale_pending',
        message: `Nouvelle vente à valider — ${agent.full_name} • ${client_name} • ${amountFormatted} FCFA`,
        entity_id: sale.id,
        entity_type: 'sale',
      }),
    }).catch(() => {});

    // 2. WhatsApp notification to super admin (+225 05 00 55 25 25)
    const superAdminWhatsApp = '+22505005525 25';
    const messageText =
      `🔔 *Nouvelle vente à valider*\n\n` +
      `👤 Agent: *${agent.full_name}* (${agent.worker_id || 'N/A'})\n` +
      `🛒 Produit: ${product_name}\n` +
      `👨‍💼 Client: *${client_name}*\n` +
      `💰 Montant: *${amountFormatted} FCFA*\n` +
      `💳 Paiement: ${PAYMENT_LABEL[payment_method] || payment_method}\n` +
      `🔖 Réf: ${transaction_reference || 'N/A'}\n` +
      `📊 Commission: ${commission_rate}% = ${commissionFormatted} FCFA\n\n` +
      `→ Validez sur: ${adminSalesUrl}`;

    fetch(`${baseUrl}/api/admin/whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: superAdminWhatsApp, task_title: messageText }),
    }).catch(() => {});

    return json({ sale, commission_rate, commission_amount }, 201);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};
