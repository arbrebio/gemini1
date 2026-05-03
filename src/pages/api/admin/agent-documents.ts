export const prerender = false;

/**
 * /api/admin/agent-documents
 *
 * Admin-only API for managing documents uploaded for sales agents.
 *
 * GET    ?agent_id=<uuid>              — list documents for an agent
 * POST   FormData {file, agent_id, title, category}  — upload a new document
 * DELETE {id}                          — delete a document record + storage file
 *
 * All routes require admin auth (Authorization: Bearer <admin_token>).
 * All Supabase calls use the service role key (bypasses RLS).
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
  'image/jpeg', 'image/png', 'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

const VALID_CATEGORIES = ['learning', 'catalog', 'pricing'];

// ALLOWED_TYPES also checked in agent-documents-presign.ts (before upload)
// — kept here as a second defence for the metadata-save POST.

// ── GET — list documents for agent ──────────────────────────────────────────
export const GET: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const url = new URL(request.url);
    const agentId = url.searchParams.get('agent_id');
    if (!agentId) return json({ error: 'agent_id is required' }, 400);

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('agent_documents')
      .select('id, agent_id, title, category, file_name, file_type, file_size, created_at')
      .eq('agent_id', agentId)
      .order('category')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return json({ documents: data || [] });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

// ── POST — save document metadata after direct browser→Supabase upload ────────
//
// Called AFTER the browser has already PUT the file directly to Supabase Storage
// via the signed URL from /api/admin/agent-documents-presign.
// Body (JSON): { agent_id, title, category, file_name, file_path, file_type, file_size }
//
export const POST: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const {
      agent_id, title, category,
      file_name, file_path, file_type, file_size,
    } = body ?? {};

    if (!agent_id)   return json({ error: 'agent_id is required' }, 400);
    if (!title)      return json({ error: 'title is required' }, 400);
    if (!category || !VALID_CATEGORIES.includes(category))
                     return json({ error: 'category must be learning, catalog, or pricing' }, 400);
    if (!file_name)  return json({ error: 'file_name is required' }, 400);
    if (!file_path)  return json({ error: 'file_path is required' }, 400);
    if (!file_type || !ALLOWED_TYPES.includes(file_type))
                     return json({ error: 'Invalid file type' }, 400);

    const supabase = getSupabase();

    const { data: doc, error: dbErr } = await supabase
      .from('agent_documents')
      .insert({
        agent_id,
        title: title.trim(),
        category,
        file_name,
        file_path,
        file_type,
        file_size: Number(file_size) || 0,
        uploaded_by: auth.userId ?? null,
      })
      .select()
      .single();

    if (dbErr) throw dbErr;
    return json({ document: doc }, 201);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

// ── DELETE — remove document ─────────────────────────────────────────────────
export const DELETE: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await request.json();
    if (!id) return json({ error: 'Document id is required' }, 400);

    const supabase = getSupabase();

    // Get file path first
    const { data: doc, error: fetchErr } = await supabase
      .from('agent_documents')
      .select('file_path')
      .eq('id', id)
      .single();

    if (fetchErr || !doc) return json({ error: 'Document not found' }, 404);

    // Delete from storage
    await supabase.storage.from('agent-documents').remove([doc.file_path]);

    // Delete DB record
    const { error: delErr } = await supabase
      .from('agent_documents')
      .delete()
      .eq('id', id);

    if (delErr) throw delErr;
    return json({ success: true });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};
