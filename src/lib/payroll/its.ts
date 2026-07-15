// ITS unique (Impôt sur les Traitements et Salaires) — réforme 2024, Côte d'Ivoire.
// Ordonnances 2023-718/719: barème progressif + RICF (réduction pour charges de famille).

import type { ItsBracket, PayrollRules } from './types';

/** Progressive ITS before family reduction. Rounded to whole CFA at the end. */
export function computeGrossITS(brutImposable: number, brackets: ItsBracket[]): number {
  let tax = 0;
  let lower = 0;
  for (const bracket of brackets) {
    const upper = bracket.upTo ?? Infinity;
    if (brutImposable <= lower) break;
    const taxedInBracket = Math.min(brutImposable, upper) - lower;
    tax += taxedInBracket * bracket.rate;
    lower = upper;
  }
  return Math.round(tax);
}

/** RICF: 5 500 CFA per half-share above 1 part, capped (44 000 at 5 parts). */
export function computeRICF(partsIgr: number, rules: Pick<PayrollRules, 'ricf_per_half_share' | 'ricf_cap'>): number {
  const parts = Math.min(Math.max(partsIgr, 1), 5);
  const halfShares = Math.round((parts - 1) * 2);
  return Math.min(rules.ricf_cap, halfShares * rules.ricf_per_half_share);
}

/** Net ITS due by the employee for the month. */
export function computeITS(
  brutImposable: number,
  partsIgr: number,
  rules: PayrollRules
): { gross: number; ricf: number; net: number } {
  const gross = computeGrossITS(brutImposable, rules.its_brackets);
  const ricf = computeRICF(partsIgr, rules);
  return { gross, ricf, net: Math.max(0, gross - ricf) };
}
