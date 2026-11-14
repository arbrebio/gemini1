import { describe, expect, it } from 'vitest';
import { computeStockDeductions, normalizeSaleItems, sanitizeSearchTerm } from '../salesStock';
import { isOwnProofPath } from '../saleProofs';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';

describe('computeStockDeductions', () => {
  it('deducts each product by its own quantity for multi-product sales', () => {
    // Summary row = first product id + SUM of quantities (7). The old code
    // took all 7 from product A and nothing from B.
    const result = computeStockDeductions(
      { product_id: A, quantity: 7 },
      [{ product_id: A, quantity: 2 }, { product_id: B, quantity: 5 }]
    );
    expect(Object.fromEntries(result)).toEqual({ [A]: 2, [B]: 5 });
  });

  it('merges repeated products and skips free-text items', () => {
    const result = computeStockDeductions({}, [
      { product_id: A, quantity: '1.5' },
      { product_id: A, quantity: 2 },
      { product_id: null, quantity: 9 },
    ]);
    expect(Object.fromEntries(result)).toEqual({ [A]: 3.5 });
  });

  it('falls back to the sale row for legacy sales without line items', () => {
    expect(Object.fromEntries(computeStockDeductions({ product_id: A, quantity: 4 }, []))).toEqual({ [A]: 4 });
    expect(Object.fromEntries(computeStockDeductions({ product_id: A, quantity: 4 }, null))).toEqual({ [A]: 4 });
  });

  it('deducts nothing for invalid quantities or missing product', () => {
    expect(computeStockDeductions({ product_id: null, quantity: 4 }, []).size).toBe(0);
    expect(computeStockDeductions({ product_id: A, quantity: 0 }, []).size).toBe(0);
    expect(computeStockDeductions({ product_id: A, quantity: 'abc' }, []).size).toBe(0);
  });
});

describe('normalizeSaleItems', () => {
  it('coerces numeric strings and computes the total server-side', () => {
    const result = normalizeSaleItems([
      { product_name: ' Cocopeat ', product_id: A, quantity: '2', unit_price: '1500' },
      { product_name: 'Drip kit', quantity: 3, unit_price: 100.5 },
    ]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.total).toBe(3301.5);
    expect(result.items[0]).toEqual({ product_name: 'Cocopeat', product_id: A, quantity: 2, unit_price: 1500 });
    expect(result.items[1].product_id).toBeNull();
    // Summing must be numeric, never string concatenation ("0" + "2" + "3").
    expect(result.items.reduce((s, i) => s + i.quantity, 0)).toBe(5);
  });

  it('rejects bad input', () => {
    expect(normalizeSaleItems([]).ok).toBe(false);
    expect(normalizeSaleItems('nope').ok).toBe(false);
    expect(normalizeSaleItems([{ product_name: '', quantity: 1, unit_price: 1 }]).ok).toBe(false);
    expect(normalizeSaleItems([{ product_name: 'x', quantity: 0, unit_price: 1 }]).ok).toBe(false);
    expect(normalizeSaleItems([{ product_name: 'x', quantity: -1, unit_price: 1 }]).ok).toBe(false);
    expect(normalizeSaleItems([{ product_name: 'x', quantity: 1, unit_price: -5 }]).ok).toBe(false);
    expect(normalizeSaleItems([{ product_name: 'x', quantity: 'abc', unit_price: 1 }]).ok).toBe(false);
    expect(normalizeSaleItems([{ product_name: 'x', quantity: Infinity, unit_price: 1 }]).ok).toBe(false);
  });

  it('drops a product_id that is not a UUID', () => {
    const result = normalizeSaleItems([{ product_name: 'x', product_id: 'abc', quantity: 1, unit_price: 1 }]);
    expect(result.ok && result.items[0].product_id).toBeNull();
  });
});

describe('sanitizeSearchTerm', () => {
  it('removes characters that are structural in PostgREST filters', () => {
    expect(sanitizeSearchTerm('a,b')).toBe('a b');
    expect(sanitizeSearchTerm('x),id.neq.(1')).toBe('x id.neq. 1');
    expect(sanitizeSearchTerm('50%*')).toBe('50');
    expect(sanitizeSearchTerm(null)).toBe('');
  });

  it('keeps ordinary search text intact', () => {
    expect(sanitizeSearchTerm('  Koné Aïcha ')).toBe('Koné Aïcha');
    expect(sanitizeSearchTerm('ORD-2026-001')).toBe('ORD-2026-001');
    expect(sanitizeSearchTerm('SKU_12')).toBe('SKU_12');
  });
});

describe('isOwnProofPath', () => {
  it("accepts only files inside the agent's own folder", () => {
    expect(isOwnProofPath(`proofs/${A}/1700000000-abc123.jpg`, A)).toBe(true);
    expect(isOwnProofPath(`proofs/${B}/1700000000-abc123.jpg`, A)).toBe(false);
    expect(isOwnProofPath(`proofs/${A}/../${B}/x.jpg`, A)).toBe(false);
    expect(isOwnProofPath(`proofs/${A}/sub/x.jpg`, A)).toBe(false);
    expect(isOwnProofPath(`https://example.test/proofs/${A}/x.jpg`, A)).toBe(false);
    expect(isOwnProofPath(undefined, A)).toBe(false);
  });
});
