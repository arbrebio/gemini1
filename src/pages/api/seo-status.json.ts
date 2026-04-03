import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    return new Response('Site URL not found', { status: 500 });
  }

  try {
    // Get all blog posts
    const blogPosts = await getCollection('blog');
    
    // Count posts by category
    const categoryCounts = blogPosts.reduce((acc, post) => {
      const category = post.data.category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Get featured posts
    const featuredPosts = blogPosts.filter(post => post.data.featured);
    
    // Calculate average word count
    const wordCounts = blogPosts.map(post => {
      // This is a rough estimate since we don't have the rendered content
      return post.data.description.split(/\s+/).length;
    });
    
    const avgWordCount = wordCounts.length 
      ? wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length 
      : 0;
    
    // Generate SEO status report
    const seoStatus = {
      totalPages: blogPosts.length,
      categoryCounts,
      featuredPosts: featuredPosts.length,
      avgWordCount: Math.round(avgWordCount),
      lastUpdated: new Date().toISOString(),
      siteUrl: site.toString(),
      hasSitemap: true,
      hasRobotsTxt: true,
    };
    
    return new Response(JSON.stringify(seoStatus), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=3600'
      }
    });
  } catch (error) {
    console.error('Error generating SEO status:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate SEO status' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};