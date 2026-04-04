export const prerender = false;

import type { APIRoute } from 'astro';
import { supabaseAdmin as supabase } from '../../../lib/supabase';

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
                  <p><strong>Email:</strong> ${data.email}</p>
                  <p><strong>Name:</strong> ${data.full_name || 'Not provided'}</p>
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
