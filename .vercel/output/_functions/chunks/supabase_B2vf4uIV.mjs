import { createClient } from "@supabase/supabase-js";
function getSafeUrl(raw) {
  const val = raw.trim();
  try {
    new URL(val);
    return val;
  } catch {
    return "https://placeholder.supabase.co";
  }
}
const supabaseUrl = getSafeUrl("https://fkfxbihczvjinznifuzk.supabase.co");
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrZnhiaWhjenZqaW56bmlmdXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyOTk5MDksImV4cCI6MjA5MDg3NTkwOX0.uoPdpukIo8idn1aCcHKNoAUgS1ddD8V0h4muenLi51A".trim();
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  global: {
    fetch: (...args) => {
      const [resource, config] = args;
      return fetch(resource, {
        ...config,
        signal: config?.signal || (typeof AbortController !== "undefined" ? new AbortController().signal : void 0)
      });
    }
  }
});
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrZnhiaWhjenZqaW56bmlmdXprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTI5OTkwOSwiZXhwIjoyMDkwODc1OTA5fQ.g6Fs8pUPBA5yt9igxMdU40obDewtqB6DO3KbGOi-4gA".trim();
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
export {
  supabaseAdmin as a,
  supabase as s
};
