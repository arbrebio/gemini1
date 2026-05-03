-- ─────────────────────────────────────────────────────────────────────────────
-- Admin-managed blog posts with multilingual JSONB content
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admin_blog_posts (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text        UNIQUE NOT NULL,

  -- Multilingual fields: {"en": "...", "fr": "...", "es": "...", "af": "..."}
  title        jsonb       NOT NULL DEFAULT '{}',
  description  jsonb       NOT NULL DEFAULT '{}',
  content      jsonb       NOT NULL DEFAULT '{}',

  -- Shared metadata
  author       text        NOT NULL DEFAULT 'Arbre Bio Africa Team',
  category     text        NOT NULL DEFAULT 'farming-tips',
  featured     boolean     NOT NULL DEFAULT false,
  status       text        NOT NULL DEFAULT 'draft',

  -- Media
  image_url    text,
  image_path   text,   -- Supabase Storage path for deletion
  video_url    text,

  -- External links: [{"label": "...", "url": "..."}]
  links        jsonb       NOT NULL DEFAULT '[]',

  -- Tags (global)
  tags         text[]      DEFAULT '{}',

  -- Timestamps
  published_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid        REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE admin_blog_posts
  ADD CONSTRAINT admin_blog_posts_status_check
  CHECK (status IN ('draft', 'published'));

ALTER TABLE admin_blog_posts
  ADD CONSTRAINT admin_blog_posts_category_check
  CHECK (category IN (
    'irrigation', 'greenhouse', 'substrates', 'farming-tips', 'digital-farming'
  ));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION _blog_posts_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON admin_blog_posts
  FOR EACH ROW EXECUTE FUNCTION _blog_posts_set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_status       ON admin_blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category     ON admin_blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured     ON admin_blog_posts(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON admin_blog_posts(published_at DESC NULLS LAST);

-- ─── Row-level security ───────────────────────────────────────────────────────

ALTER TABLE admin_blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts (for the public blog)
CREATE POLICY "public_read_published_blog_posts"
  ON admin_blog_posts FOR SELECT
  USING (status = 'published');

-- Authenticated admins have full access
CREATE POLICY "admin_full_access_blog_posts"
  ON admin_blog_posts FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ─── Storage bucket: blog-media ───────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-media',
  'blog-media',
  true,
  52428800,  -- 50 MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/ogg'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Public can read media files
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

-- Allow overwrite (upsert) for authenticated users
CREATE POLICY "admin_update_blog_media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'blog-media' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'blog-media' AND auth.role() = 'authenticated');
