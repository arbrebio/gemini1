export const prerender = false;

/**
 * /api/sales-agent/documents
 *
 * Returns the authenticated agent's documents with short-lived signed URLs.
 *
 * GET  ?category=learning|catalog|pricing   (optional filter)
 *
 * Headers:
 *   Authorization: Bearer <agent_access_token>
 *
 * Returns:
 *   { documents: [{ id, title, category, file_name, file_type, file_size, created_at, signed_url }] }
 *
 * signed_url expires in 3600 seconds (1 hour).
 * The route is server-side only — the agent never gets a permanent URL.
 */

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function json(body: unknown, status = 200) {
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

export const GET: APIRoute = async ({ request }) => {
  try {
    const token = extractToken(request);
    if (!token) return json({ error: 'Missing token' }, 401);

    const supabase = getSupabaseAdmin();

    // Verify agent JWT
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return json({ error: 'Invalid or expired token' }, 401);

    // Verify agent profile exists and is active
    const { data: profile, error: profileErr } = await supabase
      .from('sales_agent_profiles')
      .select('id, is_active')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile) return json({ error: 'Agent not found' }, 404);
    if (!profile.is_active) return json({ error: 'Account suspended' }, 403);

    // Optional category filter
    const url = new URL(request.url);
    const categoryFilter = url.searchParams.get('category');

    let query = supabase
      .from('agent_documents')
      .select('id, title, category, file_name, file_path, file_type, file_size, created_at')
      .eq('agent_id', user.id)
      .order('category')
      .order('created_at', { ascending: false });

    if (categoryFilter && ['learning', 'catalog', 'pricing'].includes(categoryFilter)) {
      query = query.eq('category', categoryFilter);
    }

    const { data: docs, error: docsErr } = await query;
    if (docsErr) throw docsErr;

    // Generate signed URLs for each document (1 hour expiry)
    const docsWithUrls = await Promise.all(
      (docs || []).map(async (doc) => {
        const { data: signed, error: signErr } = await supabase.storage
          .from('agent-documents')
          .createSignedUrl(doc.file_path, 3600);

        return {
          id: doc.id,
          title: doc.title,
          category: doc.category,
          file_name: doc.file_name,
          file_type: doc.file_type,
          file_size: doc.file_size,
          created_at: doc.created_at,
          signed_url: signErr ? null : (signed?.signedUrl ?? null),
        };
      })
    );

    return json({ documents: docsWithUrls });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};
