import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Expected meta tags for SEO
    const requiredMetaTags = [
      'title',
      'description',
      'canonical',
      'og:title',
      'og:description',
      'og:url',
      'og:image',
      'og:type',
      'twitter:card',
      'twitter:title',
      'twitter:description'
    ];
    
    // Check which tags are missing
    const missingTags = requiredMetaTags.filter(tag => !data.includes(tag));
    
    // Recommendations based on missing tags
    const recommendations = [];
    
    if (missingTags.includes('title')) {
      recommendations.push('Add a title tag with a descriptive, keyword-rich title');
    }
    
    if (missingTags.includes('description')) {
      recommendations.push('Add a meta description that summarizes the page content');
    }
    
    if (missingTags.includes('canonical')) {
      recommendations.push('Add a canonical URL to prevent duplicate content issues');
    }
    
    if (missingTags.some(tag => tag.startsWith('og:'))) {
      recommendations.push('Add missing Open Graph tags for better social media sharing');
    }
    
    if (missingTags.some(tag => tag.startsWith('twitter:'))) {
      recommendations.push('Add missing Twitter Card tags for better Twitter sharing');
    }
    
    return new Response(JSON.stringify({
      missingTags,
      recommendations,
      status: missingTags.length === 0 ? 'good' : 'needs improvement'
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