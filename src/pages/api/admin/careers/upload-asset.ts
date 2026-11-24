export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { requireHrAccess } from '../../../../lib/staff';

function getSupabase() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function json(body: any, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

type AssetType = 'photo' | 'contract';

// Must stay within the bucket settings: career-documents is 10 MB and
// PDF / Word / JPG / PNG only (migration 20260404000000).
const RULES: Record<AssetType, { bucket: string; prefix: string; maxBytes: number; types: Record<string, string> }> = {
  photo: {
    bucket: 'employee-photos',
    prefix: 'employees',
    maxBytes: 10 * 1024 * 1024,
    types: { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' },
  },
  contract: {
    bucket: 'career-documents',
    prefix: 'contracts',
    maxBytes: 10 * 1024 * 1024,
    types: {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
    },
  },
};

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isAssetType(t: unknown): t is AssetType {
  return t === 'photo' || t === 'contract';
}

function extOf(name: string): string {
  return (name.split('.').pop() || '').toLowerCase();
}

function newPath(type: AssetType, employeeId: string | null, ext: string): string {
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${RULES[type].prefix}/${employeeId || 'new'}/${stamp}.${ext}`;
}

/** Path must be one this endpoint could have issued for this type. */
function isValidPath(type: AssetType, path: unknown): path is string {
  if (typeof path !== 'string') return false;
  const re = new RegExp(`^${RULES[type].prefix}/(new|[0-9a-f-]{36})/\\d+-[a-z0-9]+\\.([a-z0-9]+)$`);
  const m = path.match(re);
  return !!m && m[2] in RULES[type].types;
}

/**
 * Builds the URL to store, confirming the object exists. Contracts are
 * private (10-year signed URL); photos are public.
 */
async function finalize(supabase: ReturnType<typeof getSupabase>, type: AssetType, path: string, employeeId: string | null) {
  const { bucket } = RULES[type];
  const { data: signed, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, type === 'contract' ? TEN_YEARS : 60);
  if (error || !signed?.signedUrl) return null;

  const supabaseUrl = String(import.meta.env.PUBLIC_SUPABASE_URL).replace(/\/$/, '');
  const url = type === 'contract' ? signed.signedUrl : `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;

  if (employeeId) {
    const column = type === 'contract' ? 'contract_url' : 'photo_url';
    const { error: updErr } = await supabase.from('career_employees').update({ [column]: url }).eq('id', employeeId);
    if (updErr) throw updErr;
  }
  return url;
}

/**
 * POST /api/admin/careers/upload-asset
 *
 * Preferred (JSON, any size up to 10 MB — the browser uploads straight to
 * storage, so the hosting platform's 4.5 MB body limit does not apply):
 *   1. { action: 'presign',  type, file_name, file_size, employee_id? }
 *        → { signed_url, path, content_type }
 *   2. browser PUTs the file to signed_url
 *   3. { action: 'finalize', type, path, employee_id? } → { url }
 *
 * Legacy (multipart FormData: file, type, employee_id?) — limited to ~4 MB.
 *
 * photo → public URL (employee-photos); contract → 10-year signed URL (career-documents).
 */
export const POST: APIRoute = async ({ request }) => {
  const auth = await requireHrAccess(request, ['employees', 'recruitment']);
  if (!auth.ok) return auth.response;
  try {
    const supabase = getSupabase();
    const isJson = (request.headers.get('content-type') || '').includes('application/json');

    if (isJson) {
      const body = await request.json().catch(() => null);
      const type = body?.type;
      const employeeId = body?.employee_id ? String(body.employee_id) : null;
      if (!isAssetType(type)) return json({ error: 'type must be "photo" or "contract"' }, 400);
      if (employeeId && !ID_RE.test(employeeId)) return json({ error: 'Invalid employee_id' }, 400);
      const rules = RULES[type];

      if (body.action === 'presign') {
        const ext = extOf(String(body.file_name || ''));
        const contentType = rules.types[ext];
        const size = Number(body.file_size);
        if (!contentType) {
          return json({ error: `File type not allowed. Use ${Object.keys(rules.types).map((e) => e.toUpperCase()).join(', ')}.` }, 400);
        }
        if (!size || size <= 0) return json({ error: 'Empty file' }, 400);
        if (size > rules.maxBytes) return json({ error: `File too large (max ${rules.maxBytes / 1024 / 1024} MB)` }, 400);

        const path = newPath(type, employeeId, ext);
        const { data, error } = await supabase.storage.from(rules.bucket).createSignedUploadUrl(path);
        if (error || !data?.signedUrl) throw new Error(error?.message ?? 'Failed to create upload URL');
        return json({ signed_url: data.signedUrl, path, content_type: contentType }, 200);
      }

      if (body.action === 'finalize') {
        if (!isValidPath(type, body.path)) return json({ error: 'Invalid path' }, 400);
        const url = await finalize(supabase, type, body.path, employeeId);
        if (!url) return json({ error: 'Uploaded file not found — please try again.' }, 400);
        return json({ url }, 200);
      }

      return json({ error: 'action must be "presign" or "finalize"' }, 400);
    }

    // ── Legacy multipart upload (small files only) ──────────────────
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type');
    const employeeId = (formData.get('employee_id') as string) || null;

    if (!file || file.size === 0) return json({ error: 'No file provided' }, 400);
    if (!isAssetType(type)) return json({ error: 'type must be "photo" or "contract"' }, 400);
    if (employeeId && !ID_RE.test(employeeId)) return json({ error: 'Invalid employee_id' }, 400);
    const rules = RULES[type];
    const ext = extOf(file.name);
    const contentType = rules.types[ext];
    if (!contentType) return json({ error: 'File type not allowed' }, 400);
    if (file.size > rules.maxBytes) return json({ error: `File too large (max ${rules.maxBytes / 1024 / 1024} MB)` }, 400);

    const path = newPath(type, employeeId, ext);
    const { error: uploadErr } = await supabase.storage
      .from(rules.bucket)
      .upload(path, Buffer.from(await file.arrayBuffer()), { contentType, upsert: true });
    if (uploadErr) throw uploadErr;

    const url = await finalize(supabase, type, path, employeeId);
    if (!url) throw new Error('Failed to generate URL for uploaded file');
    return json({ url }, 200);
  } catch (e: any) {
    console.error('[careers upload-asset]', e);
    return json({ error: 'Internal server error' }, 500);
  }
};
