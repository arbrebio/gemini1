-- ================================================================
-- SALES AGENT PROFILE PICTURE
-- Migration: 20260715000100_add_agent_avatar_and_avatars_bucket.sql
--
-- Adds an avatar_url column to sales_agent_profiles and creates the
-- sales-agent-avatars storage bucket, mirroring admin-avatars, so
-- agents can set a profile picture from their account settings page.
-- ================================================================

ALTER TABLE public.sales_agent_profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sales-agent-avatars',
  'sales-agent-avatars',
  true,             -- public so the portal can display the photo directly
  2097152,          -- 2 MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Uploads happen server-side via the service-role key in
-- /api/sales-agent/upload-avatar, so no authenticated-role storage
-- policies are required — public read is enough for display.
CREATE POLICY "sales_agent_avatars_read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'sales-agent-avatars');
