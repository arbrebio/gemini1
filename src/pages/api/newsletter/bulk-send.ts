import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import * as sgMail from '@sendgrid/mail';
import { z } from 'zod';

// Email configuration
const ADMIN_EMAIL = 'farms@arbrebio.com'; // Ensure this is the correct email
const SENDER_NAME = 'Arbre Bio Africa';

// Validation schema for bulk email sending
const bulkSendSchema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  adminToken: z.string().min(10, 'Admin token is required'),
  testMode: z.boolean().optional().default(false)
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Validate input data
    const validatedData = bulkSendSchema.parse(data);

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

    // If in test mode, only send to admin
    if (validatedData.testMode) {
      await sgMail.send({
        to: ADMIN_EMAIL,
        from: {
          email: ADMIN_EMAIL,
          name: SENDER_NAME
        },
        subject: `[TEST] ${validatedData.subject}`,
        html: createNewsletterHtml(validatedData.content, { full_name: 'Admin', email: ADMIN_EMAIL }),
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true }
        }
      });

      return new Response(JSON.stringify({
        success: true,
        message: 'Test email sent to admin',
        testMode: true
      }), {
        status: 200,
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

    // In a real production environment, you would use a queue system or batch sending
    // For this example, we'll send in small batches to avoid rate limits
    const batchSize = 50;
    const batches = [];

    for (let i = 0; i < subscribers.length; i += batchSize) {
      batches.push(subscribers.slice(i, i + batchSize));
    }

    // Send to each batch
    for (const batch of batches) {
      const personalizations = batch.map(subscriber => ({
        to: subscriber.email,
        substitutions: {
          '%recipient.name%': subscriber.full_name || 'Subscriber',
          '%recipient.email%': subscriber.email,
          '%unsubscribe_url%': `https://arbrebio.ci/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}`
        }
      }));

      await sgMail.send({
        personalizations,
        from: {
          email: ADMIN_EMAIL,
          name: SENDER_NAME
        },
        subject: validatedData.subject,
        html: createNewsletterHtml(validatedData.content, { full_name: '%recipient.name%', email: '%recipient.email%' }),
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true },
          subscriptionTracking: { enable: true }
        },
        customArgs: {
          newsletter_id: new Date().toISOString().split('T')[0]
        }
      });

      // Add a small delay between batches to avoid rate limits
      if (batches.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Also send a copy to the admin
    await sgMail.send({
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
    });

    return new Response(JSON.stringify({
      success: true,
      message: `Newsletter sent to ${subscribers.length} subscribers`,
      count: subscribers.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Bulk send error:', error);

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
          <p>Hello ${subscriber.full_name || 'there'},</p>
          
          ${content}
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="https://arbrebio.com/contact" style="background-color: #194642; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Contact Our Experts</a>
          </div>
        </main>
        
        <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
          <p>This email was sent to ${subscriber.email}</p>
          <p>Arbre Bio Africa | Cocody Riviera 3, Jacque Prevert 2 | Abidjan, Côte d'Ivoire</p>
          <p>
            <a href="${unsubscribeUrl}" style="color: #666;">Unsubscribe</a> |
            <a href="https://arbrebio.com/privacy" style="color: #666;">Privacy Policy</a>
          </p>
        </footer>
      </body>
    </html>
  `;
}