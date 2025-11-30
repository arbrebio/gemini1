import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Basic validation of structured data
    if (!data || typeof data !== 'object') {
      return new Response(JSON.stringify({ 
        valid: false, 
        errors: ['Invalid JSON-LD data'] 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const errors = [];
    
    // Check for required properties based on @type
    if (data['@context'] !== 'https://schema.org') {
      errors.push('Missing or invalid @context property');
    }
    
    if (!data['@type']) {
      errors.push('Missing @type property');
    }
    
    // Type-specific validation
    switch (data['@type']) {
      case 'Product':
        if (!data.name) errors.push('Product is missing name property');
        if (!data.description) errors.push('Product is missing description property');
        break;
        
      case 'BlogPosting':
        if (!data.headline) errors.push('BlogPosting is missing headline property');
        if (!data.datePublished) errors.push('BlogPosting is missing datePublished property');
        if (!data.author) errors.push('BlogPosting is missing author property');
        break;
        
      case 'Organization':
        if (!data.name) errors.push('Organization is missing name property');
        if (!data.url) errors.push('Organization is missing url property');
        break;
        
      case 'BreadcrumbList':
        if (!data.itemListElement || !Array.isArray(data.itemListElement)) {
          errors.push('BreadcrumbList is missing itemListElement array');
        }
        break;
    }
    
    return new Response(JSON.stringify({ 
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    }), {
      status: errors.length === 0 ? 200 : 400,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      valid: false, 
      errors: ['Failed to parse JSON data'] 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};