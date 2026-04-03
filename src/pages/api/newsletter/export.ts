import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import * as sgMail from '@sendgrid/mail';

// Email configuration
const ADMIN_EMAIL = 'farms@arbrebio.com'; // Ensure this is the correct email
const SENDER_NAME = 'Arbre Bio Africa';

// This endpoint is for admin use only
export const GET: APIRoute = async ({ request }) => {
  try {
    // Basic security check - this should be improved in production
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    // Simple token validation - in production, use a proper authentication system
    if (!token || token !== 'admin-export-token') {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get all confirmed subscribers
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('confirmed', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      return new Response('No subscribers found', { status: 404 });
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
  } catch (error) {
    console.error('Export error:', error);
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