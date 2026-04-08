import { createClient } from '@supabase/supabase-js';

// Validate and sanitize the URL — fall back to a safe placeholder if missing or malformed
function getSafeUrl(raw: string | undefined): string {
  const val = (raw || '').trim();
  try {
    new URL(val);
    return val;
  } catch {
    return 'https://placeholder.supabase.co';
  }
}

const supabaseUrl = getSafeUrl(import.meta.env.PUBLIC_SUPABASE_URL);
const supabaseAnonKey = (import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key').trim();

// Guard flag — prevents the JWT error handler from running more than once
// per page load (avoids any retry loops during sign-out).
let _handlingExpiredJwt = false;

// Create a singleton client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: async (...args) => {
      const response = await fetch(...args);

      // Intercept InvalidJWT responses (expired access token that the
      // auto-refresh failed to renew). Clear storage and redirect to login
      // so the user re-authenticates rather than seeing opaque failures.
      if (
        !_handlingExpiredJwt &&
        (response.status === 400 || response.status === 401) &&
        typeof window !== 'undefined' &&
        window.location.pathname.startsWith('/admin')
      ) {
        const clone = response.clone();
        try {
          const body = await clone.json();
          if (body?.error === 'InvalidJWT' || body?.message?.includes('exp')) {
            _handlingExpiredJwt = true;
            // Wipe every Supabase key from localStorage directly
            // (avoids making another network call through this same client)
            Object.keys(localStorage)
              .filter(k => k.startsWith('sb-'))
              .forEach(k => localStorage.removeItem(k));
            window.location.href = '/admin/login';
            // Reset the flag after a short delay so future expiry events are handled
            setTimeout(() => { _handlingExpiredJwt = false; }, 3000);
          }
        } catch {
          // JSON parse failed — leave response untouched
        }
      }

      return response;
    }
  }
});

// Server-only client using service role key — bypasses RLS.
// Only import this in server-side API routes, never in client-side code.
const serviceRoleKey = (import.meta.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key').trim();
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);