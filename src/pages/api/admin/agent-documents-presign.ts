export const prerender = false;

/**
 * POST /api/admin/agent-documents-presign
 *
 * Step 1 of the 3-step direct-upload flow.
 * Generates a Supabase Storage signed upload URL so the browser
 * can PUT the file directly to Supabase — bypassing Vercel's 4.5 MB
 * serverless body-size limit entirely.
 *
 * Body (JSON):
 *   { agent_id, title, category, file_name, file_type, file_size }
 *
 * Returns:
 *   { signed_url, file_path }
 */

import type { APIRoute } from 'astro';
import { requireAdminAuth } from '../../../lib/adminAuth';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
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

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

const VALID_CATEGORIES = ['learning', 'catalog', 'pricing'];

export const POST: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const { agent_id, title, category, file_name, file_type, file_size } = body ?? {};

    // Validate
    if (!agent_id)                                 return json({ error: 'agent_id is required' }, 400);
    if (!title?.trim())                            return json({ error: 'title is required' }, 400);
    if (!category || !VALID_CATEGORIES.includes(category))
                                                   return json({ error: 'category must be learning, catalog, or pricing' }, 400);
    if (!file_name)                                return json({ error: 'file_name is required' }, 400);
    if (!file_type || !ALLOWED_TYPES.includes(file_type))
                                                   return json({ error: 'File type not allowed. Use PDF, images, Word, Excel, or PowerPoint.' }, 400);
    if (!file_size || file_size > 50 * 1024 * 1024)
                                                   return json({ error: 'File too large (max 50 MB)' }, 400);

    const supabase = getSupabase();

    // Verify agent exists
    const { data: agent, error: agentErr } = await supabase
      .from('sales_agent_profiles')
      .select('id')
      .eq('id', agent_id)
      .single();
    if (agentErr || !agent) return json({ error: 'Agent not found' }, 404);

    // Build a unique storage path
    const ext = (file_name.split('.').pop() || 'bin').toLowerCase();
    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const filePath = `${agent_id}/${category}/${stamp}.${ext}`;

    // Create signed upload URL (valid for 60 minutes)
    const { data, error: signErr } = await supabase.storage
      .from('agent-documents')
      .createSignedUploadUrl(filePath);

    if (signErr || !data?.signedUrl) {
      throw new Error(signErr?.message ?? 'Failed to generate upload URL');
    }

    return json({ signed_url: data.signedUrl, file_path: filePath });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};
