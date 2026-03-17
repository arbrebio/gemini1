import type { Config } from "@netlify/edge-functions";

export default async function handler(req: Request, context: any) {
  try {
    // ── Country sets defined INSIDE the function (Deno edge fn rule) ──
    const FRENCH = new Set([
      'CI','FR','BF','SN','ML','GN','CM','CD','MG','BJ','TG','NE',
      'CF','CG','GA','GQ','BE','CH','LU','MC','HT','MU','DJ','KM',
      'SC','VU','PF','NC','TD','BI','RW'
    ]);
    const SPANISH = new Set([
      'ES','MX','CO','AR','CL','PE','VE','EC','BO','PY','UY','CU',
      'DO','GT','HN','SV','NI','CR','PA','PR'
    ]);
    const AFRIKAANS = new Set(['ZA', 'NA']);

    const url = new URL(req.url);
    const path = url.pathname;

    // ── Already on a translated path — never redirect again ──
    if (
      path.startsWith('/fr') ||
      path.startsWith('/es') ||
      path.startsWith('/af') ||
      path.startsWith('/api/') ||
      path.startsWith('/admin/') ||
      path.startsWith('/_') ||
      path.includes('.')
    ) {
      return context.next();
    }

    // ── Helper: strip lang prefix to get the base path ──
    function basePath(p: string): string {
      const stripped = p.replace(/^\/(fr|es|af)(\/|$)/, '/');
      return stripped === '' ? '/' : stripped;
    }

    // ── Helper: build redirect URL ──
    function redirectTo(lang: string): Response {
      const dest = lang === 'en'
        ? basePath(path)
        : `/${lang}${basePath(path) === '/' ? '' : basePath(path)}`;
      const res = Response.redirect(new URL(dest, url.origin), 302);
      res.headers.append(
        'Set-Cookie',
        `arbrebio_lang=${lang}; Path=/; Max-Age=604800; SameSite=Lax`
      );
      return res;
    }

    // ── 1. Respect manual cookie preference ──
    const cookie = req.headers.get('cookie') ?? '';
    const cookieMatch = cookie.match(/arbrebio_lang=(en|fr|es|af)/);
    if (cookieMatch) {
      const preferred = cookieMatch[1];
      if (preferred !== 'en') {
        return redirectTo(preferred);
      }
      return context.next();
    }

    // ── 2. Geo-detection ──
    const country = (context.geo?.country?.code ?? '').toUpperCase();
    if (country) {
      if (FRENCH.has(country))    return redirectTo('fr');
      if (SPANISH.has(country))   return redirectTo('es');
      if (AFRIKAANS.has(country)) return redirectTo('af');
    }

    // ── 3. Browser Accept-Language fallback ──
    const acceptLang = req.headers.get('accept-language') ?? '';
    const primary = acceptLang.split(',')[0].split(';')[0].trim().split('-')[0].toLowerCase();
    if (primary === 'fr') return redirectTo('fr');
    if (primary === 'es') return redirectTo('es');
    if (primary === 'af') return redirectTo('af');

    // ── Default: serve English ──
    return context.next();

  } catch {
    // On any error, always serve the page — never crash the visitor's experience
    return context.next();
  }
}

export const config: Config = {
  path: "/*",
  excludedPath: [
    "/fr/*", "/es/*", "/af/*",
    "/api/*", "/admin/*", "/_*",
  ],
  onError: "continue",
};
