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

// Create a singleton client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  global: {
    fetch: (...args) => {
      const [resource, config] = args;
      return fetch(resource, {
        ...config,
        signal: config?.signal || (typeof AbortController !== 'undefined'
          ? new AbortController().signal
          : undefined)
      });
    }
  }
});

// Server-only client using service role key — bypasses RLS.
// Only import this in server-side API routes, never in client-side code.
const serviceRoleKey = (import.meta.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key').trim();
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);