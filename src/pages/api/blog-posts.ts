export const prerender = false;

/**
 * GET /api/blog-posts
 *
 * Public endpoint — returns published blog posts from the database.
 * No auth required (RLS allows public SELECT on published rows).
 *
 * Query params:
 *   slug      — return a single post by slug
 *   lang      — preferred language for title/description (default: 'en')
 *   category  — filter by category
 *   limit     — max results (default: 50, max: 100)
 */

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}

const VALID_LANGS = new Set(['en', 'fr', 'es', 'af']);

export const GET: APIRoute = async ({ request }) => {
  try {
    const url      = new URL(request.url);
    const slug     = url.searchParams.get('slug') || '';
    const lang     = VALID_LANGS.has(url.searchParams.get('lang') || '') ? url.searchParams.get('lang')! : 'en';
    const category = url.searchParams.get('category') || '';
    const limit    = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10)));

    const supabase = getSupabase();

    if (slug) {
      // Single post by slug
      const { data, error } = await supabase
        .from('admin_blog_posts')
        .select('id, slug, title, description, content, author, category, featured, image_url, video_url, links, tags, published_at, created_at')
        .eq('status', 'published')
        .eq('slug', slug)
        .single();

      if (error || !data) return json({ error: 'Post not found' }, 404);
      return json({ post: data, lang });
    }

    // List posts
    let q = supabase
      .from('admin_blog_posts')
      .select('id, slug, title, description, author, category, featured, image_url, published_at, created_at')
      .eq('status', 'published');

    if (category) q = q.eq('category', category);

    const { data, error } = await q
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) throw error;
    return json({ posts: data || [], lang });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};
