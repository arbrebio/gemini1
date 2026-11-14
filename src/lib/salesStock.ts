/**
 * Pure helpers for sale validation — kept free of I/O so they can be unit
 * tested (see src/lib/__tests__/salesStock.test.ts).
 */

export interface SaleLike {
  product_id?: string | null;
  quantity?: number | string | null;
}

export interface LineItemLike {
  product_id?: string | null;
  quantity?: number | string | null;
}

/**
 * Work out how much stock to deduct per product when a sale is validated.
 *
 * Multi-product sales store one row per product in `sales_line_items`; the
 * parent `sales_records` row only carries a summary (first product's id and
 * the SUM of all quantities). Deducting from the summary row therefore took
 * the whole basket out of the first product's stock. Line items are the
 * source of truth; the summary row is only used for legacy single-product
 * sales that have no line items.
 *
 * Items without a product_id (free-text products) are skipped. Quantities
 * for the same product are merged.
 */
export function computeStockDeductions(
  sale: SaleLike,
  lineItems: LineItemLike[] | null | undefined
): Map<string, number> {
  const deductions = new Map<string, number>();

  const add = (productId: string | null | undefined, rawQty: number | string | null | undefined) => {
    const qty = Number(rawQty);
    if (!productId || !Number.isFinite(qty) || qty <= 0) return;
    deductions.set(productId, (deductions.get(productId) ?? 0) + qty);
  };

  if (lineItems && lineItems.length > 0) {
    for (const item of lineItems) add(item.product_id, item.quantity);
  } else {
    add(sale.product_id, sale.quantity);
  }

  return deductions;
}

export interface RawSaleItem {
  product_name?: unknown;
  product_id?: unknown;
  quantity?: unknown;
  unit_price?: unknown;
}

export interface NormalizedSaleItem {
  product_name: string;
  product_id: string | null;
  quantity: number;
  unit_price: number;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_ITEMS = 100;

/**
 * Validate and coerce client-supplied sale items. Returns either the
 * normalized items plus the server-computed total, or an error message.
 * Nothing from the client is trusted as a number until it is coerced here —
 * a quantity sent as the string "2" must not be string-concatenated later.
 */
export function normalizeSaleItems(
  raw: unknown
): { ok: true; items: NormalizedSaleItem[]; total: number } | { ok: false; error: string } {
  if (!Array.isArray(raw) || raw.length === 0) return { ok: false, error: 'At least one item is required' };
  if (raw.length > MAX_ITEMS) return { ok: false, error: `A sale cannot have more than ${MAX_ITEMS} items` };

  const items: NormalizedSaleItem[] = [];
  let total = 0;

  for (const entry of raw as RawSaleItem[]) {
    const name = typeof entry?.product_name === 'string' ? entry.product_name.trim() : '';
    if (!name) return { ok: false, error: 'Each item must have product_name' };
    if (name.length > 200) return { ok: false, error: 'product_name is too long' };

    const quantity = Number(entry.quantity);
    const unitPrice = Number(entry.unit_price);
    if (!Number.isFinite(quantity) || quantity <= 0) return { ok: false, error: 'Each item quantity must be > 0' };
    if (!Number.isFinite(unitPrice) || unitPrice < 0) return { ok: false, error: 'Each item unit_price must be >= 0' };

    const productId =
      typeof entry.product_id === 'string' && UUID_RE.test(entry.product_id) ? entry.product_id : null;

    items.push({ product_name: name, product_id: productId, quantity, unit_price: unitPrice });
    total += quantity * unitPrice;
  }

  return { ok: true, items, total: Math.round(total * 100) / 100 };
}

/**
 * Escape a user-supplied search term for use inside a PostgREST
 * `.or('col.ilike.%term%')` filter string. Commas, parentheses, quotes and
 * backslashes are structural in that grammar and previously produced 500s
 * (or let a caller append extra conditions); `%` and `*` are LIKE
 * wildcards. They are all stripped — search is a convenience, not exact match.
 */
export function sanitizeSearchTerm(input: string | null | undefined, maxLength = 80): string {
  if (!input) return '';
  return input
    .replace(/[,()"'\\%*]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}
