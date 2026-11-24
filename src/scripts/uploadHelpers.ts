/**
 * Shared browser helpers for file uploads.
 *
 * The hosting platform (Vercel) rejects any request body over ~4.5 MB with a
 * plain-text `413 FUNCTION_PAYLOAD_TOO_LARGE` before our code runs. Calling
 * `res.json()` on that reply throws, which used to surface as a misleading
 * "Network error". Documents that can be large therefore go straight to
 * Supabase Storage through a signed upload URL (see `putToSignedUrl`), and
 * every response is read with `readJsonSafe`, which never throws.
 */

/** Largest body the hosting platform accepts for a server-side upload. */
export const SERVER_UPLOAD_LIMIT = 4 * 1024 * 1024;

export function formatMB(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Parses a response as JSON. Non-JSON replies (413 from the platform, 502/504
 * gateway pages, …) become `{ error }` with a readable message instead of
 * throwing.
 */
export async function readJsonSafe(res: Response): Promise<any> {
  const text = await res.text().catch(() => '');
  if (text) {
    try { return JSON.parse(text); } catch { /* not JSON — fall through */ }
  }
  if (res.status === 413) return { error: 'File too large for the server (max 4 MB). Please compress it and try again.' };
  if (res.status === 401 || res.status === 403) return { error: 'Your session has expired. Please sign in again.' };
  if (res.status === 504) return { error: 'The server took too long to respond. Please try again.' };
  if (!res.ok) return { error: `Server error (${res.status}). Please try again.` };
  return {};
}

/**
 * Uploads `file` directly to Supabase Storage with a signed upload URL,
 * bypassing the platform body-size limit. Returns `{}` on success or
 * `{ error }` with Supabase's reason (size limit, file type, …).
 */
export async function putToSignedUrl(signedUrl: string, file: Blob, contentType: string): Promise<{ error?: string }> {
  let res: Response;
  try {
    res = await fetch(signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType, 'x-upsert': 'true' },
      body: file,
    });
  } catch {
    return { error: 'Network error — check your internet connection and try again.' };
  }
  if (res.ok) return {};
  const data = await readJsonSafe(res);
  const reason = String(data.message || data.error || '');
  if (res.status === 413 || /exceeded|too large|size/i.test(reason)) {
    return { error: 'File is larger than storage allows (max 10 MB).' };
  }
  if (/mime|type/i.test(reason)) return { error: 'This file type is not allowed.' };
  return { error: reason ? `Storage error: ${reason}` : `Storage error (${res.status}).` };
}
