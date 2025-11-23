import type { APIRoute } from 'astro';
import * as sgMail from '@sendgrid/mail';
import { z } from 'zod';
import { config } from '../../lib/config';
import { sanitizeInput, globalRateLimiter } from '../../lib/securityHeaders';
import { createErrorResponse, createSuccessResponse, handleApiError } from '../../lib/errorHandling';

// Validation schema for quote requests
const quoteSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(1, 'Phone number is required').max(20, 'Phone number too long'),
  location: z.string().min(1, 'Location is required').max(100, 'Location too long').optional(),
  size: z.number().min(1, 'Size must be at least 1').max(100000, 'Size too large').optional(),
  timeline: z.string().optional(),
  requirements: z.string().max(500, 'Requirements too long').optional(),
  productType: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1').optional(),
  quoteType: z.enum(['greenhouse', 'irrigation', 'substrate', 'general']).default('general')
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
    const validationResult = quoteSchema.safeParse(data);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return createErrorResponse(
        firstError.message,
        400,
        'VALIDATION_ERROR'
      );
    }

    const validatedData = validationResult.data;

    // Sanitize input data
    const sanitizedData = {
      ...validatedData,
      firstName: sanitizeInput(validatedData.firstName, 50),
      lastName: sanitizeInput(validatedData.lastName, 50),
      email: sanitizeInput(validatedData.email, 100),
      phone: sanitizeInput(validatedData.phone, 20),
      location: validatedData.location ? sanitizeInput(validatedData.location, 100) : undefined,
      timeline: validatedData.timeline ? sanitizeInput(validatedData.timeline, 100) : undefined,
      requirements: validatedData.requirements ? sanitizeInput(validatedData.requirements, 500) : undefined,
      productType: validatedData.productType ? sanitizeInput(validatedData.productType, 100) : undefined
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
    const senderName = config.contact.senderName;

    // Create email content based on quote type
    const emailSubject = `New Quote Request: ${sanitizedData.quoteType.charAt(0).toUpperCase() + sanitizedData.quoteType.slice(1)}`;

    let emailContent = `
      <h1 style="color: #194642;">New Quote Request</h1>
      
      <h2 style="color: #666;">Contact Information</h2>
      <ul style="list-style: none; padding: 0;">
        <li><strong>Name:</strong> ${sanitizedData.firstName} ${sanitizedData.lastName}</li>
        <li><strong>Email:</strong> ${sanitizedData.email}</li>
        <li><strong>Phone:</strong> ${sanitizedData.phone}</li>
        <li><strong>Quote Type:</strong> ${sanitizedData.quoteType}</li>
      </ul>
    `;

    // Add specific fields based on quote type
    if (sanitizedData.quoteType === 'greenhouse') {
      emailContent += `
        <h2 style="color: #666;">Project Details</h2>
        <ul style="list-style: none; padding: 0;">
          ${sanitizedData.location ? `<li><strong>Location:</strong> ${sanitizedData.location}</li>` : ''}
          ${sanitizedData.size ? `<li><strong>Size:</strong> ${sanitizedData.size} m²</li>` : ''}
          ${sanitizedData.timeline ? `<li><strong>Timeline:</strong> ${sanitizedData.timeline}</li>` : ''}
        </ul>
      `;
    }

    if (sanitizedData.quoteType === 'substrate') {
      emailContent += `
        <h2 style="color: #666;">Product Details</h2>
        <ul style="list-style: none; padding: 0;">
          ${sanitizedData.productType ? `<li><strong>Product Type:</strong> ${sanitizedData.productType}</li>` : ''}
          ${sanitizedData.quantity ? `<li><strong>Quantity:</strong> ${sanitizedData.quantity} metric tons</li>` : ''}
        </ul>
      `;
    }

    if (sanitizedData.requirements) {
      emailContent += `
        <h2 style="color: #666;">Additional Requirements</h2>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${sanitizedData.requirements}</p>
      `;
    }

    emailContent += `
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">
        This quote request was sent from ${config.site.url}<br>
        Timestamp: ${new Date().toLocaleString()}<br>
        IP: ${clientIP}
      </p>
    `;

    // Send email to admin
    await sgMail.send({
      to: adminEmail,
      from: {
        email: adminEmail,
        name: senderName
      },
      replyTo: sanitizedData.email,
      subject: emailSubject,
      html: emailContent,
      trackingSettings: {
        clickTracking: { enable: false },
        openTracking: { enable: true }
      }
    });

    // Send auto-reply to customer
    await sgMail.send({
      to: sanitizedData.email,
      from: {
        email: adminEmail,
        name: senderName
      },
      subject: 'Thank you for your quote request - Arbre Bio Africa',
      html: `
        <h1 style="color: #194642;">Thank You for Your Quote Request</h1>
        
        <p>Dear ${sanitizedData.firstName} ${sanitizedData.lastName},</p>
        
        <p>Thank you for your interest in our ${sanitizedData.quoteType} solutions. We have received your quote request and our team will review it carefully.</p>
        
        <p>You can expect to hear from us within 24-48 business hours with a detailed proposal.</p>
        
        <p>For immediate assistance, you can:</p>
        <ul>
          <li>Call us at: ${config.contact.offices[0].phone}</li>
          <li>WhatsApp: ${config.contact.whatsappNumber}</li>
          <li>Email: ${adminEmail}</li>
        </ul>
        
        <p>Best regards,<br>The ${senderName} Team</p>
      `,
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true }
      }
    });

    return createSuccessResponse(
      null,
      'Quote request sent successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
};