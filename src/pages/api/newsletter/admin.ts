import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import * as sgMail from '@sendgrid/mail';
import { z } from 'zod';

// Email configuration
const ADMIN_EMAIL = 'farms@arbrebio.com'; // Ensure this is the correct email
const SENDER_NAME = 'Arbre Bio Africa';

// Validation schema for admin actions
const adminActionSchema = z.object({
  action: z.enum(['list', 'delete', 'export', 'stats']),
  adminToken: z.string().min(10, 'Admin token is required'),
  email: z.string().email().optional(),
  id: z.string().uuid().optional()
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Validate input data
    const validatedData = adminActionSchema.parse(data);

    // Verify admin token - in production, use a proper authentication system
    if (validatedData.adminToken !== 'your-secure-admin-token') {
      return new Response(JSON.stringify({
        success: false,
        message: 'Unauthorized'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle different admin actions
    switch (validatedData.action) {
      case 'list':
        return await handleListAction();
      case 'delete':
        return await handleDeleteAction(validatedData.email, validatedData.id);
      case 'export':
        return await handleExportAction();
      case 'stats':
        return await handleStatsAction();
      default:
        return new Response(JSON.stringify({
          success: false,
          message: 'Invalid action'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Admin action error:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return new Response(JSON.stringify({
        success: false,
        message: firstError.message
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

async function handleListAction() {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return new Response(JSON.stringify({
    success: true,
    data
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleDeleteAction(email?: string, id?: string) {
  if (!email && !id) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Either email or id must be provided'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let query = supabase.from('newsletter_subscribers').delete();

  if (id) {
    query = query.eq('id', id);
  } else if (email) {
    query = query.eq('email', email);
  }

  const { error } = await query;

  if (error) throw error;

  return new Response(JSON.stringify({
    success: true,
    message: 'Subscriber deleted successfully'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleExportAction() {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .eq('confirmed', true)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;

  if (!data || data.length === 0) {
    return new Response(JSON.stringify({
      success: false,
      message: 'No subscribers found'
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Format data for CSV
  const csvHeader = 'Email,Full Name,Source,Created At\n';
  const csvRows = data.map(subscriber => {
    return `"${subscriber.email}","${subscriber.full_name || ''}","${subscriber.source}","${subscriber.created_at}"`;
  });
  const csvContent = csvHeader + csvRows.join('\n');

  // Send email with CSV attachment
  await sendExportEmail(csvContent, data.length);

  return new Response(JSON.stringify({
    success: true,
    message: `Exported ${data.length} subscribers and sent to ${ADMIN_EMAIL}`,
    count: data.length
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

async function handleStatsAction() {
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

  // Compile stats
  const stats = {
    total: totalCount,
    confirmed: confirmedCount,
    unsubscribed: unsubscribedCount,
    pending: pendingCount,
    conversionRate: totalCount ? Math.round(((confirmedCount || 0) / totalCount) * 100) : 0,
    sourceBreakdown,
    lastUpdated: new Date().toISOString()
  };

  return new Response(JSON.stringify({
    success: true,
    stats
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'max-age=300' // Cache for 5 minutes
    }
  });
}

async function sendExportEmail(csvContent: string, subscriberCount: number) {
  const sendgridKey = import.meta.env.SENDGRID_API_KEY;
  if (!sendgridKey || sendgridKey.includes('your_') || sendgridKey.includes('placeholder')) {
    console.warn('SendGrid API key is not properly configured');
    return;
  }

  sgMail.setApiKey(sendgridKey);

  const date = new Date().toISOString().split('T')[0];

  await sgMail.send({
    to: ADMIN_EMAIL,
    from: {
      email: ADMIN_EMAIL,
      name: SENDER_NAME
    },
    subject: `Newsletter Subscribers Export - ${date}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Newsletter Subscribers Export</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <header style="text-align: center; margin-bottom: 30px;">
            <img src="https://i.imgur.com/79cS79J.png" alt="Arbre Bio Africa" style="max-width: 200px;">
          </header>
          
          <main>
            <h1 style="color: #194642; margin-bottom: 20px;">Newsletter Subscribers Export</h1>
            
            <p>Hello,</p>
            
            <p>Attached is the requested export of all active newsletter subscribers. The file contains ${subscriberCount} subscribers.</p>
            
            <p>Export date: ${new Date().toLocaleString()}</p>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Summary:</strong></p>
              <p>Total subscribers: ${subscriberCount}</p>
              <p>Status: Active and confirmed</p>
            </div>
          </main>
          
          <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>This is an automated export from your website.</p>
          </footer>
        </body>
      </html>
    `,
    attachments: [
      {
        content: Buffer.from(csvContent).toString('base64'),
        filename: `newsletter-subscribers-${date}.csv`,
        type: 'text/csv',
        disposition: 'attachment'
      }
    ]
  });
}