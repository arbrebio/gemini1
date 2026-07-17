import { createHmac, timingSafeEqual } from 'node:crypto';

// NOTE: The live security headers (CSP, HSTS, etc.) are served by Vercel via
// vercel.json for every route. A duplicate header object used to live here but
// was dead code and drifted out of sync with vercel.json, so it was removed to
// keep a single source of truth. This module now only holds request-time
// security utilities (escaping, rate limiting, IP extraction, Turnstile).

/**
 * Escape HTML special characters so user-supplied text can be safely
 * interpolated into an HTML document (emails, server-rendered markup).
 * This is an allowlist-style transform — strictly safer than blocklist
 * stripping — and should be preferred whenever rendering untrusted input.
 */
export function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Validate and sanitize user input
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .substring(0, maxLength)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
}

/**
 * Extract the trustworthy client IP for rate limiting.
 *
 * A client can send an arbitrary `x-forwarded-for` header, so trusting the
 * FIRST value lets an attacker evade every IP rate limiter (rotate the header)
 * and poison another IP's bucket. On Vercel, prefer the headers our own edge
 * sets and cannot be spoofed by the client: `x-vercel-forwarded-for` and
 * `x-real-ip`. Only if neither is present do we fall back to the LAST hop of
 * `x-forwarded-for` (the value appended closest to us), never the first.
 */
export function getClientIp(request: Request): string {
  const vercel = request.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim();
  if (vercel) return vercel;

  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const hops = xff.split(',').map(h => h.trim()).filter(Boolean);
    if (hops.length) return hops[hops.length - 1];
  }
  return 'unknown';
}

/**
 * Rate limiting utility
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();

    // Prevent unbounded memory growth on long-lived instances: periodically
    // drop identifiers whose entire window has expired.
    if (this.requests.size > 10000) {
      for (const [key, times] of this.requests) {
        if (times.every(t => now - t >= this.windowMs)) this.requests.delete(key);
      }
    }

    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }
  
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

// Global rate limiter instance
export const globalRateLimiter = new RateLimiter(50, 60000); // 50 requests per minute

// Tighter limiter for low-traffic, bot-targeted forms like newsletter signup
export const newsletterRateLimiter = new RateLimiter(5, 60000); // 5 requests per minute

// Tighter limiter for the contact form, matching newsletter's bot-targeted profile
export const contactRateLimiter = new RateLimiter(8, 60000); // 8 requests per minute

// Tighter limiter for the quote request form, same bot-targeted profile
export const quoteRateLimiter = new RateLimiter(8, 60000); // 8 requests per minute

// Common disposable/temporary email domains used by bots and spam signups
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.info', 'guerrillamail.biz',
  'guerrillamail.de', 'guerrillamail.net', 'guerrillamail.org', 'sharklasers.com',
  '10minutemail.com', '10minutemail.net', 'tempmail.com', 'temp-mail.org',
  'yopmail.com', 'yopmail.fr', 'yopmail.net', 'trashmail.com', 'trashmail.net',
  'throwawaymail.com', 'getnada.com', 'dispostable.com', 'maildrop.cc',
  'fakeinbox.com', 'mailnesia.com', 'mintemail.com', 'mytemp.email',
  'moakt.com', 'discard.email', 'discardmail.com', 'mailcatch.com',
  'tempinbox.com', 'tempmailaddress.com', 'emailondeck.com', 'spamgourmet.com',
  'example.com', 'example.org', 'example.net', 'test.com', 'test.org',
]);

/**
 * Returns true if the email's domain is a known disposable/temporary
 * provider or a reserved documentation-only domain (e.g. example.com).
 */
export function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase().trim();
  if (!domain) return false;
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}

/**
 * Verifies a Cloudflare Turnstile token server-side. This is the real
 * bot-blocking layer — honeypot/timing checks only catch unsophisticated
 * bots, but a missing/invalid/reused Turnstile token means Cloudflare's
 * challenge was never solved by a legitimate browser.
 */
export async function verifyTurnstile(token: string | undefined, remoteIp: string): Promise<boolean> {
  const secret = import.meta.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Fail CLOSED in production: a missing secret in a deployed build is a
    // misconfiguration, and silently returning true would disable bot
    // protection on the contact/quote/newsletter forms without any signal.
    // In local dev (no secret configured) we allow through for convenience.
    if (import.meta.env.PROD) {
      console.error('Turnstile secret key is not configured in production — rejecting request');
      return false;
    }
    console.warn('Turnstile secret key is not configured (dev) — allowing request');
    return true;
  }
  if (!token) return false;

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: remoteIp }),
    });
    const data = await res.json();
    return data.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

/**
 * Stateless, signed unsubscribe token for newsletter links.
 *
 * Derived as HMAC-SHA256(email, secret) so it does NOT depend on any DB column
 * (the one-time `confirmation_token` is nulled at confirmation, so it can't be
 * reused for unsubscribe). Every link built with this stays valid forever and
 * can't be forged without the server secret — which is what stops anyone from
 * unsubscribing arbitrary addresses. Falls back to the service-role key so it
 * works without extra env config; set NEWSLETTER_UNSUBSCRIBE_SECRET to pin it.
 */
export function newsletterUnsubscribeToken(email: string): string {
  const secret =
    import.meta.env.NEWSLETTER_UNSUBSCRIBE_SECRET ||
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY ||
    'insecure-dev-secret';
  return createHmac('sha256', secret).update(email.toLowerCase().trim()).digest('hex');
}

/**
 * Constant-time verification of a newsletter unsubscribe token against the
 * email it should sign. Returns false on any mismatch or missing token.
 */
export function verifyUnsubscribeToken(email: string, token: string | null | undefined): boolean {
  if (!token || !email) return false;
  const expected = Buffer.from(newsletterUnsubscribeToken(email));
  const provided = Buffer.from(token);
  if (expected.length !== provided.length) return false;
  return timingSafeEqual(expected, provided);
}