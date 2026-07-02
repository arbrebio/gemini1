export const prerender = false;
/**
 * GET  /api/blog/likes?post_id=<uuid>                        — like count
 * POST /api/blog/likes  { post_id, fingerprint }             — toggle like
 */
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { globalRateLimiter, getClientIp } from '../../../lib/securityHeaders';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  if (!postId || !UUID_RE.test(postId)) return json({ error: 'post_id required' }, 400);

  const { count, error } = await getSupabase()
    .from('blog_post_likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  if (error) return json({ error: 'Failed to load likes' }, 500);
  return json({ count: count ?? 0 });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!globalRateLimiter.isAllowed(getClientIp(request))) {
      return json({ error: 'Too many requests. Please try again later.' }, 429);
    }

    const { post_id, fingerprint } = await request.json() ?? {};
    if (typeof post_id !== 'string' || !UUID_RE.test(post_id)) return json({ error: 'post_id and fingerprint required' }, 400);
    if (typeof fingerprint !== 'string' || !fingerprint || fingerprint.length > 128) return json({ error: 'post_id and fingerprint required' }, 400);

    const sb = getSupabase();

    // Check if already liked
    const { data: existing } = await sb
      .from('blog_post_likes')
      .select('id')
      .eq('post_id', post_id)
      .eq('fingerprint', fingerprint)
      .maybeSingle();

    if (existing) {
      // Unlike
      await sb.from('blog_post_likes').delete().eq('id', existing.id);
      const { count } = await sb.from('blog_post_likes').select('*', { count: 'exact', head: true }).eq('post_id', post_id);
      return json({ liked: false, count: count ?? 0 });
    } else {
      // Like
      await sb.from('blog_post_likes').insert({ post_id, fingerprint });
      const { count } = await sb.from('blog_post_likes').select('*', { count: 'exact', head: true }).eq('post_id', post_id);
      return json({ liked: true, count: count ?? 0 });
    }
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }
};
