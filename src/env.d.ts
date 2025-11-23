/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SENDGRID_API_KEY: string;
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly PUBLIC_ADMIN_EMAIL: string;
  readonly PUBLIC_SENDER_NAME: string;
  readonly SITE_URL: string;
  readonly ADMIN_TOKEN: string;
  readonly ADMIN_STATS_TOKEN: string;
  readonly ADMIN_EXPORT_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}