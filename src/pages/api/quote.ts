import type { APIRoute } from 'astro';
import * as sgMail from '@sendgrid/mail';
import { z } from 'zod';
import { config } from '../../lib/config';

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
    const data = await request.json();

    // Validate input data
    const validationResult = quoteSchema.safeParse(data);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return new Response(JSON.stringify({ 
        success: false,
        message: firstError.message 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const validatedData = validationResult.data;

    // Check if SendGrid is properly configured
    const sendgridKey = import.meta.env.SENDGRID_API_KEY;
    if (!sendgridKey) {
      console.error('SendGrid API key is not properly configured');
      return new Response(JSON.stringify({ 
        success: false,
        message: 'Email service is not configured. Please contact support directly.' 
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize SendGrid
    sgMail.setApiKey(sendgridKey);
    
    const adminEmail = config.contact.adminEmail;
    const senderName = config.contact.senderName;

    // Create email content based on quote type
    const emailSubject = `New Quote Request: ${validatedData.quoteType.charAt(0).toUpperCase() + validatedData.quoteType.slice(1)}`;
    
    let emailContent = `
      <h1 style="color: #194642;">New Quote Request</h1>
      
      <h2 style="color: #666;">Contact Information</h2>
      <ul style="list-style: none; padding: 0;">
        <li><strong>Name:</strong> ${validatedData.firstName} ${validatedData.lastName}</li>
        <li><strong>Email:</strong> ${validatedData.email}</li>
        <li><strong>Phone:</strong> ${validatedData.phone}</li>
        <li><strong>Quote Type:</strong> ${validatedData.quoteType}</li>
      </ul>
    `;

    // Add specific fields based on quote type
    if (validatedData.quoteType === 'greenhouse') {
      emailContent += `
        <h2 style="color: #666;">Project Details</h2>
        <ul style="list-style: none; padding: 0;">
          ${validatedData.location ? `<li><strong>Location:</strong> ${validatedData.location}</li>` : ''}
          ${validatedData.size ? `<li><strong>Size:</strong> ${validatedData.size} m²</li>` : ''}
          ${validatedData.timeline ? `<li><strong>Timeline:</strong> ${validatedData.timeline}</li>` : ''}
        </ul>
      `;
    }

    if (validatedData.quoteType === 'substrate') {
      emailContent += `
        <h2 style="color: #666;">Product Details</h2>
        <ul style="list-style: none; padding: 0;">
          ${validatedData.productType ? `<li><strong>Product Type:</strong> ${validatedData.productType}</li>` : ''}
          ${validatedData.quantity ? `<li><strong>Quantity:</strong> ${validatedData.quantity} metric tons</li>` : ''}
        </ul>
      `;
    }

    if (validatedData.requirements) {
      emailContent += `
        <h2 style="color: #666;">Additional Requirements</h2>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${validatedData.requirements}</p>
        `;
    }

    emailContent += `
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">
        This quote request was sent from ${senderName}<br>
        Timestamp: ${new Date().toLocaleString()}
      </p>
    `;

    // Send email to admin
    await sgMail.send({
      to: adminEmail,
      from: {
        email: adminEmail,
        name: senderName
      },
      replyTo: validatedData.email,
      subject: emailSubject,
      html: emailContent,
      trackingSettings: {
        clickTracking: { enable: false },
        openTracking: { enable: true }
      }
    });

    // Send auto-reply to customer
    await sgMail.send({
      to: validatedData.email,
      from: {
        email: adminEmail,
        name: senderName
      },
      subject: 'Thank you for your quote request - Arbre Bio Africa',
      html: `
        <h1 style="color: #194642;">Thank You for Your Quote Request</h1>
        
        <p>Dear ${validatedData.firstName} ${validatedData.lastName},</p>
        
        <p>Thank you for your interest in our ${validatedData.quoteType} solutions. We have received your quote request and our team will review it carefully.</p>
        
        <p>You can expect to hear from us within 24-48 business hours with a detailed proposal.</p>
        
        <p>For immediate assistance, you can:</p>
        <ul>
          <li>Call us at: ${config.contact.offices[0]?.phone || config.contact.whatsappNumber}</li>
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

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Quote request sent successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Quote request error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        message: 'Failed to send quote request. Please try again later.' 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};