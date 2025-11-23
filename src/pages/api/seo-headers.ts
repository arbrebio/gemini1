import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  // Define recommended HTTP headers for SEO
  const headers = {
    // Security headers
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
    
    // Caching headers
    'Cache-Control': 'public, max-age=3600',
    'Vary': 'Accept-Language, Accept-Encoding',
    
    // Content headers
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://rsms.me https://cdnjs.cloudflare.com; img-src 'self' data: https://i.imgur.com https://images.unsplash.com; font-src 'self' https://rsms.me https://cdnjs.cloudflare.com; connect-src 'self' https://*.supabase.co; frame-ancestors 'none';",
  };
  
  // Return the headers as JSON
  return new Response(JSON.stringify(headers, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'max-age=3600'
    }
  });
};