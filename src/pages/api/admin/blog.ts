export const prerender = false;

/**
 * /api/admin/blog
 *
 * Admin-only CRUD for blog posts.
 *
 * GET    ?page&limit&search&status&category  — paginated list
 * POST   { slug, title, description, content, author, category,
 *           featured, status, image_url, image_path, video_url, links, tags }  — create
 * PUT    { id, ...same fields }                                                 — update
 * DELETE { id }                                                                 — delete (+ storage cleanup)
 *
 * All routes require admin auth.
 */

import type { APIRoute } from 'astro';
import { requireAdminAuth } from '../../../lib/adminAuth';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const VALID_STATUSES   = ['draft', 'published'] as const;
const VALID_CATEGORIES = [
  'irrigation', 'greenhouse', 'substrates', 'farming-tips', 'digital-farming',
] as const;
const LANGS = ['en', 'fr', 'es', 'af'] as const;

function sanitizeJsonbLang(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, string> = {};
  for (const lang of LANGS) {
    const val = (raw as Record<string, unknown>)[lang];
    if (typeof val === 'string') out[lang] = val.trim();
  }
  return out;
}

function sanitizeLinks(raw: unknown): Array<{ label: string; url: string }> {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((l): l is { label: string; url: string } =>
      l && typeof l === 'object' &&
      typeof (l as any).label === 'string' &&
      typeof (l as any).url === 'string',
    )
    .map(l => ({ label: l.label.trim(), url: l.url.trim() }))
    .filter(l => l.label && l.url);
}

// ── GET — list posts ──────────────────────────────────────────────────────────
export const GET: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const url      = new URL(request.url);
    const page     = Math.max(1, parseInt(url.searchParams.get('page')  || '1', 10));
    const limit    = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
    const search   = (url.searchParams.get('search')   || '').trim();
    const status   = url.searchParams.get('status')   || '';
    const category = url.searchParams.get('category') || '';
    const from     = (page - 1) * limit;

    const supabase = getSupabase();
    let q = supabase
      .from('admin_blog_posts')
      .select('id, slug, title, description, content, author, category, featured, status, image_url, image_path, video_url, links, tags, published_at, created_at, updated_at', { count: 'exact' });

    if (status && VALID_STATUSES.includes(status as any))   q = q.eq('status', status);
    if (category && VALID_CATEGORIES.includes(category as any)) q = q.eq('category', category);
    const featuredParam = url.searchParams.get('featured');
    if (featuredParam === 'true') q = q.eq('featured', true);
    if (search) {
      // Full-text search across English title (jsonb ->> 'en')
      q = q.ilike('title->>en', `%${search}%`);
    }

    q = q.order('created_at', { ascending: false }).range(from, from + limit - 1);

    const { data, error, count } = await q;
    if (error) throw error;

    return json({ posts: data || [], total: count ?? 0 });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

// ── POST — create post ────────────────────────────────────────────────────────
export const POST: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const {
      slug, title, description, content,
      author, category, featured, status,
      image_url, image_path, video_url, links, tags,
    } = body ?? {};

    // Validation
    if (!slug?.trim())                                 return json({ error: 'slug is required' }, 400);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))    return json({ error: 'slug must be lowercase letters, numbers, and hyphens only' }, 400);
    if (!VALID_STATUSES.includes(status))              return json({ error: 'status must be draft or published' }, 400);
    if (!VALID_CATEGORIES.includes(category))          return json({ error: 'Invalid category' }, 400);

    const titleObj   = sanitizeJsonbLang(title);
    const descObj    = sanitizeJsonbLang(description);
    const contentObj = sanitizeJsonbLang(content);

    if (!titleObj.en?.trim()) return json({ error: 'English title is required' }, 400);

    const supabase = getSupabase();

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from('admin_blog_posts')
      .select('id')
      .eq('slug', slug.trim())
      .maybeSingle();
    if (existing) return json({ error: 'A post with this slug already exists' }, 409);

    const payload: Record<string, unknown> = {
      slug:        slug.trim(),
      title:       titleObj,
      description: descObj,
      content:     contentObj,
      author:      (author as string)?.trim() || 'Arbre Bio Africa Team',
      category,
      featured:    Boolean(featured),
      status,
      image_url:   image_url?.trim() || null,
      image_path:  image_path?.trim() || null,
      video_url:   video_url?.trim() || null,
      links:       sanitizeLinks(links),
      tags:        Array.isArray(tags) ? tags.map((t: string) => t.trim()).filter(Boolean) : [],
      created_by:  auth.userId,
    };

    if (status === 'published') {
      payload.published_at = new Date().toISOString();
    }

    const { data: post, error: insertErr } = await supabase
      .from('admin_blog_posts')
      .insert(payload)
      .select()
      .single();

    if (insertErr) throw insertErr;
    return json({ post }, 201);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

// ── PUT — update post ─────────────────────────────────────────────────────────
export const PUT: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const {
      id, slug, title, description, content,
      author, category, featured, status,
      image_url, image_path, video_url, links, tags,
    } = body ?? {};

    if (!id)                                           return json({ error: 'id is required' }, 400);
    if (!slug?.trim())                                 return json({ error: 'slug is required' }, 400);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))    return json({ error: 'slug must be lowercase letters, numbers, and hyphens only' }, 400);
    if (!VALID_STATUSES.includes(status))              return json({ error: 'status must be draft or published' }, 400);
    if (!VALID_CATEGORIES.includes(category))          return json({ error: 'Invalid category' }, 400);

    const titleObj   = sanitizeJsonbLang(title);
    const descObj    = sanitizeJsonbLang(description);
    const contentObj = sanitizeJsonbLang(content);

    if (!titleObj.en?.trim()) return json({ error: 'English title is required' }, 400);

    const supabase = getSupabase();

    // Check slug uniqueness (excluding current post)
    const { data: existing } = await supabase
      .from('admin_blog_posts')
      .select('id')
      .eq('slug', slug.trim())
      .neq('id', id)
      .maybeSingle();
    if (existing) return json({ error: 'A post with this slug already exists' }, 409);

    // Fetch current post to compare status for published_at
    const { data: current } = await supabase
      .from('admin_blog_posts')
      .select('status, published_at, image_path')
      .eq('id', id)
      .single();

    const payload: Record<string, unknown> = {
      slug:        slug.trim(),
      title:       titleObj,
      description: descObj,
      content:     contentObj,
      author:      (author as string)?.trim() || 'Arbre Bio Africa Team',
      category,
      featured:    Boolean(featured),
      status,
      image_url:   image_url?.trim() || null,
      image_path:  image_path?.trim() || null,
      video_url:   video_url?.trim() || null,
      links:       sanitizeLinks(links),
      tags:        Array.isArray(tags) ? tags.map((t: string) => t.trim()).filter(Boolean) : [],
    };

    // Set published_at only on first publication
    if (status === 'published' && current?.status !== 'published') {
      payload.published_at = new Date().toISOString();
    }

    // Clean up old storage image if it changed
    const oldPath = current?.image_path;
    const newPath = image_path?.trim() || null;
    if (oldPath && oldPath !== newPath) {
      await supabase.storage.from('blog-media').remove([oldPath]).catch(() => {});
    }

    const { data: post, error: updateErr } = await supabase
      .from('admin_blog_posts')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;
    return json({ post });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

// ── DELETE — delete post ──────────────────────────────────────────────────────
export const DELETE: APIRoute = async ({ request }) => {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await request.json();
    if (!id) return json({ error: 'id is required' }, 400);

    const supabase = getSupabase();

    // Fetch image_path before deleting
    const { data: post } = await supabase
      .from('admin_blog_posts')
      .select('image_path')
      .eq('id', id)
      .maybeSingle();

    // Remove media from storage if it was uploaded
    if (post?.image_path) {
      await supabase.storage.from('blog-media').remove([post.image_path]).catch(() => {});
    }

    const { error: delErr } = await supabase
      .from('admin_blog_posts')
      .delete()
      .eq('id', id);

    if (delErr) throw delErr;
    return json({ success: true });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};
