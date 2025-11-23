import type { APIRoute } from 'astro';
import { languages } from '../../lib/i18n';

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site?.toString() || 'https://arbrebio.com';

  // Define all routes with their priorities and change frequencies
  const routes = [
    // Homepage
    { path: '/', priority: 1.0, changefreq: 'daily' },

    // Main service pages
    { path: '/greenhouses', priority: 0.9, changefreq: 'weekly' },
    { path: '/greenhouses/high-tech', priority: 0.9, changefreq: 'weekly' },
    { path: '/greenhouses/accessories', priority: 0.8, changefreq: 'weekly' },
    { path: '/irrigation', priority: 0.9, changefreq: 'weekly' },
    { path: '/irrigation/drip-systems', priority: 0.8, changefreq: 'weekly' },
    { path: '/irrigation/sprinklers', priority: 0.8, changefreq: 'weekly' },
    { path: '/irrigation/controllers', priority: 0.8, changefreq: 'weekly' },
    { path: '/substrates', priority: 0.9, changefreq: 'weekly' },
    { path: '/substrates/growing-solutions', priority: 0.8, changefreq: 'weekly' },

    // Company pages
    { path: '/about', priority: 0.7, changefreq: 'monthly' },
    { path: '/company', priority: 0.7, changefreq: 'monthly' },
    { path: '/contact', priority: 0.8, changefreq: 'monthly' },
    { path: '/projects', priority: 0.7, changefreq: 'weekly' },
    { path: '/success-stories', priority: 0.7, changefreq: 'weekly' },
    { path: '/solutions', priority: 0.8, changefreq: 'weekly' },

    // Legal pages
    { path: '/privacy', priority: 0.3, changefreq: 'yearly' },
    { path: '/terms', priority: 0.3, changefreq: 'yearly' },
    { path: '/cookies', priority: 0.3, changefreq: 'yearly' },

    // Blog
    { path: '/blog', priority: 0.8, changefreq: 'daily' },
  ];

  // Target keywords for location-specific pages
  const targetKeywords = [
    'serre-ivoire',
    'greenhouse-africa',
    'irrigation-cotedivoire',
    'agriculture-sous-serre',
    'precision-farming-africa'
  ];

  const currentDate = new Date().toISOString();

  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  sitemap += '        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n';
  sitemap += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

  // Generate URLs for all routes in all languages
  routes.forEach(route => {
    Object.keys(languages).forEach(lang => {
      const path = lang === 'en' ? route.path : `/${lang}${route.path}`;
      const url = `${baseUrl}${path}`;

      sitemap += '  <url>\n';
      sitemap += `    <loc>${url}</loc>\n`;
      sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
      sitemap += `    <changefreq>${route.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${route.priority}</priority>\n`;

      // Add hreflang alternatives
      Object.keys(languages).forEach(altLang => {
        const altPath = altLang === 'en' ? route.path : `/${altLang}${route.path}`;
        const altUrl = `${baseUrl}${altPath}`;
        sitemap += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altUrl}" />\n`;
      });

      // Add x-default for default language
      const defaultPath = route.path;
      const defaultUrl = `${baseUrl}${defaultPath}`;
      sitemap += `    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultUrl}" />\n`;

      sitemap += '  </url>\n';
    });
  });

  sitemap += '</urlset>';

  return new Response(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Robots-Tag': 'noindex'
    }
  });
};
