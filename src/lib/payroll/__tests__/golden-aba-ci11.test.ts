// Golden test: reproduces the SAGE Paie reference slip ABA-CI11 (juin 2025).
// Every asserted figure comes from the real SAGE bulletin, except:
//  - retraite salariale uses the standard 6,30 % × brut formula (94 627, user decision)
//  - totals/net follow from that same decision (396 110 / 1 305 901)
//  - the SAGE PDF is internally inconsistent: it prints gains 877 954 + 631 057 = 1 509 011
//    but computes every tax from Total Brut = 1 502 011. The engine derives brut from the
//    gain lines (the only consistent behavior), so the fixture uses sursalaire 624 057 to
//    reproduce the authoritative brut of 1 502 011 that all SAGE tax lines used.

import { describe, expect, it } from 'vitest';
import { computeAnciennete, computeCumuls, computeGrossITS, computeITS, computePayslip, computeRICF, formatCFA, type PayrollRules } from '../index';

const RULES: PayrollRules = {
  its_brackets: [
    { upTo: 75000, rate: 0 },
    { upTo: 240000, rate: 0.16 },
    { upTo: 800000, rate: 0.21 },
    { upTo: 2400000, rate: 0.24 },
    { upTo: 8000000, rate: 0.28 },
    { upTo: null, rate: 0.32 },
  ],
  ricf_per_half_share: 5500,
  ricf_cap: 44000,
  cnps_retraite: { employee_rate: 0.063, employer_rate: 0.077, ceiling: 3375000 },
  prestations_familiales: { rate: 0.0575, ceiling: 75000 },
  accident_travail: { rate: 0.02, ceiling: 75000 },
  taxe_apprentissage_rate: 0.004,
  fpc_rate: 0.006,
  fpc_regularisation_rate: 0.006,
  its_patronal_rate: 0.012,
  cmu_unit: 1000,
  monthly_hours: 173.33,
};

const ABA_CI11 = {
  baseSalary: 877954,
  sursalaire: 624057,
  transportAllowance: 200000,
  partsIgr: 2.0,
  cmuDependents: 1,
};

describe('Golden — SAGE bulletin ABA-CI11 (06/2025)', () => {
  const slip = computePayslip({ profile: ABA_CI11, rules: RULES });
  const line = (code: string) => slip.lines.find((l) => l.code === code)!;

  it('Total Brut = 1 502 011', () => {
    expect(slip.totals.brut).toBe(1502011);
    expect(slip.totals.brutImposable).toBe(1502011);
  });

  it('ITS: barème progressif 312 483 − RICF 11 000 = 301 483', () => {
    expect(slip.its.gross).toBe(312483);
    expect(slip.its.ricf).toBe(11000);
    expect(slip.its.net).toBe(301483);
    expect(line('5250').salarial?.retenue).toBe(301483);
  });

  it("Taxe d'Apprentissage 0,40 % = 6 008", () => {
    expect(line('15900').patronal?.retenue).toBe(6008);
  });

  it('FPC 0,60 % = 9 012 (x2 avec régularisation)', () => {
    expect(line('16000').patronal?.retenue).toBe(9012);
    expect(line('16010').patronal?.retenue).toBe(9012);
  });

  it('Prestations Familiales 5,75 % de 75 000 = 4 313', () => {
    expect(line('15300').base).toBe(75000);
    expect(line('15300').patronal?.retenue).toBe(4313);
  });

  it('Accident du Travail 2,00 % de 75 000 = 1 500', () => {
    expect(line('15400').base).toBe(75000);
    expect(line('15400').patronal?.retenue).toBe(1500);
  });

  it('Retraite 6,30 % / 7,70 % du brut = 94 627 / 115 655', () => {
    expect(line('15200').base).toBe(1502011);
    expect(line('15200').salarial?.retenue).toBe(94627); // standard formula (SAGE printed 95 067)
    expect(line('15200').patronal?.retenue).toBe(115655);
  });

  it('CMU: salarié 500 + patronal 500, ayant droit 1 000 patronal', () => {
    expect(line('15250').salarial?.retenue).toBe(500);
    expect(line('15250').patronal?.retenue).toBe(500);
    expect(line('15250').salarial?.affectsNet).toBe(false);
    expect(line('15260').patronal?.retenue).toBe(1000);
  });

  it('ITS Patronal 1,20 % = 18 024', () => {
    expect(line('15660').patronal?.retenue).toBe(18024);
  });

  it('Totaux cotisations: salariales 396 110 (hors CMU), patronales 165 024', () => {
    expect(slip.totals.cotisationsSalariales).toBe(396110); // 301 483 + 94 627
    expect(slip.totals.cotisationsPatronales).toBe(165024);
  });

  it('Indemnité de Transport 200 000 non imposable', () => {
    expect(line('10200').salarial?.gain).toBe(200000);
    expect(slip.totals.gainsNonImposables).toBe(200000);
  });

  it('NET A PAYER = 1 305 901 (brut − retenues + transport)', () => {
    expect(slip.totals.netAPayer).toBe(1305901);
    expect(slip.totals.totalGains).toBe(1702011);
  });

  it('Ancienneté 01/06/23 → 30/06/25 = "2 an(s) et 0 mois"', () => {
    const s = computeAnciennete(new Date(2023, 5, 1), new Date(2025, 5, 30));
    expect(s.label).toBe('2 an(s) et 0 mois');
  });
});

describe('Ancienneté — cas limites', () => {
  it('embauche ce mois-ci → 0 an(s) et 0 mois', () => {
    expect(computeAnciennete(new Date(2026, 6, 1), new Date(2026, 6, 31)).label).toBe('0 an(s) et 0 mois');
  });

  it('anniversaire atteint exactement le jour de fin de période', () => {
    const s = computeAnciennete(new Date(2024, 0, 31), new Date(2026, 0, 31));
    expect(s.label).toBe('2 an(s) et 0 mois');
  });

  it('anniversaire non encore atteint (fin de période avant le jour anniversaire)', () => {
    const s = computeAnciennete(new Date(2024, 0, 31), new Date(2026, 1, 28));
    expect(s.label).toBe('2 an(s) et 0 mois'); // 28 fév < jour 31 -> mois non compté, mais l'année l'est déjà
  });

  it('franchissement de fin d\'année (embauche en décembre)', () => {
    const s = computeAnciennete(new Date(2024, 11, 1), new Date(2026, 0, 31));
    expect(s.label).toBe('1 an(s) et 1 mois');
  });

  it('date d\'embauche future → aucune anciennété négative', () => {
    const s = computeAnciennete(new Date(2027, 0, 1), new Date(2026, 6, 31));
    expect(s.years).toBe(0);
    expect(s.months).toBe(0);
  });
});

describe('Moteur — non-régression sur profils atypiques', () => {
  it('sursalaire à 0 (salaire de base seul)', () => {
    const slip = computePayslip({ profile: { baseSalary: 200000, sursalaire: 0, transportAllowance: 0, partsIgr: 1, cmuDependents: 0 }, rules: RULES });
    expect(slip.totals.brut).toBe(200000);
    expect(slip.lines.find((l) => l.code === '190')).toBeUndefined();
  });

  it('lignes additionnelles imposables et non imposables', () => {
    const slip = computePayslip({
      profile: {
        baseSalary: 300000, sursalaire: 0, transportAllowance: 0, partsIgr: 1, cmuDependents: 0,
        extraLines: [
          { code: '191', label: 'Prime rendement', amount: 50000, taxable: true },
          { code: '10300', label: 'Prime de panier', amount: 15000, taxable: false },
        ],
      },
      rules: RULES,
    });
    expect(slip.totals.brut).toBe(350000); // 300k + 50k taxable extra
    expect(slip.totals.gainsNonImposables).toBe(15000);
    expect(slip.lines.find((l) => l.code === '191')!.kind).toBe('gain');
    expect(slip.lines.find((l) => l.code === '10300')!.kind).toBe('gain_non_imposable');
  });

  it('parts IGR non entières (2.5) sont acceptées et arrondies au demi-part pour le RICF', () => {
    expect(computeRICF(2.5, RULES)).toBe(16500); // 3 demi-parts au-dessus de 1 part × 5 500
  });
});

describe('ITS — barème et RICF', () => {
  it('salaire ≤ 75 000 → 0 impôt', () => {
    expect(computeGrossITS(75000, RULES.its_brackets)).toBe(0);
    expect(computeGrossITS(50000, RULES.its_brackets)).toBe(0);
  });

  it('bornes des tranches', () => {
    expect(computeGrossITS(240000, RULES.its_brackets)).toBe(26400); // 165 000 × 16 %
    expect(computeGrossITS(800000, RULES.its_brackets)).toBe(144000); // + 560 000 × 21 %
    expect(computeGrossITS(2400000, RULES.its_brackets)).toBe(528000); // + 1 600 000 × 24 %
    expect(computeGrossITS(8000000, RULES.its_brackets)).toBe(2096000); // + 5 600 000 × 28 %
    expect(computeGrossITS(10000000, RULES.its_brackets)).toBe(2736000); // + 2 000 000 × 32 %
  });

  it('RICF: 1 part = 0, 2 parts = 11 000, plafond 44 000 à 5 parts', () => {
    expect(computeRICF(1, RULES)).toBe(0);
    expect(computeRICF(1.5, RULES)).toBe(5500);
    expect(computeRICF(2, RULES)).toBe(11000);
    expect(computeRICF(5, RULES)).toBe(44000);
    expect(computeRICF(7, RULES)).toBe(44000); // clamped
  });

  it("l'ITS ne devient jamais négatif", () => {
    expect(computeITS(80000, 5, RULES).net).toBe(0);
  });
});

describe('CNPS — plafonds', () => {
  it('retraite plafonnée à 3 375 000', () => {
    const slip = computePayslip({ profile: { ...ABA_CI11, baseSalary: 5000000, sursalaire: 0 }, rules: RULES });
    const retraite = slip.lines.find((l) => l.code === '15200')!;
    expect(retraite.base).toBe(3375000);
    expect(retraite.salarial?.retenue).toBe(Math.round(3375000 * 0.063));
    expect(retraite.patronal?.retenue).toBe(Math.round(3375000 * 0.077));
  });

  it('PF/AT non plafonnées sous le SMIG', () => {
    const slip = computePayslip({ profile: { ...ABA_CI11, baseSalary: 60000, sursalaire: 0, transportAllowance: 0, cmuDependents: 0 }, rules: RULES });
    expect(slip.lines.find((l) => l.code === '15300')!.base).toBe(60000);
    expect(slip.lines.find((l) => l.code === '15400')!.base).toBe(60000);
  });

  it('arrondi demi-franc supérieur (PF 4 312,5 → 4 313)', () => {
    const slip = computePayslip({ profile: ABA_CI11, rules: RULES });
    expect(slip.lines.find((l) => l.code === '15300')!.patronal?.retenue).toBe(4313);
  });
});

describe('Cumuls et format', () => {
  it('cumuls année = période courante + bulletins validés antérieurs', () => {
    const june = computePayslip({ profile: ABA_CI11, rules: RULES });
    const cumuls = computeCumuls(june, [june]); // e.g. May identical + June
    expect(cumuls.netAPayer).toBe(2 * 1305901);
    expect(cumuls.brutImposable).toBe(2 * 1502011);
    expect(cumuls.chargesPatronales).toBe(2 * 165024);
  });

  it('formatCFA: 1502011 → "1 502 011"', () => {
    expect(formatCFA(1502011).replace(/ | /g, ' ')).toBe('1 502 011');
  });
});
