import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import * as sgMail from '@sendgrid/mail';

import { config } from '../../../lib/config';

// Email configuration
const ADMIN_EMAIL = config.contact.adminEmail;
const SENDER_NAME = config.contact.senderName;

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid confirmation link'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .update({
        confirmed: true,
        status: 'active',
        confirmation_token: null
      })
      .eq('confirmation_token', token)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid or expired confirmation link'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Send welcome email only if SendGrid is properly configured
    const sendgridKey = import.meta.env.SENDGRID_API_KEY;
    if (sendgridKey && sendgridKey !== 'your_sendgrid_api_key') {
      sgMail.setApiKey(sendgridKey);

      await sgMail.send({
        to: [data.email, ADMIN_EMAIL],
        from: {
          email: ADMIN_EMAIL,
          name: SENDER_NAME
        },
        subject: 'Welcome to Arbre Bio Africa\'s Community',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Welcome to Arbre Bio Africa</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <header style="text-align: center; margin-bottom: 30px;">
                <img src="https://i.imgur.com/79cS79J.png" alt="Arbre Bio Africa" style="max-width: 200px;">
              </header>
              
              <main>
                <h1 style="color: #194642; margin-bottom: 20px;">Welcome to Arbre Bio Africa's Community!</h1>
                
                <p>Dear ${data.full_name || 'Valued Member'},</p>
                
                <p>Thank you for confirming your subscription to our newsletter. We're excited to have you join our community of forward-thinking agricultural professionals.</p>
                
                <p>At Arbre Bio Africa, we're committed to transforming African agriculture through innovative solutions and sustainable practices. As a subscriber, you'll receive regular updates about:</p>
                
                <ul style="margin-bottom: 20px;">
                  <li>Latest agricultural technologies and best practices</li>
                  <li>Success stories from farms across Africa</li>
                  <li>Tips for improving crop yields and farm efficiency</li>
                  <li>Industry news and insights</li>
                  <li>Exclusive offers and early access to new products</li>
                </ul>
                
                <p>We're here to support your agricultural journey. If you have any questions or need assistance, don't hesitate to reach out to us at <a href="mailto:farms@arbrebio.com" style="color: #194642;">farms@arbrebio.com</a></p>
                
                <div style="margin: 30px 0; text-align: center;">
                  <a href="https://arbrebio.com/contact" style="background-color: #194642; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Contact Our Experts</a>
                </div>
              </main>
              
              <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                <p>This email was sent to ${data.email}</p>
                <p>Arbre Bio Africa | Cocody Riviera 3, Jacque Prevert 2 | Abidjan, Côte d'Ivoire</p>
                <p>
                  <a href="https://arbrebio.com/newsletter/unsubscribe?email=${encodeURIComponent(data.email)}&token=${token}" style="color: #666;">Unsubscribe</a> |
                  <a href="https://arbrebio.com/privacy" style="color: #666;">Privacy Policy</a>
                </p>
              </footer>
            </body>
          </html>
        `,
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true },
          subscriptionTracking: { enable: true }
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Subscription confirmed successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Confirmation error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'An error occurred'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};