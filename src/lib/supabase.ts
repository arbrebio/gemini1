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