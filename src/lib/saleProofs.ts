/**
 * Proof-of-payment files live in the private `sale-proofs` bucket under
 * `proofs/<agent uid>/<file>`.
 *
 * New sales store only the storage PATH in `sales_records.proof_url`; a
 * short-lived signed URL is minted each time a sale is read. Older rows hold
 * a multi-year signed URL (starts with "http") and are passed through as-is.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export const PROOF_BUCKET = 'sale-proofs';
export const PROOF_URL_TTL_SECONDS = 60 * 60; // 1 hour

/** Hosting platform caps request bodies at ~4.5 MB, so 4 MB is the real limit. */
export const MAX_PROOF_BYTES = 4 * 1024 * 1024;

/** True when `path` is a proof file inside the given agent's own folder. */
export function isOwnProofPath(path: unknown, agentId: string): path is string {
  if (typeof path !== 'string' || path.length > 300) return false;
  const prefix = `proofs/${agentId}/`;
  if (!path.startsWith(prefix)) return false;
  const fileName = path.slice(prefix.length);
  return /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(fileName) && !fileName.includes('..');
}

/**
 * Replace stored proof paths with fresh short-lived signed URLs, in place.
 * Rows whose proof_url is already a full URL (legacy) are left untouched.
 */
export async function attachSignedProofUrls<T extends { proof_url?: string | null }>(
  supabase: SupabaseClient<any, any, any>,
  sales: T[]
): Promise<T[]> {
  const paths = [...new Set(
    sales
      .map(s => s.proof_url)
      .filter((p): p is string => !!p && !/^https?:\/\//i.test(p))
  )];
  if (paths.length === 0) return sales;

  const { data, error } = await supabase.storage
    .from(PROOF_BUCKET)
    .createSignedUrls(paths, PROOF_URL_TTL_SECONDS);
  if (error) {
    console.error('[saleProofs] could not sign proof URLs:', error);
    return sales;
  }

  const byPath = new Map<string, string>();
  for (const entry of data ?? []) {
    if (entry.path && entry.signedUrl) byPath.set(entry.path, entry.signedUrl);
  }
  for (const sale of sales) {
    if (sale.proof_url && byPath.has(sale.proof_url)) {
      sale.proof_url = byPath.get(sale.proof_url)!;
    }
  }
  return sales;
}
