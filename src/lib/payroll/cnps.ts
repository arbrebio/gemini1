// Cotisations CNPS + CMU — Côte d'Ivoire.

import type { PayrollRules } from './types';

export interface RetraiteResult {
  base: number;
  employee: number;
  employer: number;
}

/** Régime de retraite: 6,3 % salarié / 7,7 % employeur, plafond 3 375 000 CFA/mois. */
export function computeRetraite(brut: number, rules: PayrollRules): RetraiteResult {
  const base = Math.min(brut, rules.cnps_retraite.ceiling);
  return {
    base,
    employee: Math.round(base * rules.cnps_retraite.employee_rate),
    employer: Math.round(base * rules.cnps_retraite.employer_rate),
  };
}

/** Prestations familiales (+ maternité): 5,75 % employeur, base plafonnée au SMIG (75 000). */
export function computePrestationsFamiliales(brut: number, rules: PayrollRules): { base: number; employer: number } {
  const base = Math.min(brut, rules.prestations_familiales.ceiling);
  return { base, employer: Math.round(base * rules.prestations_familiales.rate) };
}

/** Accident du travail: 2 à 5 % employeur (2 % configuré), base plafonnée au SMIG (75 000). */
export function computeAccidentTravail(brut: number, rules: PayrollRules): { base: number; employer: number } {
  const base = Math.min(brut, rules.accident_travail.ceiling);
  return { base, employer: Math.round(base * rules.accident_travail.rate) };
}

export interface CmuResult {
  /** Employee's own coverage: 1 000 CFA split 50/50. */
  worker: { base: number; employee: number; employer: number };
  /** Dependents: 1 000 CFA each, 100 % employer. */
  dependents: { count: number; base: number; employer: number };
}

/** CMU: 1 000 CFA / personne couverte / mois. */
export function computeCMU(dependentsCount: number, rules: PayrollRules): CmuResult {
  const unit = rules.cmu_unit;
  const half = Math.round(unit / 2);
  return {
    worker: { base: unit, employee: half, employer: unit - half },
    dependents: { count: dependentsCount, base: unit, employer: dependentsCount * unit },
  };
}
