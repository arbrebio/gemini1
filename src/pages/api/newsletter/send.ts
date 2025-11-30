import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import * as sgMail from '@sendgrid/mail';
import { z } from 'zod';

// Email configuration
const ADMIN_EMAIL = 'farms@arbrebio.com'; // Ensure this is the correct email
const SENDER_NAME = 'Arbre Bio Africa';

// Validation schema for newsletter sending
const sendNewsletterSchema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  adminToken: z.string().min(10, 'Admin token is required')
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Validate input data
    const validatedData = sendNewsletterSchema.parse(data);

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

    // Get all confirmed subscribers
    const { data: subscribers, error } = await supabase
      .from('newsletter_subscribers')
      .select('email, full_name')
      .eq('confirmed', true)
      .eq('status', 'active');

    if (error) throw error;

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No confirmed subscribers found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if SendGrid is properly configured
    const sendgridKey = import.meta.env.SENDGRID_API_KEY;
    if (!sendgridKey || sendgridKey.includes('your_') || sendgridKey.includes('placeholder')) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email service is not configured'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize SendGrid
    sgMail.setApiKey(sendgridKey);

    // Send newsletter to all subscribers
    // In production, you should use batch sending or a queue for large subscriber lists
    const emailPromises = subscribers.map(subscriber => {
      return sgMail.send({
        to: subscriber.email,
        from: {
          email: ADMIN_EMAIL,
          name: SENDER_NAME
        },
        subject: validatedData.subject,
        html: createNewsletterHtml(validatedData.content, subscriber),
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true },
          subscriptionTracking: { enable: true }
        },
        customArgs: {
          newsletter_id: new Date().toISOString().split('T')[0]
        }
      });
    });

    // Also send a copy to the admin
    emailPromises.push(
      sgMail.send({
        to: ADMIN_EMAIL,
        from: {
          email: ADMIN_EMAIL,
          name: SENDER_NAME
        },
        subject: `[COPY] ${validatedData.subject}`,
        html: createNewsletterHtml(validatedData.content, { full_name: 'Admin', email: ADMIN_EMAIL }),
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true }
        }
      })
    );

    await Promise.all(emailPromises);

    return new Response(JSON.stringify({
      success: true,
      message: `Newsletter sent to ${subscribers.length} subscribers`,
      count: subscribers.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Send newsletter error:', error);

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

function createNewsletterHtml(content: string, subscriber: { full_name?: string, email: string }) {
  const unsubscribeUrl = `https://arbrebio.com/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Arbre Bio Africa Newsletter</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <header style="text-align: center; margin-bottom: 30px;">
          <img src="https://i.imgur.com/79cS79J.png" alt="Arbre Bio Africa" style="max-width: 200px;">
        </header>
        
        <main>
          ${content}
        </main>
        
        <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
          <p>This email was sent to ${subscriber.email}</p>
          <p>Arbre Bio Africa | Cocody Riviera 3, Jacque Prevert 2 | Abidjan, Côte d'Ivoire</p>
          <p>
            <a href="${unsubscribeUrl}" style="color: #666;">Unsubscribe</a> |
            <a href="https://arbrebio.ci/privacy" style="color: #666;">Privacy Policy</a>
          </p>
        </footer>
      </body>
    </html>
  `;
}