import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    if (!Array.isArray(data)) {
      return new Response(JSON.stringify({ 
        error: 'Expected an array of image data'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const results = data.map(image => {
      const issues = [];
      
      // Check for alt text
      if (!image.alt || image.alt.trim() === '') {
        issues.push('Missing alt text');
      } else if (image.alt.length > 125) {
        issues.push('Alt text too long (over 125 characters)');
      }
      
      // Check for width and height attributes
      if (!image.width || !image.height) {
        issues.push('Missing width or height attributes');
      }
      
      // Check for lazy loading
      if (!image.loading) {
        issues.push('Missing loading attribute');
      }
      
      // Check for responsive images
      if (!image.srcset && !image.sizes) {
        issues.push('Not using responsive image techniques (srcset/sizes)');
      }
      
      // Check for image format
      const imageUrl = image.src || '';
      if (imageUrl.endsWith('.jpg') || imageUrl.endsWith('.jpeg') || imageUrl.endsWith('.png')) {
        issues.push('Consider using WebP or AVIF for better compression');
      }
      
      return {
        src: image.src,
        issues,
        status: issues.length === 0 ? 'good' : 'needs improvement'
      };
    });
    
    return new Response(JSON.stringify({
      results,
      summary: {
        total: results.length,
        good: results.filter(r => r.status === 'good').length,
        needsImprovement: results.filter(r => r.status === 'needs improvement').length
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to parse JSON data'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};