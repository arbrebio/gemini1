-- ============================================================
-- Migration: 20260721000000_fix_blog_rls
-- Purpose: Close a HIGH-severity broken-access-control hole.
--
-- ROOT CAUSE:
--   admin_blog_posts (20260503000000_create_blog_posts.sql) and the
--   blog-media storage bucket policies gate write/read-draft access
--   on `auth.role() = 'authenticated'` instead of the admin-only
--   `is_admin()` helper. Every sales-agent and terrain login is a
--   real Supabase `authenticated` user, so any of them could read
--   unpublished drafts, and insert/update/delete ANY blog post or
--   upload/overwrite/delete ANY file in blog-media — directly via
--   the anon key, bypassing the admin-only API routes.
--
--   Same regression pattern as [[project_security_pass_july17_2026]]
--   and [[project_security_supplier_rls_july20_2026]].
--
-- SAFETY:
--   • Admin blog routes (src/pages/api/admin/blog.ts,
--     blog-presign.ts) use the service-role key, which BYPASSES
--     RLS — the admin panel is unaffected.
--   • Public GET /api/blog-posts only reads status='published' rows
--     via the untouched "public_read_published_blog_posts" policy.
--   • Public blog-media reads (public_read_blog_media, SELECT) are
--     untouched — images/videos on the public site keep working.
--   • blog_post_likes / blog_post_comments are intentionally public
--     (anonymous site visitors) and are NOT touched here.
--   • Idempotent: drops each policy if present, then recreates it.
-- ============================================================

DROP POLICY IF EXISTS "admin_full_access_blog_posts" ON admin_blog_posts;
CREATE POLICY "admin_full_access_blog_posts" ON admin_blog_posts
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_upload_blog_media" ON storage.objects;
CREATE POLICY "admin_upload_blog_media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'blog-media' AND is_admin());

DROP POLICY IF EXISTS "admin_delete_blog_media" ON storage.objects;
CREATE POLICY "admin_delete_blog_media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'blog-media' AND is_admin());

DROP POLICY IF EXISTS "admin_update_blog_media" ON storage.objects;
CREATE POLICY "admin_update_blog_media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'blog-media' AND is_admin())
  WITH CHECK (bucket_id = 'blog-media' AND is_admin());

-- ============================================================
-- VERIFY (run manually after applying):
--   SELECT policyname, qual FROM pg_policies
--   WHERE tablename = 'admin_blog_posts';
--   SELECT policyname, qual FROM pg_policies
--   WHERE tablename = 'objects' AND policyname LIKE '%blog_media%';
--   -> every qual should read: is_admin()  (except the public SELECT ones)
-- ============================================================
