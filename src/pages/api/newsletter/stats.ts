import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

// Email configuration
const ADMIN_EMAIL = 'farms@arbrebio.com'; // Ensure this is the correct email

// This endpoint is for admin use only
export const GET: APIRoute = async ({ request }) => {
  try {
    // Basic security check - this should be improved in production
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    // Simple token validation - in production, use a proper authentication system
    if (!token || token !== 'admin-stats-token') {
      return new Response('Unauthorized', { status: 401 });
    }
    
    // Get total subscribers count
    const { count: totalCount, error: totalError } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true });
    
    if (totalError) throw totalError;
    
    // Get confirmed subscribers count
    const { count: confirmedCount, error: confirmedError } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('confirmed', true)
      .eq('status', 'active');
    
    if (confirmedError) throw confirmedError;
    
    // Get unsubscribed count
    const { count: unsubscribedCount, error: unsubscribedError } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'unsubscribed');
    
    if (unsubscribedError) throw unsubscribedError;
    
    // Get pending count
    const { count: pendingCount, error: pendingError } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('confirmed', false)
      .eq('status', 'pending');
    
    if (pendingError) throw pendingError;
    
    // Get sources breakdown
    const { data: sourcesData, error: sourcesError } = await supabase
      .from('newsletter_subscribers')
      .select('source')
      .eq('confirmed', true)
      .eq('status', 'active');
    
    if (sourcesError) throw sourcesError;
    
    // Count by source
    const sourceBreakdown = sourcesData.reduce((acc, item) => {
      const source = item.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Get recent subscribers
    const { data: recentSubscribers, error: recentError } = await supabase
      .from('newsletter_subscribers')
      .select('email, full_name, created_at, source')
      .eq('confirmed', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentError) throw recentError;
    
    // Compile stats
    const stats = {
      total: totalCount,
      confirmed: confirmedCount,
      unsubscribed: unsubscribedCount,
      pending: pendingCount,
      conversionRate: totalCount ? Math.round(((confirmedCount || 0) / totalCount) * 100) : 0,
      sourceBreakdown,
      recentSubscribers,
      lastUpdated: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=300' // Cache for 5 minutes
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};