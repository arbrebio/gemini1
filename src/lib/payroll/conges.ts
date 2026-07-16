// Congés payés — Code du Travail ivoirien art. 25.5 : 2,2 jours ouvrables
// acquis par mois complet de service, décomptés en solde courant.

export interface CongesInput {
  seniorityDate: Date;
  periodEnd: Date;
  /** Cumul des jours de congé pris depuis seniorityDate. */
  leaveDaysTaken: number;
  leaveLastStartDate: Date | null;
  leaveLastEndDate: Date | null;
  /** Journée de salaire, utilisée pour valoriser un congé pris pendant la période courante. */
  dailyRate: number;
  periodStart: Date;
}

export interface Conges {
  jours_acquis: number;
  conge_pris: number;
  solde: number;
  total_brut_conge: number;
  jours_fiscaux: number;
  jours_depuis_conge: number;
  conge_du: string | null;
  conge_au: string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const ACQUISITION_RATE_PER_MONTH = 2.2;

function fullMonthsBetween(start: Date, end: Date): number {
  if (end <= start) return 0;
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) months -= 1;
  return Math.max(0, months);
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function computeConges(input: CongesInput): Conges {
  const { seniorityDate, periodEnd, periodStart, leaveDaysTaken, leaveLastStartDate, leaveLastEndDate, dailyRate } = input;

  const months = fullMonthsBetween(seniorityDate, periodEnd);
  const joursAcquis = Math.round(months * ACQUISITION_RATE_PER_MONTH * 10) / 10;
  const congePris = Math.round(leaveDaysTaken * 10) / 10;
  const solde = Math.round((joursAcquis - congePris) * 10) / 10;

  const joursFiscaux = Math.max(0, Math.round((periodEnd.getTime() - seniorityDate.getTime()) / DAY_MS));

  const lastReturn = leaveLastEndDate || seniorityDate;
  const joursDepuisConge = Math.max(0, Math.round((periodEnd.getTime() - lastReturn.getTime()) / DAY_MS));

  // Valorise le congé uniquement s'il chevauche la période de paie courante.
  let totalBrutConge = 0;
  if (leaveLastStartDate && leaveLastEndDate) {
    const overlapStart = leaveLastStartDate > periodStart ? leaveLastStartDate : periodStart;
    const overlapEnd = leaveLastEndDate < periodEnd ? leaveLastEndDate : periodEnd;
    if (overlapEnd >= overlapStart) {
      const days = Math.round((overlapEnd.getTime() - overlapStart.getTime()) / DAY_MS) + 1;
      totalBrutConge = Math.round(days * dailyRate);
    }
  }

  return {
    jours_acquis: joursAcquis,
    conge_pris: congePris,
    solde,
    total_brut_conge: totalBrutConge,
    jours_fiscaux: joursFiscaux,
    jours_depuis_conge: joursDepuisConge,
    conge_du: leaveLastStartDate ? toISODate(leaveLastStartDate) : null,
    conge_au: leaveLastEndDate ? toISODate(leaveLastEndDate) : null,
  };
}
