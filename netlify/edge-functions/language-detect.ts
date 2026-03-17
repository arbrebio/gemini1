import type { Context, Config } from "@netlify/edge-functions";

// ─── COUNTRY → LANGUAGE MAPPING ────────────────────────────

const FRENCH_COUNTRIES = new Set([
  'CI','FR','BF','SN','ML','GN','CM','CD','MG','BJ','TG','NE',
  'CF','CG','GA','GQ','BE','CH','LU','MC','HT','MU','DJ','KM','SC','VU','PF','NC','TD','BI','RW','SS'
]);

const SPANISH_COUNTRIES = new Set([
  'ES','MX','CO','AR','CL','PE','VE','EC','BO','PY','UY','CU',
  'DO','GT','HN','SV','NI','CR','PA','PR'
]);

const AFRIKAANS_COUNTRIES = new Set(['ZA','NA']);

type Lang = 'en' | 'fr' | 'es' | 'af';

function detectFromCountry(country: string | undefined): Lang | null {
  if (!country) return null;
  const c = country.toUpperCase();
  if (FRENCH_COUNTRIES.has(c)) return 'fr';
  if (SPANISH_COUNTRIES.has(c)) return 'es';
  if (AFRIKAANS_COUNTRIES.has(c)) return 'af';
  return null;
}

function detectFromBrowser(acceptLanguage: string): Lang | null {
  const langs = acceptLanguage
    .split(',')
    .map(l => {
      const [code, q] = l.trim().split(';q=');
      return { code: code.split('-')[0].toLowerCase(), q: q ? parseFloat(q) : 1.0 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { code } of langs) {
    if (code === 'fr') return 'fr';
    if (code === 'es') return 'es';
    if (code === 'af') return 'af';
    if (code === 'en') return 'en';
  }
  return null;
}

function getLangCookie(cookieHeader: string): Lang | null {
  const match = cookieHeader.match(/arbrebio_lang=(en|fr|es|af)/);
  return match ? (match[1] as Lang) : null;
}

function getCurrentLang(pathname: string): Lang {
  if (pathname.startsWith('/fr/') || pathname === '/fr') return 'fr';
  if (pathname.startsWith('/es/') || pathname === '/es') return 'es';
  if (pathname.startsWith('/af/') || pathname === '/af') return 'af';
  return 'en';
}

function buildRedirectPath(pathname: string, targetLang: Lang): string | null {
  const currentLang = getCurrentLang(pathname);
  if (currentLang === targetLang) return null;

  // Strip current lang prefix
  let base = pathname;
  if (/^\/(fr|es|af)(\/|$)/.test(pathname)) {
    base = pathname.replace(/^\/(fr|es|af)/, '') || '/';
  }

  return targetLang === 'en' ? base : `/${targetLang}${base === '/' ? '' : base}`;
}

export default async function handler(req: Request, context: Context) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // 1. Manual preference via cookie wins over everything
  const cookieLang = getLangCookie(req.headers.get('cookie') || '');
  if (cookieLang) {
    const redirectTo = buildRedirectPath(pathname, cookieLang);
    if (redirectTo && redirectTo !== pathname) {
      return Response.redirect(new URL(redirectTo, url.origin), 302);
    }
    return context.next();
  }

  // 2. Auto-detect: geo first, then browser Accept-Language
  const country = context.geo?.country?.code;
  const detectedLang =
    detectFromCountry(country) ||
    detectFromBrowser(req.headers.get('accept-language') || '') ||
    'en';

  const redirectTo = buildRedirectPath(pathname, detectedLang);
  if (redirectTo && redirectTo !== pathname) {
    const res = Response.redirect(new URL(redirectTo, url.origin), 302);
    // Remember choice for 7 days — prevents re-running on every request
    res.headers.append(
      'Set-Cookie',
      `arbrebio_lang=${detectedLang}; Path=/; Max-Age=604800; SameSite=Lax`
    );
    return res;
  }

  return context.next();
}

export const config: Config = {
  path: "/*",
  excludedPath: [
    "/fr/*", "/es/*", "/af/*",
    "/api/*", "/admin/*", "/_*",
    "/sw.js", "/manifest.json", "/robots.txt",
    "/sitemap.xml", "/sitemap-*.xml",
  ],
};
