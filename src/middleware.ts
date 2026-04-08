import { defineMiddleware } from 'astro:middleware';
import { getLangFromUrl } from './lib/i18n';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Skip middleware for API routes, admin and static assets
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/admin/') ||
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

  return next();
});
