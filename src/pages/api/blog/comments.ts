export const prerender = false;
/**
 * GET  /api/blog/comments?post_id=<uuid>   — list comments for a post
 * POST /api/blog/comments                  — submit a new comment
 */
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { blogInteractionRateLimiter, getClientIp } from '../../../lib/securityHeaders';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Service role: likes/comments are written only through this rate-limited,
// validated endpoint. (With the anon key, "unlike" silently did nothing —
// there is no anonymous DELETE policy — and anyone could bypass this API and
// insert rows straight into the tables.)
function getSupabase() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ request }) => {
  const postId = new URL(request.url).searchParams.get('post_id');
  if (!postId || !UUID_RE.test(postId)) return json({ error: 'post_id required' }, 400);

  const { data, error } = await getSupabase()
    .from('blog_post_comments')
    .select('id, author_name, content, created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) return json({ error: 'Failed to load comments' }, 500);
  return json({ comments: data ?? [] });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!(await blogInteractionRateLimiter.check(getClientIp(request)))) {
      return json({ error: 'Too many requests. Please try again later.' }, 429);
    }

    const body = await request.json();
    const { post_id, author_name, author_email, content } = body ?? {};

    if (typeof post_id !== 'string' || !UUID_RE.test(post_id)) return json({ error: 'post_id required' }, 400);
    if (typeof author_name !== 'string' || !author_name.trim()) return json({ error: 'Name is required' }, 400);
    if (author_name.trim().length < 2)     return json({ error: 'Name too short' }, 400);
    if (author_name.trim().length > 80)    return json({ error: 'Name too long (max 80 chars)' }, 400);
    if (typeof content !== 'string' || !content.trim()) return json({ error: 'Comment cannot be empty' }, 400);
    if (content.trim().length < 5)         return json({ error: 'Comment too short' }, 400);
    if (content.trim().length > 2000)      return json({ error: 'Comment too long (max 2000 chars)' }, 400);
    if (author_email != null && author_email !== '' && (
      typeof author_email !== 'string' ||
      author_email.length > 120 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(author_email.trim())
    )) {
      return json({ error: 'Invalid email' }, 400);
    }

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

    if (error) return json({ error: 'Failed to submit comment' }, 500);
    return json({ comment: data }, 201);
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }
};
