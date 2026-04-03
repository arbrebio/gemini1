import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import * as sgMail from '@sendgrid/mail';

// Email configuration
const ADMIN_EMAIL = 'farms@arbrebio.com';
const SENDER_NAME = 'Arbre Bio Africa';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    const token = url.searchParams.get('token');

    if (!email || !token) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid unsubscribe link'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .update({ status: 'unsubscribed' })
      .eq('email', email)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid unsubscribe request'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Notify admin about unsubscription
    await notifyAdminAboutUnsubscribe(data);

    return new Response(JSON.stringify({
      success: true,
      message: 'Successfully unsubscribed'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'An error occurred'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

async function notifyAdminAboutUnsubscribe(user: any) {
  const sendgridKey = import.meta.env.SENDGRID_API_KEY;
  if (!sendgridKey || sendgridKey === 'your_sendgrid_api_key') {
    console.warn('SendGrid API key is not properly configured');
    return;
  }

  sgMail.setApiKey(sendgridKey);

  await sgMail.send({
    to: ADMIN_EMAIL,
    from: {
      email: ADMIN_EMAIL,
      name: SENDER_NAME
    },
    subject: 'Newsletter Unsubscription',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Newsletter Unsubscription</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <header style="text-align: center; margin-bottom: 30px;">
            <img src="https://i.imgur.com/79cS79J.png" alt="Arbre Bio Africa" style="max-width: 200px;">
          </header>
          
          <main>
            <h1 style="color: #194642; margin-bottom: 20px;">Newsletter Unsubscription</h1>
            
            <p>A user has unsubscribed from the Arbre Bio Africa newsletter:</p>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Name:</strong> ${user.full_name || 'Not provided'}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </main>
          
          <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>This is an automated notification from your website.</p>
          </footer>
        </body>
      </html>
    `
  });
}