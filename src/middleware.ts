import { defineMiddleware } from 'astro:middleware';
import { getLangFromUrl, defaultLang, languages, getLocalizedPath } from './lib/i18n';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Skip middleware for API routes and static assets
  if (pathname.startsWith('/api/') || 
      pathname.startsWith('/_') || 
      pathname.includes('.') ||
      pathname === '/favicon.ico' ||
      pathname === '/manifest.json' ||
      pathname === '/sw.js') {
    return next();
  }

  const lang = getLangFromUrl(url);

  // Add language to locals for use in components
  context.locals.lang = lang;

  // If path is root, continue
  if (pathname === '/') {
    return next();
  }

  // Get first path segment
  const firstSegment = pathname.split('/')[1];

  // If first segment is not a valid language and not empty
  if (firstSegment && !(firstSegment in languages)) {
    // This is a content path, check if it should use default language
    if (lang === defaultLang) {
      return next();
    }
    // Invalid language prefix, redirect to default
    return Response.redirect(new URL(getLocalizedPath(pathname, defaultLang), url.origin));
  }

  return next();
});