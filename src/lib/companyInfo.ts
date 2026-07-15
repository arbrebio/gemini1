// Central company identity for generated documents (invoices, bulletins de paie).
// Legal identifiers are strings and must never be reduced to digits
// (e.g. the payroll N° Contribuable "2305213 D" keeps its trailing letter).

export const COMPANY = {
  name: "Arbre Bio Côte d'Ivoire",
  address: '01 BP 6664 ABIDJAN 01',
  rccm: 'CI-ABJ-03-2023-B13-12469',
  /** NCC used on sales invoices. */
  nccInvoice: '25052130',
  /** Payroll identifiers (editable in payroll_settings; these are the defaults). */
  cnpsEmployer: '456271',
  contribuablePayroll: '2305213 D',
  email: 'farms@arbrebio.com',
  phone: '(+225) 05 00 55 25 25',
  bank: 'BNI Bank CI092 01021 000115840024 78',
} as const;

/* Arbre Bio circular logo (white circle + dark green tree) — same artwork as the invoice. */
export const LOGO_SVG =
  '<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<circle cx="50" cy="50" r="49" fill="#fff" stroke="#194642" stroke-width="2"/>' +
  '<circle cx="50" cy="50" r="43" fill="none" stroke="#194642" stroke-width="1"/>' +
  '<rect x="47" y="60" width="6" height="20" rx="3" fill="#194642"/>' +
  '<line x1="50" y1="70" x2="36" y2="62" stroke="#194642" stroke-width="2.5" stroke-linecap="round"/>' +
  '<line x1="50" y1="66" x2="65" y2="57" stroke="#194642" stroke-width="2.5" stroke-linecap="round"/>' +
  '<ellipse cx="50" cy="45" rx="15" ry="17" fill="#194642"/>' +
  '<ellipse cx="37" cy="52" rx="10" ry="11" fill="#194642"/>' +
  '<ellipse cx="63" cy="52" rx="10" ry="11" fill="#194642"/>' +
  '<ellipse cx="50" cy="38" rx="8" ry="9" fill="#2a6b60" opacity=".6"/>' +
  '</svg>';
