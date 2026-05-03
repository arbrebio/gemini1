-- ================================================================
-- ADMIN AVATARS STORAGE BUCKET
-- Migration: 20260414200000_create_admin_avatars_bucket.sql
--
-- Creates the admin-avatars bucket used by the admin panel
-- profile photo feature (Header.astro) and defines RLS policies
-- so authenticated admin users can manage their own avatar files.
-- ================================================================

-- Create the bucket (private — URLs are generated with getPublicUrl
-- which is fine since the bucket name is guessable anyway;
-- real privacy would need signed URLs).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'admin-avatars',
  'admin-avatars',
  true,             -- public so getPublicUrl() returns a direct URL
  2097152,          -- 2 MB limit (matches UI validation in Header.astro)
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Authenticated admin users can upload their own avatar.
-- Path pattern: avatars/<user-uuid>.<ext>
CREATE POLICY "admin_avatars_upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'admin-avatars'
    AND (storage.foldername(name))[1] = 'avatars'
  );

-- Authenticated users can overwrite (upsert) their own avatar.
CREATE POLICY "admin_avatars_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'admin-avatars'
    AND (storage.foldername(name))[1] = 'avatars'
  )
  WITH CHECK (
    bucket_id = 'admin-avatars'
    AND (storage.foldername(name))[1] = 'avatars'
  );

-- Anyone (including anon) can read avatars since the bucket is public.
CREATE POLICY "admin_avatars_read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'admin-avatars');

-- ================================================================
-- VERIFICATION (run in SQL editor after migration):
--   SELECT id, name, public FROM storage.buckets WHERE id = 'admin-avatars';
-- ================================================================
