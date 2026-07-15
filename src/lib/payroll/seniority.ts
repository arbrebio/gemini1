// Ancienneté — computed from the seniority date to the end of the pay period.

export interface Seniority {
  years: number;
  months: number;
  label: string; // "2 an(s) et 0 mois"
}

export function computeAnciennete(seniorityDate: Date, periodEnd: Date): Seniority {
  let years = periodEnd.getFullYear() - seniorityDate.getFullYear();
  let months = periodEnd.getMonth() - seniorityDate.getMonth();
  // A month only counts once its anniversary day is reached
  // (SAGE: 01/06/23 → période 30/06/25 = "2 an(s) et 0 mois").
  if (periodEnd.getDate() < seniorityDate.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) return { years: 0, months: 0, label: '0 an(s) et 0 mois' };
  return { years, months, label: `${years} an(s) et ${months} mois` };
}

/**
 * Prime d'ancienneté (optional — not present on the SAGE reference slip).
 * Convention CI: 2 % of base salary after 2 full years, +1 % per additional year, capped at 25 %.
 * Returns 0 unless explicitly enabled by the caller.
 */
export function computePrimeAnciennete(baseSalary: number, fullYears: number): number {
  if (fullYears < 2) return 0;
  const rate = Math.min(0.02 + (fullYears - 2) * 0.01, 0.25);
  return Math.round(baseSalary * rate);
}
