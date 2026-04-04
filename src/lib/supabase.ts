import { createClient } from '@supabase/supabase-js';

// Provide safe fallback values for build process
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Create a singleton client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  global: {
    fetch: (...args) => {
      // Add custom fetch options like timeout
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
const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);