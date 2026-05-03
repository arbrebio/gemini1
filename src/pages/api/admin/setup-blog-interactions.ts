export const prerender = false;
/**
 * GET /api/admin/setup-blog-interactions?token=ADMIN_TOKEN
 * One-time endpoint to create blog_post_likes and blog_post_comments tables.
 */
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const GET: APIRoute = async ({ request }) => {
  const token = new URL(request.url).searchParams.get('token');
  if (token !== import.meta.env.ADMIN_TOKEN) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const sql = `
    CREATE TABLE IF NOT EXISTS blog_post_likes (
      id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      post_id     uuid NOT NULL REFERENCES admin_blog_posts(id) ON DELETE CASCADE,
      fingerprint text NOT NULL,
      created_at  timestamptz DEFAULT now()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS blog_post_likes_unique ON blog_post_likes(post_id, fingerprint);

    CREATE TABLE IF NOT EXISTS blog_post_comments (
      id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      post_id      uuid NOT NULL REFERENCES admin_blog_posts(id) ON DELETE CASCADE,
      author_name  text NOT NULL CHECK (char_length(author_name) >= 2 AND char_length(author_name) <= 80),
      author_email text,
      content      text NOT NULL CHECK (char_length(content) >= 5 AND char_length(content) <= 2000),
      created_at   timestamptz DEFAULT now()
    );

    ALTER TABLE blog_post_likes    ENABLE ROW LEVEL SECURITY;
    ALTER TABLE blog_post_comments ENABLE ROW LEVEL SECURITY;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='blog_post_likes' AND policyname='public_read_likes') THEN
        CREATE POLICY "public_read_likes" ON blog_post_likes FOR SELECT USING (true);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='blog_post_likes' AND policyname='public_insert_likes') THEN
        CREATE POLICY "public_insert_likes" ON blog_post_likes FOR INSERT WITH CHECK (true);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='blog_post_comments' AND policyname='public_read_comments') THEN
        CREATE POLICY "public_read_comments" ON blog_post_comments FOR SELECT USING (true);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='blog_post_comments' AND policyname='public_insert_comments') THEN
        CREATE POLICY "public_insert_comments" ON blog_post_comments FOR INSERT WITH CHECK (true);
      END IF;
    END $$;
  `;

  const { error } = await supabase.rpc('exec_sql', { query: sql }).single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message, hint: 'Run the SQL in your Supabase dashboard SQL editor instead.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true, message: 'Tables created successfully.' }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
