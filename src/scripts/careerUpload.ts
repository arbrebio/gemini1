import { authFetch } from '../lib/supabase';
import { shrinkImage } from './shrinkImage';
import { readJsonSafe, putToSignedUrl } from './uploadHelpers';

const ENDPOINT = '/api/admin/careers/upload-asset/';

/**
 * Uploads an employee photo or contract straight to Supabase Storage
 * (prepare → PUT → finalize), so files over the hosting platform's 4.5 MB
 * request limit work. With `employeeId`, the employee record is updated too.
 * Never throws: resolves to `{ url }` or `{ error }`.
 */
export async function uploadCareerAsset(
  file: File,
  type: 'photo' | 'contract',
  employeeId?: string | null,
): Promise<{ url?: string; error?: string }> {
  try {
    if (type === 'photo') file = await shrinkImage(file);
    if (file.size > 10 * 1024 * 1024) return { error: 'File too large (max 10 MB)' };
    const employee_id = employeeId || undefined;

    const presignRes = await authFetch(ENDPOINT, {
      method: 'POST',
      body: JSON.stringify({ action: 'presign', type, file_name: file.name, file_size: file.size, employee_id }),
    });
    const presign = await readJsonSafe(presignRes);
    if (!presignRes.ok || !presign.signed_url) return { error: presign.error || 'Could not prepare the upload' };

    const put = await putToSignedUrl(presign.signed_url, file, presign.content_type);
    if (put.error) return put;

    const finRes = await authFetch(ENDPOINT, {
      method: 'POST',
      body: JSON.stringify({ action: 'finalize', type, path: presign.path, employee_id }),
    });
    const fin = await readJsonSafe(finRes);
    if (!finRes.ok || !fin.url) return { error: fin.error || 'Upload could not be confirmed' };
    return { url: fin.url };
  } catch {
    return { error: 'Network error — check your internet connection and try again.' };
  }
}
