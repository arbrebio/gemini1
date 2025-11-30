import type { APIRoute } from 'astro';
import { checkLink, generateLinkReport } from '../../lib/linkChecker';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { urls } = await request.json();
    
    if (!Array.isArray(urls)) {
      return new Response(JSON.stringify({ 
        error: 'Expected an array of URLs' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Limit the number of URLs to check to prevent abuse
    const urlsToCheck = urls.slice(0, 50);
    
    const report = await generateLinkReport(urlsToCheck);
    
    return new Response(JSON.stringify(report), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=300' // Cache for 5 minutes
      }
    });
  } catch (error) {
    console.error('Link checker error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to check links' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const GET: APIRoute = async () => {
  // Return usage instructions
  return new Response(JSON.stringify({
    usage: 'POST an array of URLs to check their status',
    example: {
      method: 'POST',
      body: {
        urls: [
          'https://example.com',
          'https://another-site.com/page'
        ]
      }
    },
    limits: {
      maxUrls: 50,
      timeout: '5 seconds per URL'
    }
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};