// Cumuls (year-to-date) for the bulletin footer: Période row + Année row.

import type { ComputedSlip, Cumuls, PayslipTotals } from './types';

export function totalsToCumuls(totals: PayslipTotals): Cumuls {
  return {
    // SAGE's footer "Total gains" is the taxable brut (transport excluded)
    totalGains: totals.brut,
    chargesSalariales: totals.cotisationsSalariales,
    chargesPatronales: totals.cotisationsPatronales,
    avantagesNature: totals.avantagesNature,
    brutImposable: totals.brutImposable,
    heuresTravaillees: totals.heuresTravaillees,
    heuresSupplementaires: totals.heuresSupplementaires,
    netAPayer: totals.netAPayer,
  };
}

/** Année row = current slip + all prior validated slips of the same year. */
export function computeCumuls(current: ComputedSlip, priorSameYear: Array<Pick<ComputedSlip, 'totals'>>): Cumuls {
  const rows = [...priorSameYear.map((s) => totalsToCumuls(s.totals)), totalsToCumuls(current.totals)];
  return rows.reduce(
    (acc, row) => ({
      totalGains: acc.totalGains + row.totalGains,
      chargesSalariales: acc.chargesSalariales + row.chargesSalariales,
      chargesPatronales: acc.chargesPatronales + row.chargesPatronales,
      avantagesNature: acc.avantagesNature + row.avantagesNature,
      brutImposable: acc.brutImposable + row.brutImposable,
      heuresTravaillees: Math.round((acc.heuresTravaillees + row.heuresTravaillees) * 100) / 100,
      heuresSupplementaires: acc.heuresSupplementaires + row.heuresSupplementaires,
      netAPayer: acc.netAPayer + row.netAPayer,
    }),
    { totalGains: 0, chargesSalariales: 0, chargesPatronales: 0, avantagesNature: 0, brutImposable: 0, heuresTravaillees: 0, heuresSupplementaires: 0, netAPayer: 0 }
  );
}
