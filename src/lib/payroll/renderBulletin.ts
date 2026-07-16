// Renders a stored payroll slip (payroll_slips row) as the printable
// BULLETIN DE PAIE — SAGE Paie layout. Pure rendering: every figure comes
// from the stored lines/totals/cumuls; no math happens here.

import { COMPANY, LOGO_SVG } from '../companyInfo';
import { formatCFA, formatDateShort, formatNombre, formatTaux } from './format';
import type { Cumuls, PayslipLine, PayslipTotals } from './types';

export interface SlipRow {
  id: string;
  period_start: string;
  period_end: string;
  payment_date: string;
  status: string;
  profile_snapshot: {
    matricule: string;
    parts_igr: number;
    employee_cnps_number?: string | null;
    bank_account?: string | null;
    category?: string | null;
    grade?: string | null;
    salary_type?: string;
    payment_method?: string;
    seniority_date?: string | null;
    anciennete_label?: string | null;
    employee: {
      full_name: string;
      address?: string | null;
      worker_id?: string;
      job_title?: string;
      department?: string | null;
      start_date?: string | null;
      contract_type?: string | null;
    };
  };
  company_snapshot?: { cnps_number?: string; contribuable_number?: string; logo_url?: string | null };
  lines: PayslipLine[];
  totals: PayslipTotals;
  cumuls: Cumuls;
  conges?: Record<string, unknown>;
}

const esc = (s: unknown): string =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

const money = (n: number | undefined | null) => (n || n === 0 ? formatCFA(n) : '');
const nb = (n: number | undefined | null) => (typeof n === 'number' ? formatNombre(n) : '');

function lineRow(l: PayslipLine): string {
  return (
    '<tr>' +
    `<td class="c-code">${esc(l.code)}</td>` +
    `<td class="c-label">${esc(l.label)}</td>` +
    `<td class="c-num">${l.nombre != null ? nb(l.nombre) : ''}</td>` +
    `<td class="c-num">${money(l.base)}</td>` +
    `<td class="c-num">${l.salarial?.taux != null ? formatTaux(l.salarial.taux) : ''}</td>` +
    `<td class="c-num">${l.salarial?.gain != null ? money(l.salarial.gain) : ''}</td>` +
    `<td class="c-num">${l.salarial?.retenue != null ? money(l.salarial.retenue) : ''}</td>` +
    `<td class="c-num">${l.patronal?.taux != null ? formatTaux(l.patronal.taux) : ''}</td>` +
    `<td class="c-num">${l.patronal?.retenue != null ? money(l.patronal.retenue) : ''}</td>` +
    '</tr>'
  );
}

export function renderBulletin(slip: SlipRow): string {
  const p = slip.profile_snapshot;
  const emp = p.employee;
  const company = slip.company_snapshot || {};
  const cnps = company.cnps_number || COMPANY.cnpsEmployer;
  // N° Contribuable is a full string ("2305213 D") — rendered verbatim.
  const ncc = company.contribuable_number || COMPANY.contribuablePayroll;
  // Official logo uploaded by the admin in Payroll Settings; falls back to
  // the generic inline mark only until one has been uploaded.
  const logoHtml = company.logo_url
    ? `<img src="${esc(company.logo_url)}" alt="${esc(COMPANY.name)}" />`
    : LOGO_SVG;

  const gains = slip.lines.filter((l) => l.kind === 'gain');
  const cotisations = slip.lines.filter((l) => l.kind === 'cotisation');
  const gainsNonImposables = slip.lines.filter((l) => l.kind === 'gain_non_imposable');
  const t = slip.totals;
  const c = slip.cumuls;
  const conges = (slip.conges || {}) as Record<string, any>;

  const infoCell = (label: string, value: unknown) =>
    `<div class="info-cell"><span class="info-label">${esc(label)}</span><span class="info-value">${esc(value ?? '') || '&nbsp;'}</span></div>`;

  const cumulRow = (label: string, row: Cumuls) =>
    '<tr>' +
    `<td class="c-label">${esc(label)}</td>` +
    `<td class="c-num">${money(row.totalGains)}</td>` +
    `<td class="c-num">${money(row.chargesSalariales)}</td>` +
    `<td class="c-num">${money(row.chargesPatronales)}</td>` +
    `<td class="c-num">${row.avantagesNature ? money(row.avantagesNature) : ''}</td>` +
    `<td class="c-num">${money(row.brutImposable)}</td>` +
    `<td class="c-num">${nb(row.heuresTravaillees)}</td>` +
    `<td class="c-num">${row.heuresSupplementaires ? nb(row.heuresSupplementaires) : '0'}</td>` +
    `<td class="c-num c-net">${money(row.netAPayer)}</td>` +
    '</tr>';

  const periodeCumuls: Cumuls = {
    totalGains: t.brut,
    chargesSalariales: t.cotisationsSalariales,
    chargesPatronales: t.cotisationsPatronales,
    avantagesNature: t.avantagesNature,
    brutImposable: t.brutImposable,
    heuresTravaillees: t.heuresTravaillees,
    heuresSupplementaires: t.heuresSupplementaires,
    netAPayer: t.netAPayer,
  };

  return `
<div class="bulletin">
  ${slip.status === 'draft' ? '<div class="draft-banner">BROUILLON — NON VALIDÉ</div>' : ''}

  <!-- ═══ EN-TÊTE ═══ -->
  <div class="b-header">
    <div class="b-company">
      <div class="b-logo">${logoHtml}</div>
      <div class="b-company-info">
        <div class="co-name">${esc(COMPANY.name)}</div>
        <div>${esc(COMPANY.address)}</div>
        <div>Email : ${esc(COMPANY.email)} — Tél : ${esc(COMPANY.phone)}</div>
        <div class="co-ids">CNPS : <strong>${esc(cnps)}</strong> &nbsp;&nbsp; N° Contribuable : <strong>${esc(ncc)}</strong></div>
      </div>
    </div>
    <div class="b-title">
      <div class="b-title-text">BULLETIN&nbsp; DE&nbsp; PAIE</div>
      <div class="b-period">Période du ${formatDateShort(slip.period_start)} au ${formatDateShort(slip.period_end)}</div>
      <div class="b-payment">Paiement le ${formatDateShort(slip.payment_date)} par ${esc(p.payment_method || 'Virement')}</div>
      <div class="b-employee-name">
        <div class="emp-name">${esc(emp.full_name)}</div>
        ${emp.address ? `<div class="emp-addr">${esc(emp.address)}</div>` : ''}
      </div>
    </div>
  </div>

  <!-- ═══ INFORMATIONS SALARIÉ ═══ -->
  <div class="b-info-grid">
    ${infoCell('Matricule', p.matricule)}
    ${infoCell('Ancienneté', p.anciennete_label || '—')}
    ${infoCell('Parts IGR', formatNombre(Number(p.parts_igr)))}
    ${infoCell('N° CNPS', p.employee_cnps_number || '—')}
    ${infoCell('Date Embauche', emp.start_date ? formatDateShort(emp.start_date) : '—')}
    ${infoCell('Date ancienneté', p.seniority_date ? formatDateShort(p.seniority_date) : '—')}
    ${infoCell('Grade', p.grade || ' ')}
    ${infoCell('Emploi', emp.job_title || '—')}
    ${infoCell('Type Salaire', p.salary_type || 'Mensuel')}
    ${infoCell('Département', emp.department || '—')}
    ${infoCell('Catégorie', p.category || '—')}
    ${infoCell('Type Contrat', emp.contract_type || '—')}
    ${infoCell('N° de compte', p.bank_account || '—')}
    ${infoCell('Worker ID', emp.worker_id || '—')}
  </div>

  <!-- ═══ CORPS DU BULLETIN ═══ -->
  <table class="b-table">
    <thead>
      <tr>
        <th rowspan="2" class="c-code">N°</th>
        <th rowspan="2" class="c-label">Désignation</th>
        <th rowspan="2">Nombre</th>
        <th rowspan="2">Base</th>
        <th colspan="3">Part salariale</th>
        <th colspan="2">Part patronale</th>
      </tr>
      <tr>
        <th>Taux</th><th>Gain</th><th>Retenue</th><th>Taux</th><th>Retenue</th>
      </tr>
    </thead>
    <tbody>
      ${gains.map(lineRow).join('')}
      <tr class="row-total">
        <td></td><td class="c-label"><strong>Total Brut</strong></td>
        <td></td><td></td><td></td>
        <td class="c-num"><strong>${money(t.brut)}</strong></td>
        <td></td><td></td><td></td>
      </tr>
      ${cotisations.map(lineRow).join('')}
      <tr class="row-total">
        <td></td><td class="c-label"><strong>Total Cotisations</strong></td>
        <td></td><td></td><td></td><td></td>
        <td class="c-num"><strong>${money(t.cotisationsSalariales)}</strong></td>
        <td></td>
        <td class="c-num"><strong>${money(t.cotisationsPatronales)}</strong></td>
      </tr>
      ${gainsNonImposables.map(lineRow).join('')}
      <tr class="row-net">
        <td></td><td class="c-label"><strong>NET A PAYER CFA</strong></td>
        <td></td><td></td><td></td>
        <td class="c-num c-net" colspan="2"><strong>${money(t.netAPayer)}</strong></td>
        <td></td><td></td>
      </tr>
    </tbody>
  </table>

  <!-- ═══ CUMULS ═══ -->
  <table class="b-cumuls">
    <thead>
      <tr>
        <th class="c-label">Cumuls</th>
        <th>Total gains</th>
        <th>Charges<br/>salariales</th>
        <th>Charges<br/>patronales</th>
        <th>Avantages<br/>en nature</th>
        <th>Brut imposable</th>
        <th>Heures<br/>travaillées</th>
        <th>Heures<br/>supplémentaires</th>
        <th>NET A PAYER CFA</th>
      </tr>
    </thead>
    <tbody>
      ${cumulRow('Période', periodeCumuls)}
      ${cumulRow('Année', c)}
    </tbody>
  </table>

  <!-- ═══ CONGÉS ═══ -->
  <div class="b-conges">
    <div class="conges-col">
      <div>Jours fiscaux&nbsp;: <strong>${conges.jours_fiscaux != null ? nb(Number(conges.jours_fiscaux)) : '—'}</strong></div>
      <div>Jours depuis dernier congé&nbsp;: <strong>${conges.jours_depuis_conge != null ? nb(Number(conges.jours_depuis_conge)) : '—'}</strong></div>
      <div>Jours congé acquis Anc &amp; Déco&nbsp;: <strong>${conges.jours_acquis != null ? nb(Number(conges.jours_acquis)) : '—'}</strong></div>
      <div>Solde Congés reste à prendre&nbsp;: <strong>${conges.solde != null ? nb(Number(conges.solde)) : '—'}</strong></div>
      <div>Total Brut Congé&nbsp;: <strong>${conges.total_brut_conge != null ? money(Number(conges.total_brut_conge)) : '—'}</strong></div>
    </div>
    <div class="conges-col">
      <div>Dates de congés&nbsp;:</div>
      ${[0, 1, 2].map((i) => {
        const d = (conges.dates as Array<{ du?: string; au?: string }> | undefined)?.[i];
        return `<div>Du ${d?.du ? formatDateShort(String(d.du)) : '______'} &nbsp; Au ${d?.au ? formatDateShort(String(d.au)) : '______'}</div>`;
      }).join('')}
      <div>Congé pris&nbsp;: <strong>${conges.conge_pris != null ? nb(Number(conges.conge_pris)) : '—'}</strong></div>
    </div>
  </div>

  <div class="b-footer">
    ${esc(COMPANY.name)} — ${esc(COMPANY.address)} — CNPS : ${esc(cnps)} — N° Contribuable : ${esc(ncc)}
  </div>
</div>`;
}

/** Shared CSS for the bulletin (A4 print + screen preview). */
export const BULLETIN_CSS = `
  .bulletin {
    background: #fff; color: #111; width: 100%; max-width: 800px; margin: 0 auto;
    font-family: 'Segoe UI', Arial, sans-serif; font-size: 11.5px;
    padding: 26px 28px; box-shadow: 0 6px 30px rgba(0,0,0,.18); position: relative;
  }
  .draft-banner {
    background: #fff3cd; color: #7c5a00; border: 1px dashed #f0c36d;
    text-align: center; font-weight: 700; letter-spacing: 2px;
    padding: 6px; margin-bottom: 12px; font-size: 12px;
  }
  .b-header { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid #194642; }
  .b-company { display: flex; align-items: flex-start; gap: 12px; }
  .b-logo { flex-shrink: 0; }
  .b-logo svg, .b-logo img { width: 64px; height: 64px; object-fit: contain; }
  .b-company-info { font-size: 10.5px; line-height: 1.55; color: #333; }
  .co-name { font-size: 13px; font-weight: 700; color: #194642; margin-bottom: 1px; }
  .co-ids { margin-top: 3px; }
  .b-title { text-align: right; min-width: 300px; }
  .b-title-text { font-size: 17px; font-weight: 800; letter-spacing: 2px; color: #194642; border: 2px solid #194642; display: inline-block; padding: 4px 14px; }
  .b-period, .b-payment { font-size: 11px; margin-top: 4px; color: #333; }
  .b-employee-name { margin-top: 10px; }
  .emp-name { font-size: 13.5px; font-weight: 700; }
  .emp-addr { font-size: 11px; color: #333; }
  .b-info-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    border: 1px solid #9bb3a8; margin-bottom: 10px;
  }
  .info-cell { border: 0.5px solid #cfdcd4; padding: 3px 8px; display: flex; flex-direction: column; }
  .info-label { font-size: 8.5px; text-transform: uppercase; letter-spacing: .5px; color: #5b6f66; }
  .info-value { font-size: 11px; font-weight: 600; color: #111; min-height: 14px; }
  table.b-table, table.b-cumuls { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
  table.b-table th, table.b-cumuls th {
    background: #194642; color: #fff; font-size: 9.5px; font-weight: 700;
    padding: 4px 6px; border: 1px solid #194642; text-align: center;
  }
  table.b-table td, table.b-cumuls td { border: 1px solid #c8d5c0; padding: 3.5px 6px; font-size: 11px; }
  td.c-code { width: 44px; text-align: left; }
  td.c-label, th.c-label { text-align: left; }
  td.c-num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
  tr.row-total td { background: #eef4ee; border-top: 1.5px solid #194642; }
  tr.row-net td { background: #194642; color: #fff; border: 1px solid #194642; font-size: 12.5px; }
  tr.row-net td.c-net { font-size: 14px; letter-spacing: .5px; }
  table.b-cumuls td.c-net { font-weight: 700; }
  .b-conges { display: flex; gap: 30px; border: 1px solid #c8d5c0; padding: 8px 12px; font-size: 10.5px; line-height: 1.9; margin-bottom: 10px; }
  .conges-col { flex: 1; }
  .b-footer { text-align: center; font-size: 9px; color: #777; border-top: 1px solid #ddd; padding-top: 6px; }
  @media print {
    body { background: #fff !important; }
    #action-bar { display: none !important; }
    #page-wrap { padding: 0 !important; max-width: none !important; }
    .bulletin { box-shadow: none; max-width: none; padding: 10mm 12mm; }
    @page { size: A4; margin: 8mm; }
  }
`;
