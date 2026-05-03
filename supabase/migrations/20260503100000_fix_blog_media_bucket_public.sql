-- ================================================================
-- Fix blog-media bucket: ensure it is public and policies are correct
-- Safe to run multiple times (idempotent).
-- ================================================================

-- 1. Upsert bucket — force public = true even if bucket already existed
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-media',
  'blog-media',
  true,
  52428800,
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/ogg'
  ]
)
ON CONFLICT (id) DO UPDATE
  SET public            = true,
      file_size_limit   = 52428800,
      allowed_mime_types = ARRAY[
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'video/mp4', 'video/webm', 'video/ogg'
      ];

-- 2. Recreate storage RLS policies (drop first so re-runs are safe)
DROP POLICY IF EXISTS "public_read_blog_media"   ON storage.objects;
DROP POLICY IF EXISTS "admin_upload_blog_media"  ON storage.objects;
DROP POLICY IF EXISTS "admin_delete_blog_media"  ON storage.objects;
DROP POLICY IF EXISTS "admin_update_blog_media"  ON storage.objects;

-- Anyone (including anonymous visitors) can read blog media files
CREATE POLICY "public_read_blog_media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-media');

-- Only authenticated users can upload
CREATE POLICY "admin_upload_blog_media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog-media' AND auth.role() = 'authenticated');

-- Only authenticated users can delete
CREATE POLICY "admin_delete_blog_media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'blog-media' AND auth.role() = 'authenticated');

-- Only authenticated users can update / overwrite
CREATE POLICY "admin_update_blog_media"
  ON storage.objects FOR UPDATE
  USING  (bucket_id = 'blog-media' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'blog-media' AND auth.role() = 'authenticated');
