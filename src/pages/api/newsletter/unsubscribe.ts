export const prerender = false;

import type { APIRoute } from 'astro';
import { supabaseAdmin as supabase } from '../../../lib/supabase';
import { globalRateLimiter, getClientIp, escapeHtml, verifyUnsubscribeToken } from '../../../lib/securityHeaders';

const ADMIN_EMAIL = 'farms@arbrebio.com';
const SENDER_NAME = 'Arbre Bio Africa';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Rate limit: prevents bulk unsubscribe abuse / subscriber enumeration.
    if (!globalRateLimiter.isAllowed(getClientIp(request))) {
      return new Response(JSON.stringify({ success: false, message: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    const token = url.searchParams.get('token');

    if (!email || email.length > 120) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid unsubscribe link'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Require a valid signed token so a caller can only unsubscribe the address
    // the link was actually issued for — not any address they can guess. A bad
    // token returns the SAME generic success as a valid one below, so this
    // endpoint never reveals whether an address is subscribed (no enumeration).
    if (!verifyUnsubscribeToken(email, token)) {
      return new Response(JSON.stringify({
        success: true,
        message: 'If this address was subscribed, it has been unsubscribed.'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .update({ status: 'unsubscribed' })
      .eq('email', email.toLowerCase().trim())
      .select()
      .maybeSingle();

    if (error) throw error;

    // Generic response whether or not the address existed — no enumeration oracle.
    if (!data) {
      return new Response(JSON.stringify({
        success: true,
        message: 'If this address was subscribed, it has been unsubscribed.'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const resendKey = import.meta.env.RESEND_API_KEY;
    if (resendKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${SENDER_NAME} <farms@newsletter.arbrebio.com>`,
          to: [ADMIN_EMAIL],
          subject: 'Newsletter Unsubscription',
          html: `
            <!DOCTYPE html>
            <html>
              <head><meta charset="utf-8"></head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #194642;">Newsletter Unsubscription</h1>
                <p>A user has unsubscribed from the Arbre Bio Africa newsletter:</p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
                  <p><strong>Name:</strong> ${escapeHtml(data.full_name) || 'Not provided'}</p>
                  <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                </div>
              </body>
            </html>
          `
        })
      });
    }

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
