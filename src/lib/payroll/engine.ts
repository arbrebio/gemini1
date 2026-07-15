// Moteur de paie — assembles the full bulletin de paie line set (SAGE-equivalent).
// Pure function: no I/O, integer CFA, Math.round per line.

import type { ComputedSlip, PayslipLine, PayrollRules, ProfileInput } from './types';
import { computeITS } from './its';
import { computeAccidentTravail, computeCMU, computePrestationsFamiliales, computeRetraite } from './cnps';

const PCT = (rate: number) => Math.round(rate * 10000) / 100; // 0.063 → 6.3

export interface PayslipComputationInput {
  profile: ProfileInput;
  rules: PayrollRules;
  /** Days paid over the 30-day SAGE convention (default 30 = full month). */
  daysWorked?: number;
}

export function computePayslip(input: PayslipComputationInput): ComputedSlip {
  const { profile, rules } = input;
  const daysWorked = input.daysWorked ?? 30;
  const prorata = daysWorked / 30;

  const lines: PayslipLine[] = [];

  // 1. Gains imposables → Total Brut
  const baseSalary = Math.round(profile.baseSalary * prorata);
  const sursalaire = Math.round(profile.sursalaire * prorata);
  if (baseSalary > 0 || profile.baseSalary > 0) {
    lines.push({ code: '100', label: 'Salaire de base', nombre: daysWorked, base: baseSalary, salarial: { gain: baseSalary }, kind: 'gain' });
  }
  if (sursalaire > 0) {
    lines.push({ code: '190', label: 'Sursalaire', nombre: daysWorked, base: sursalaire, salarial: { gain: sursalaire }, kind: 'gain' });
  }
  const taxableExtras = (profile.extraLines || []).filter((l) => l.taxable);
  for (const extra of taxableExtras) {
    const amount = Math.round(extra.amount);
    lines.push({ code: extra.code, label: extra.label, base: amount, salarial: { gain: amount }, kind: 'gain' });
  }
  const brut = lines.reduce((sum, l) => sum + (l.salarial?.gain || 0), 0);
  const brutImposable = brut;

  // 2. ITS (Impôt unique sur salaire) — barème progressif − RICF
  const its = computeITS(brutImposable, profile.partsIgr, rules);
  lines.push({
    code: '5250', label: 'Impot unique sur salaire (IUS)', base: brutImposable,
    salarial: { retenue: its.net, affectsNet: true },
    patronal: { taux: 0, retenue: 0 },
    kind: 'cotisation',
  });

  // 3. Taxes patronales sur salaires (FDFP + ITS patronal)
  const taxeApprentissage = Math.round(brut * rules.taxe_apprentissage_rate);
  const fpc = Math.round(brut * rules.fpc_rate);
  const fpcRegul = Math.round(brut * rules.fpc_regularisation_rate);
  const itsPatronal = Math.round(brut * rules.its_patronal_rate);
  lines.push({ code: '15900', label: "Taxe d'Apprentissage", base: brut, patronal: { taux: PCT(rules.taxe_apprentissage_rate), retenue: taxeApprentissage }, kind: 'cotisation' });
  lines.push({ code: '16000', label: 'Taxe Format Prof. Continue', base: brut, patronal: { taux: PCT(rules.fpc_rate), retenue: fpc }, kind: 'cotisation' });
  lines.push({ code: '16010', label: 'FPC à régulariser 31.12', base: brut, patronal: { taux: PCT(rules.fpc_regularisation_rate), retenue: fpcRegul }, kind: 'cotisation' });

  // 4. CNPS
  const pf = computePrestationsFamiliales(brut, rules);
  const at = computeAccidentTravail(brut, rules);
  const retraite = computeRetraite(brut, rules);
  lines.push({ code: '15300', label: 'Prestations Familiales', base: pf.base, patronal: { taux: PCT(rules.prestations_familiales.rate), retenue: pf.employer }, kind: 'cotisation' });
  lines.push({ code: '15400', label: 'Accident du Travail', base: at.base, patronal: { taux: PCT(rules.accident_travail.rate), retenue: at.employer }, kind: 'cotisation' });
  lines.push({
    code: '15200', label: 'Régime de Retraite', base: retraite.base,
    salarial: { taux: PCT(rules.cnps_retraite.employee_rate), retenue: retraite.employee, affectsNet: true },
    patronal: { taux: PCT(rules.cnps_retraite.employer_rate), retenue: retraite.employer },
    kind: 'cotisation',
  });

  // 5. CMU — shown on the slip; employee share NOT counted in the net (SAGE behavior)
  const cmu = computeCMU(profile.cmuDependents, rules);
  lines.push({
    code: '15250', label: 'Cotisation CMU 50 %', nombre: 1, base: cmu.worker.base,
    salarial: { taux: 50, retenue: cmu.worker.employee, affectsNet: false },
    patronal: { taux: 50, retenue: cmu.worker.employer },
    kind: 'cotisation',
  });
  if (cmu.dependents.count > 0) {
    lines.push({
      code: '15260', label: 'Cotisation CMU 100 %', nombre: cmu.dependents.count, base: cmu.dependents.base,
      salarial: { taux: 0, retenue: 0, affectsNet: false },
      patronal: { taux: 100, retenue: cmu.dependents.employer },
      kind: 'cotisation',
    });
  }

  // 6. ITS Patronal (after CNPS block on the SAGE slip)
  lines.push({ code: '15660', label: 'ITS Patronal', base: brut, patronal: { taux: PCT(rules.its_patronal_rate), retenue: itsPatronal }, kind: 'cotisation' });

  // Totals
  const cotisationsSalariales = lines.reduce(
    (sum, l) => sum + (l.salarial?.affectsNet !== false ? l.salarial?.retenue || 0 : 0), 0);
  const cotisationsPatronales = lines.reduce((sum, l) => sum + (l.patronal?.retenue || 0), 0);

  // 7. Gains non imposables (après cotisations)
  const transport = Math.round(profile.transportAllowance * prorata);
  if (transport > 0) {
    lines.push({ code: '10200', label: 'Indemnité de Transport', base: transport, salarial: { gain: transport }, kind: 'gain_non_imposable' });
  }
  const nonTaxableExtras = (profile.extraLines || []).filter((l) => !l.taxable);
  for (const extra of nonTaxableExtras) {
    const amount = Math.round(extra.amount);
    lines.push({ code: extra.code, label: extra.label, base: amount, salarial: { gain: amount }, kind: 'gain_non_imposable' });
  }
  const gainsNonImposables = lines
    .filter((l) => l.kind === 'gain_non_imposable')
    .reduce((sum, l) => sum + (l.salarial?.gain || 0), 0);

  // 8. Net à payer
  const netAPayer = brut - cotisationsSalariales + gainsNonImposables;

  return {
    lines,
    its,
    totals: {
      brut,
      brutImposable,
      totalGains: brut + gainsNonImposables,
      gainsNonImposables,
      cotisationsSalariales,
      cotisationsPatronales,
      avantagesNature: 0,
      heuresTravaillees: Math.round(rules.monthly_hours * prorata * 100) / 100,
      heuresSupplementaires: 0,
      netAPayer,
    },
  };
}
