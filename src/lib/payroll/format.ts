// Formatting helpers for the bulletin de paie (French / CFA conventions).

/** 1502011 → "1 502 011" (non-breaking spaces as thousands separators). */
export function formatCFA(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? '-' : '';
  const digits = Math.abs(rounded).toString();
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** 6.3 → "6,30" ; 0.4 → "0,40". */
export function formatTaux(rate: number): string {
  return rate.toFixed(2).replace('.', ',');
}

/** 236.36 → "236,36" ; 30 → "30,00". */
export function formatNombre(n: number): string {
  return n.toFixed(2).replace('.', ',');
}

/** Date → "01/06/25". */
export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(`${date}T00:00:00`) : date;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export function monthNameFr(month: number): string {
  return MONTHS_FR[month - 1] || '';
}

/** First/last day of a month, as ISO strings (payment date = last day). */
export function periodBounds(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
}
