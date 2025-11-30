import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import * as sgMail from '@sendgrid/mail';
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
          confirmation_token: null, // This will generate a new token via the default value
          confirmed: false
        })
        .eq('id', existingUser.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      // Send confirmation email
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
    
    // Send confirmation email
    await sendConfirmationEmail(newUser);
    
    // Notify admin about new subscriber
    await notifyAdmin(newUser);
    
    return createSuccessResponse(
      null,
      'Please check your email to confirm your subscription'
    );
    
  } catch (error) {
    return handleApiError(error);
  }
};

async function sendConfirmationEmail(user: any) {
  const sendgridKey = import.meta.env.SENDGRID_API_KEY;
  if (!sendgridKey) {
    console.warn('SendGrid API key is not properly configured');
    return;
  }
  
  sgMail.setApiKey(sendgridKey);
  
  const confirmationUrl = `https://arbrebio.com/newsletter/confirm?token=${user.confirmation_token}`;
  
  await sgMail.send({
    to: user.email, // Send confirmation to subscriber
    from: {
      email: ADMIN_EMAIL,
      name: SENDER_NAME
    },
    subject: 'Confirm Your Subscription to Arbre Bio Africa',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Confirm Your Subscription</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <header style="text-align: center; margin-bottom: 30px;">
            <img src="https://i.imgur.com/79cS79J.png" alt="Arbre Bio Africa" style="max-width: 200px;">
          </header>
          
          <main>
            <h1 style="color: #194642; margin-bottom: 20px;">Confirm Your Subscription</h1>
            
            <p>Hello ${user.full_name || 'there'},</p>
            
            <p>Thank you for subscribing to the Arbre Bio Africa newsletter. To complete your subscription, please confirm your email address by clicking the button below:</p>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="${confirmationUrl}" style="background-color: #194642; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Confirm Subscription</a>
            </div>
            
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">${confirmationUrl}</p>
            
            <p>If you didn't request this subscription, you can safely ignore this email.</p>
          </main>
          
          <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>Arbre Bio Africa | Cocody Riviera 3, Jacque Prevert 2 | Abidjan, Côte d'Ivoire</p>
            <p>This email was sent to ${user.email}</p>
          </footer>
        </body>
      </html>
    `,
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true }
    }
  });
}

async function notifyAdmin(user: any) {
  const sendgridKey = import.meta.env.SENDGRID_API_KEY;
  if (!sendgridKey) {
    console.warn('SendGrid API key is not properly configured');
    return;
  }
  
  sgMail.setApiKey(sendgridKey);
  
  await sgMail.send({
    to: ADMIN_EMAIL, // Send notification to admin
    from: {
      email: ADMIN_EMAIL,
      name: SENDER_NAME
    },
    subject: 'New Newsletter Subscriber',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>New Newsletter Subscriber</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <header style="text-align: center; margin-bottom: 30px;">
            <img src="https://i.imgur.com/79cS79J.png" alt="Arbre Bio Africa" style="max-width: 200px;">
          </header>
          
          <main>
            <h1 style="color: #194642; margin-bottom: 20px;">New Newsletter Subscriber</h1>
            
            <p>A new user has subscribed to the Arbre Bio Africa newsletter:</p>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Name:</strong> ${user.full_name || 'Not provided'}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Source:</strong> ${user.source}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Status:</strong> Pending confirmation</p>
            </div>
            
            <p>The subscriber has been sent a confirmation email and will be added to the active list once they confirm.</p>
          </main>
          
          <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>This is an automated notification from your website.</p>
          </footer>
        </body>
      </html>
    `
  });
}