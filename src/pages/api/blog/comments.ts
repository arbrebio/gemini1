export const prerender = false;
/**
 * GET  /api/blog/comments?post_id=<uuid>   — list comments for a post
 * POST /api/blog/comments                  — submit a new comment
 */
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ request }) => {
  const postId = new URL(request.url).searchParams.get('post_id');
  if (!postId) return json({ error: 'post_id required' }, 400);

  const { data, error } = await getSupabase()
    .from('blog_post_comments')
    .select('id, author_name, content, created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) return json({ error: error.message }, 500);
  return json({ comments: data ?? [] });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { post_id, author_name, author_email, content } = body ?? {};

    if (!post_id)                          return json({ error: 'post_id required' }, 400);
    if (!author_name?.trim())              return json({ error: 'Name is required' }, 400);
    if (author_name.trim().length < 2)     return json({ error: 'Name too short' }, 400);
    if (!content?.trim())                  return json({ error: 'Comment cannot be empty' }, 400);
    if (content.trim().length < 5)         return json({ error: 'Comment too short' }, 400);
    if (content.trim().length > 2000)      return json({ error: 'Comment too long (max 2000 chars)' }, 400);

    const { data, error } = await getSupabase()
      .from('blog_post_comments')
      .insert({
        post_id,
        author_name: author_name.trim(),
        author_email: author_email?.trim() || null,
        content: content.trim(),
      })
      .select('id, author_name, content, created_at')
      .single();

    if (error) return json({ error: error.message }, 500);
    return json({ comment: data }, 201);
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }
};
