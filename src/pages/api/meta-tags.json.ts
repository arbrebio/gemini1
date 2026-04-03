import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    return new Response('Site URL not found', { status: 500 });
  }

  try {
    // Generate meta tags report
    const metaTags = {
      required: [
        { name: 'title', status: 'implemented' },
        { name: 'description', status: 'implemented' },
        { name: 'viewport', status: 'implemented' },
        { name: 'canonical', status: 'implemented' },
      ],
      openGraph: [
        { name: 'og:title', status: 'implemented' },
        { name: 'og:description', status: 'implemented' },
        { name: 'og:url', status: 'implemented' },
        { name: 'og:image', status: 'implemented' },
        { name: 'og:type', status: 'implemented' },
        { name: 'og:locale', status: 'implemented' },
      ],
      twitter: [
        { name: 'twitter:card', status: 'implemented' },
        { name: 'twitter:title', status: 'implemented' },
        { name: 'twitter:description', status: 'implemented' },
        { name: 'twitter:image', status: 'implemented' },
      ],
      structured: [
        { name: 'Organization', status: 'implemented' },
        { name: 'WebPage', status: 'implemented' },
        { name: 'BreadcrumbList', status: 'implemented' },
        { name: 'Product', status: 'implemented' },
        { name: 'BlogPosting', status: 'implemented' },
      ],
      other: [
        { name: 'robots', status: 'implemented' },
        { name: 'author', status: 'implemented' },
        { name: 'theme-color', status: 'implemented' },
        { name: 'geo.region', status: 'implemented' },
      ],
    };
    
    return new Response(JSON.stringify(metaTags), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=3600'
      }
    });
  } catch (error) {
    console.error('Error generating meta tags report:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate meta tags report' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};