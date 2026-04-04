export const prerender = false;

import type { APIRoute } from 'astro';
import { supabaseAdmin as supabase } from '../../../lib/supabase';
import { z } from 'zod';
import { sanitizeInput, globalRateLimiter } from '../../../lib/securityHeaders';
import { createErrorResponse, createSuccessResponse, handleApiError } from '../../../lib/errorHandling';

// Email configuration
const ADMIN_EMAIL = 'farms@arbrebio.com';
const SENDER_NAME = 'Arbre Bio Africa';

// Enhanced validation schema
const subscribeSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .max(100, 'Email address too long')
    .toLowerCase(),
  full_name: z.string()
    .max(100, 'Name too long')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]*$/, 'Name contains invalid characters')
    .optional(),
  source: z.string()
    .max(50, 'Source too long')
    .default('website'),
  consent: z.boolean().refine(val => val === true, {
    message: 'You must accept the privacy policy'
  })
});

export const POST: APIRoute = async ({ request }) => {
  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown';

    if (!globalRateLimiter.isAllowed(clientIP)) {
      return createErrorResponse(
        'Too many requests. Please try again later.',
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }

    const data = await request.json();

    // Validate input data
    const validatedData = subscribeSchema.parse(data);

    // Additional sanitization
    const sanitizedData = {
      email: sanitizeInput(validatedData.email, 100),
      full_name: validatedData.full_name ? sanitizeInput(validatedData.full_name, 100) : undefined,
      source: sanitizeInput(validatedData.source, 50)
    };

    // Check if email already exists
    const { data: existingUser, error: lookupError } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, status, confirmed')
      .eq('email', sanitizedData.email)
      .single();

    if (lookupError && lookupError.code !== 'PGRST116') {
      throw new Error('Error checking existing subscription');
    }

    // If user exists and is already confirmed, return success
    if (existingUser && existingUser.confirmed && existingUser.status === 'active') {
      return createSuccessResponse(
        null,
        'You are already subscribed to our newsletter'
      );
    }

    // If user exists but is not confirmed or is unsubscribed, update their record
    if (existingUser) {
      const { data: updatedUser, error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({
          full_name: sanitizedData.full_name,
          source: sanitizedData.source,
          status: 'pending',
          confirmation_token: null,
          confirmed: false
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateError) throw updateError;

      await sendConfirmationEmail(updatedUser);

      return createSuccessResponse(
        null,
        'Please check your email to confirm your subscription'
      );
    }

    // Create new subscriber
    const { data: newUser, error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert([{
        full_name: sanitizedData.full_name,
        email: sanitizedData.email,
        source: sanitizedData.source
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    await sendConfirmationEmail(newUser);
    await notifyAdmin(newUser);

    return createSuccessResponse(
      null,
      'Please check your email to confirm your subscription'
    );

  } catch (error) {
    return handleApiError(error);
  }
};

async function sendEmail(to: string | string[], subject: string, html: string): Promise<void> {
  const resendKey = import.meta.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn('Resend API key is not configured');
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: `${SENDER_NAME} <farms@newsletter.arbrebio.com>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html
    })
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Resend error:', res.status, text);
  }
}

async function sendConfirmationEmail(user: any) {
  const confirmationUrl = `https://arbrebio.com/newsletter/confirm?token=${user.confirmation_token}`;

  await sendEmail(
    user.email,
    'Confirm Your Subscription to Arbre Bio Africa',
    `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <header style="text-align: center; margin-bottom: 30px;">
            <img src="https://i.imgur.com/79cS79J.png" alt="Arbre Bio Africa" style="max-width: 200px;">
          </header>
          <main>
            <h1 style="color: #194642; margin-bottom: 20px;">Confirm Your Subscription</h1>
            <p>Hello ${user.full_name || 'there'},</p>
            <p>Thank you for subscribing to the Arbre Bio Africa newsletter. Please confirm your email address:</p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="${confirmationUrl}" style="background-color: #194642; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Confirm Subscription</a>
            </div>
            <p>Or copy this link: <span style="word-break: break-all; background: #f5f5f5; padding: 4px 8px; border-radius: 4px;">${confirmationUrl}</span></p>
            <p>If you didn't request this, you can safely ignore this email.</p>
          </main>
          <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>Arbre Bio Africa | Cocody Riviera 3, Jacque Prevert 2 | Abidjan, Côte d'Ivoire</p>
          </footer>
        </body>
      </html>
    `
  );
}

async function notifyAdmin(user: any) {
  await sendEmail(
    ADMIN_EMAIL,
    'New Newsletter Subscriber',
    `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #194642;">New Newsletter Subscriber</h1>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Name:</strong> ${user.full_name || 'Not provided'}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Source:</strong> ${user.source}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Status:</strong> Pending confirmation</p>
          </div>
        </body>
      </html>
    `
  );
}
