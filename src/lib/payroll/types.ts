// Types for the Ivorian payroll engine (bulletin de paie).
// All money amounts are integer CFA francs unless stated otherwise.

export interface ItsBracket {
  /** Upper bound of the bracket in CFA (null = no upper bound). */
  upTo: number | null;
  rate: number;
}

export interface PayrollRules {
  its_brackets: ItsBracket[];
  /** RICF: réduction d'impôt pour charges de famille, per half-share above 1 part. */
  ricf_per_half_share: number;
  ricf_cap: number;
  cnps_retraite: { employee_rate: number; employer_rate: number; ceiling: number };
  prestations_familiales: { rate: number; ceiling: number };
  accident_travail: { rate: number; ceiling: number };
  taxe_apprentissage_rate: number;
  fpc_rate: number;
  fpc_regularisation_rate: number;
  its_patronal_rate: number;
  /** CMU: cotisation per covered person per month. */
  cmu_unit: number;
  monthly_hours: number;
}

export interface ExtraLine {
  code: string;
  label: string;
  amount: number;
  /** true → included in brut imposable; false → paid after cotisations (like transport). */
  taxable: boolean;
}

export interface ProfileInput {
  baseSalary: number;
  sursalaire: number;
  transportAllowance: number;
  partsIgr: number;
  cmuDependents: number;
  extraLines?: ExtraLine[];
}

export interface PayslipLinePart {
  /** Display rate as a percentage (e.g. 6.3 → "6,30"). */
  taux?: number;
  gain?: number;
  retenue?: number;
}

export interface PayslipLine {
  code: string;
  label: string;
  nombre?: number;
  base: number;
  salarial?: PayslipLinePart & {
    /** false → shown on the slip but NOT counted in Total Cotisations salariales / net (SAGE behavior for CMU). */
    affectsNet?: boolean;
  };
  patronal?: PayslipLinePart;
  /** Marks rendering sections: 'gain' | 'cotisation' | 'gain_non_imposable'. */
  kind: 'gain' | 'cotisation' | 'gain_non_imposable';
}

export interface PayslipTotals {
  /** Total Brut = brut imposable (gains soumis). */
  brut: number;
  brutImposable: number;
  totalGains: number;
  gainsNonImposables: number;
  cotisationsSalariales: number;
  cotisationsPatronales: number;
  avantagesNature: number;
  heuresTravaillees: number;
  heuresSupplementaires: number;
  netAPayer: number;
}

export interface ComputedSlip {
  lines: PayslipLine[];
  totals: PayslipTotals;
  its: { gross: number; ricf: number; net: number };
}

export interface Cumuls {
  totalGains: number;
  chargesSalariales: number;
  chargesPatronales: number;
  avantagesNature: number;
  brutImposable: number;
  heuresTravaillees: number;
  heuresSupplementaires: number;
  netAPayer: number;
}
