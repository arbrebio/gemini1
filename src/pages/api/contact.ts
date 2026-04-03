import type { APIRoute } from 'astro';
import * as sgMail from '@sendgrid/mail';
import { z } from 'zod';
import { sanitizeInput, globalRateLimiter } from '../../lib/securityHeaders';
import { createErrorResponse, createSuccessResponse, handleApiError } from '../../lib/errorHandling';
import { config } from '../../lib/config';

// Enhanced validation schema
const contactSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name too long')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'First name contains invalid characters'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Last name contains invalid characters'),
  email: z.string()
    .email('Please enter a valid email address')
    .max(100, 'Email address too long'),
  phone: z.string()
    .min(1, 'Phone number is required')
    .max(20, 'Phone number too long')
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Phone number contains invalid characters'),
  interest: z.string()
    .min(1, 'Please select an area of interest')
    .max(100, 'Interest selection too long'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message too long')
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

    // Validate and sanitize input
    const validationResult = contactSchema.safeParse(data);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return createErrorResponse(
        firstError.message,
        400,
        'VALIDATION_ERROR'
      );
    }

    const { firstName, lastName, email, phone, interest, message } = validationResult.data;

    // Additional sanitization
    const sanitizedData = {
      firstName: sanitizeInput(firstName, 50),
      lastName: sanitizeInput(lastName, 50),
      email: sanitizeInput(email, 100),
      phone: sanitizeInput(phone, 20),
      interest: sanitizeInput(interest, 100),
      message: sanitizeInput(message, 1000)
    };

    // Check if SendGrid is properly configured
    const sendgridKey = import.meta.env.SENDGRID_API_KEY;
    if (!sendgridKey) {
      return createErrorResponse(
        'Email service is not configured. Please contact support directly.',
        503,
        'SERVICE_UNAVAILABLE'
      );
    }

    // Initialize SendGrid
    sgMail.setApiKey(sendgridKey);

    const adminEmail = config.contact.adminEmail;

    // Send email
    await sgMail.send({
      to: adminEmail,
      from: {
        email: adminEmail,
        name: 'Arbre Bio Contact Form'
      },
      replyTo: sanitizedData.email,
      subject: `New Contact Form Submission: ${sanitizedData.interest}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>New Contact Form Submission</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h1 style="color: #194642;">New Contact Form Submission</h1>
            
            <h2 style="color: #666;">Contact Information</h2>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Name:</strong> ${sanitizedData.firstName} ${sanitizedData.lastName}</li>
              <li><strong>Email:</strong> ${sanitizedData.email}</li>
              <li><strong>Phone:</strong> ${sanitizedData.phone}</li>
              <li><strong>Interest:</strong> ${sanitizedData.interest}</li>
            </ul>

            <h2 style="color: #666;">Message</h2>
            <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${sanitizedData.message}</p>

            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="color: #666; font-size: 12px;">
              This email was sent from the contact form on arbrebio.com<br>
              Timestamp: ${new Date().toISOString()}<br>
              IP: ${clientIP}
            </p>
          </body>
        </html>
      `,
      trackingSettings: {
        clickTracking: { enable: false },
        openTracking: { enable: true }
      }
    });

    // Send auto-reply to the customer
    await sgMail.send({
      to: sanitizedData.email,
      from: {
        email: adminEmail,
        name: 'Arbre Bio Africa'
      },
      subject: 'Thank you for contacting Arbre Bio Africa',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Thank you for contacting Arbre Bio Africa</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h1 style="color: #194642;">Thank You for Contacting Arbre Bio Africa</h1>
            
            <p>Dear ${sanitizedData.firstName} ${sanitizedData.lastName},</p>
            
            <p>Thank you for reaching out to us. This email confirms that we have received your message regarding ${sanitizedData.interest.toLowerCase()}.</p>
            
            <p>Our team will review your inquiry and get back to you within 24-48 business hours.</p>
            
            <p>For immediate assistance, you can:</p>
            <ul>
              <li>Call us at: +225 21 21 80 69 50</li>
              <li>WhatsApp: +225 07 99 29 56 43</li>
            </ul>
            
            <p>Best regards,<br>The Arbre Bio Africa Team</p>
            
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="color: #666; font-size: 12px;">
              Arbre Bio Africa | Cocody Riviera 3, Jacque Prevert 2 | Abidjan, Côte d'Ivoire<br>
              This is an automated response. Please do not reply to this email.
            </p>
          </body>
        </html>
      `,
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true }
      }
    });

    return createSuccessResponse(
      null,
      'Message sent successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
};