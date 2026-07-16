// Congés payés.
//
// Formulas below were reverse-engineered and CROSS-VALIDATED against two
// consecutive real SAGE bulletins for the same employee (ABA-CI210,
// 07/2025 → 08/2025), comparing deltas month-to-month:
//   - "Congé pris" printed on the bulletin is a CUMULATIVE total within the
//     current exercice (15 → 30, +15 = exactly the days taken in 08/2025),
//     not a period-only value.
//   - "Solde Congés reste à prendre" carries forward and nets out to an
//     implied accrual of 1,375 jours in a half-worked month (15/30 days),
//     which is exactly 2,75 × (15/30) — confirming a 2,75 jours/mois
//     accrual rate prorated by days actually worked.
//   - "Jours fiscaux" advances by a flat +30 every period regardless of the
//     calendar month's actual length (225 → 255 across a 31-day July) — a
//     30-day fiscal-month counter that must be seeded once from a real
//     bulletin, then self-increments.
//   - "Jours congé acquis Anc & Déco" printed as 0 in both samples despite
//     the real accrual happening — this field is a manual admin correction
//     (rarely used), not a display of the automatic monthly accrual.
//
// Still NOT implemented because a 2-bulletin sample wasn't enough to pin
// them down with certainty (kept null — rendered as "—" rather than a
// guessed number):
//   - "Jours depuis dernier congé" (needs a sample month with no leave taken
//     to confirm the normal increment rate).
//   - "Total Brut Congé" and the exact daily rate used by the "2950 Congés
//     Payés" earnings line (7 886 F/jour in the sample — no clean divisor
//     found from the data available). Because this would affect Net à
//     Payer, it is intentionally NOT auto-generated on the payslip yet.

export interface CongesDateRange {
  du: string; // ISO date
  au: string; // ISO date
}

export interface CongesInput {
  /** Balance carried forward from the previous validated slip (0 if none). */
  previousSolde: number;
  /** Cumulative "congé pris" carried forward from the previous validated slip (0 if none). */
  previousCongePris: number;
  /** "Jours fiscaux" carried forward from the previous validated slip (null if never seeded). */
  previousJoursFiscaux: number | null;
  /** Admin-entered: number of leave days taken during THIS pay period. */
  joursPrisPeriode: number;
  /** Admin-entered: manual correction to acquired days (rare — 0 unless SAGE shows otherwise for this employee). */
  joursAcquisManuel: number;
  /** Admin-entered: date ranges of leave taken during this pay period. */
  dates: CongesDateRange[];
  /** Prorata of the period actually worked (1 = full month). */
  prorata: number;
  /** One-time (re)seed of the jours fiscaux counter from a real SAGE bulletin; overrides the carried-forward value when provided. */
  seedJoursFiscaux?: number | null;
}

export interface Conges {
  jours_acquis: number;
  conge_pris: number;
  solde: number;
  dates: CongesDateRange[];
  jours_fiscaux: number | null;
  // Pending confirmation — see file header.
  jours_depuis_conge: number | null;
  total_brut_conge: number | null;
}

/** Jours ouvrables acquis par mois complet — validated against two consecutive real SAGE bulletins (see file header). */
const ACCRUAL_RATE_PER_MONTH = 2.75;
const FISCAL_DAYS_PER_MONTH = 30;

const round1 = (n: number) => Math.round(n * 10) / 10;
const round3 = (n: number) => Math.round(n * 1000) / 1000;

export function computeConges(input: CongesInput): Conges {
  const routineAccrual = ACCRUAL_RATE_PER_MONTH * input.prorata;
  const solde = round3(input.previousSolde + routineAccrual + input.joursAcquisManuel - input.joursPrisPeriode);
  const congePris = round1(input.previousCongePris + input.joursPrisPeriode);
  const joursFiscaux =
    input.seedJoursFiscaux != null
      ? input.seedJoursFiscaux
      : input.previousJoursFiscaux != null
        ? input.previousJoursFiscaux + FISCAL_DAYS_PER_MONTH
        : null;

  return {
    jours_acquis: round1(input.joursAcquisManuel),
    conge_pris: congePris,
    solde,
    dates: input.dates,
    jours_fiscaux: joursFiscaux,
    jours_depuis_conge: null,
    total_brut_conge: null,
  };
}
