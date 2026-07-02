// Security headers configuration
export const securityHeaders = {
  // Enforce HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Prevent clickjacking
  'X-Frame-Options': 'SAMEORIGIN',
  
  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://www.googletagmanager.com https://connect.facebook.net",
    "style-src 'self' 'unsafe-inline' https://rsms.me https://cdnjs.cloudflare.com https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://rsms.me https://cdnjs.cloudflare.com https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://stats.g.doubleclick.net https://www.facebook.com",
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; ')
};

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(headers: Headers): void {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
}

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
 * Extract the client IP for rate limiting. x-forwarded-for may contain a
 * comma-separated chain — only the first (client) hop is meaningful.
 */
export function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
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