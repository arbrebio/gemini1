-- Blog post likes (one per browser fingerprint per post)
CREATE TABLE IF NOT EXISTS blog_post_likes (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id      uuid NOT NULL REFERENCES admin_blog_posts(id) ON DELETE CASCADE,
  fingerprint  text NOT NULL,
  created_at   timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS blog_post_likes_unique ON blog_post_likes(post_id, fingerprint);

-- Blog post comments
CREATE TABLE IF NOT EXISTS blog_post_comments (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id      uuid NOT NULL REFERENCES admin_blog_posts(id) ON DELETE CASCADE,
  author_name  text NOT NULL CHECK (char_length(author_name) >= 2 AND char_length(author_name) <= 80),
  author_email text,
  content      text NOT NULL CHECK (char_length(content) >= 5 AND char_length(content) <= 2000),
  created_at   timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE blog_post_likes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_likes"    ON blog_post_likes    FOR SELECT USING (true);
CREATE POLICY "public_insert_likes"  ON blog_post_likes    FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_comments" ON blog_post_comments FOR SELECT USING (true);
CREATE POLICY "public_insert_comments" ON blog_post_comments FOR INSERT WITH CHECK (true);
