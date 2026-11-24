import type { APIContext } from 'astro';
import { defineMiddleware } from 'astro:middleware';
import { getLangFromUrl } from './lib/i18n';
import { trackedPortal, isSensitiveGet, loginPortal, pickSafe, jwtClaims, type Portal } from './lib/activityDescribe';
import { recordActivity, clientIp } from './lib/activityLog';

const MAX_LOGGED_BODY = 100_000;

/**
 * Records staff activity for the admin, HR, terrain and sales-agent APIs:
 * every successful change, every sign-in, reads of sensitive data, and
 * refused (403) attempts. The route handler verifies the token first; the
 * log only reads the already-verified user id from it.
 */
async function trackApi(context: APIContext, next: () => Promise<Response>, portal: Portal) {
  const { request } = context;
  const url = new URL(request.url);
  const method = request.method.toUpperCase();
  if (method === 'OPTIONS' || method === 'HEAD') return next();

  // Copy whitelisted fields from small JSON bodies before the handler reads them.
  let details: Record<string, unknown> = pickSafe(Object.fromEntries(url.searchParams));
  const contentType = request.headers.get('content-type') || '';
  const length = Number(request.headers.get('content-length') || 0);
  if (method !== 'GET' && contentType.includes('application/json') && length <= MAX_LOGGED_BODY) {
    try {
      details = { ...details, ...pickSafe(JSON.parse(await request.clone().text())) };
    } catch { /* not JSON — nothing to copy */ }
  }

  const response = await next();

  const status = response.status;
  const login = loginPortal(method, url.pathname);
  const shouldLog =
    (status === 403) ||
    (status < 400 && (method !== 'GET' || !!login || isSensitiveGet(url.pathname, url.searchParams)));
  if (!shouldLog) return response;

  const authHeader = request.headers.get('Authorization') || '';
  const { sub, email } = jwtClaims(authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null);
  // Without a verified user there is nobody to attribute the action to
  // (public endpoints such as forgot-password still get logged as anonymous).
  if (!sub && status === 403) return response;

  await recordActivity({
    portal: login ?? portal,
    method,
    path: url.pathname,
    status,
    userId: sub,
    email,
    details,
    ip: clientIp(request),
    userAgent: request.headers.get('user-agent'),
    forceSummary: login ? { action: `${login}.login`, summary: 'Signed in' } : undefined,
  });
  return response;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  if (pathname.startsWith('/api/')) {
    const portal = trackedPortal(pathname);
    return portal ? trackApi(context, next, portal) : next();
  }

  // Skip middleware for admin, HR and static assets
  if (
    pathname.startsWith('/admin/') ||
    pathname.startsWith('/hr/') ||
    pathname === '/hr' ||
    pathname.startsWith('/_') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname === '/robots.txt'
  ) {
    return next();
  }

  const lang = getLangFromUrl(url);

  // Set language in locals for use in all components
  context.locals.lang = lang;

  try {
    return await next();
  } catch (err) {
    console.error(`Unhandled error rendering ${pathname}:`, err);
    return context.rewrite('/500');
  }
});
