export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role not configured');
  return createClient(url, key);
}

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
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

export const GET: APIRoute = async ({ url }) => {
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

    // Counts per status for the same filters
    const countQuery = supabase
      .from('sales_records')
      .select('status', { count: 'exact' })
      .gte('created_at', `${year}-01-01`)
      .lt('created_at', `${year + 1}-01-01`);

    const [{ count: pendingCount }, { count: validatedCount }, { count: rejectedCount }] = await Promise.all([
      countQuery.eq('status', 'pending'),
      countQuery.eq('status', 'validated'),
      countQuery.eq('status', 'rejected'),
    ]);

    return json({
      sales: sales ?? [],
      counts: {
        pending: pendingCount ?? 0,
        validated: validatedCount ?? 0,
        rejected: rejectedCount ?? 0,
      },
    });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

export const PUT: APIRoute = async ({ request }) => {
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

    const { data: sale, error } = await supabase
      .from('sales_records')
      .update(update)
      .eq('id', id)
      .select('*, sales_agent_profiles(full_name, worker_id)')
      .single();

    if (error) throw error;

    // Update the admin notification for this sale
    const statusLabel = action === 'validate' ? '✅ Vente validée' : '❌ Vente rejetée';
    const agentName = (sale.sales_agent_profiles as any)?.full_name || 'Agent';

    fetch(`${import.meta.env.SITE || ''}/api/admin/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: action === 'validate' ? 'sale_validated' : 'sale_rejected',
        message: `${statusLabel} — ${agentName} • ${sale.client_name} • ${new Intl.NumberFormat('fr-FR').format(Number(sale.total_amount))} FCFA`,
        entity_id: id,
        entity_type: 'sale',
      }),
    }).catch(() => {});

    return json({ sale });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    if (!body.id) return json({ error: 'id is required' }, 400);

    const { error } = await supabase.from('sales_records').delete().eq('id', body.id);
    if (error) throw error;
    return json({ success: true });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};
