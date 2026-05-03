export const prerender = false;
/**
 * GET  /api/blog/likes?post_id=<uuid>                        — like count
 * POST /api/blog/likes  { post_id, fingerprint }             — toggle like
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

  const { count, error } = await getSupabase()
    .from('blog_post_likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  if (error) return json({ error: error.message }, 500);
  return json({ count: count ?? 0 });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { post_id, fingerprint } = await request.json() ?? {};
    if (!post_id || !fingerprint) return json({ error: 'post_id and fingerprint required' }, 400);

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
