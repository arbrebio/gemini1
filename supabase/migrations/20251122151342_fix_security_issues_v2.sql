/*
  # Fix Database Security Issues

  ## Changes Made

  ### 1. Drop Unused Indexes
  Removes all indexes that are not being utilized by queries to:
  - Reduce storage overhead
  - Improve write performance
  - Reduce maintenance burden

  ### 2. Fix Multiple Permissive RLS Policies
  Resolves overlapping policies that create security confusion:
  - Removes redundant "Anyone can read" policies for authenticated users
  - Keeps single, clear policies per table and action
  - Maintains principle of least privilege

  ### 3. Fix Function Search Path Security
  Updates functions to use immutable search paths:
  - Prevents search_path hijacking attacks
  - Ensures functions always execute in secure context
  - Adds explicit schema qualification

  ## Security Impact
  - Eliminates potential privilege escalation vectors
  - Reduces attack surface
  - Improves database performance
  - Simplifies security model
*/

-- =====================================================
-- 1. DROP UNUSED INDEXES
-- =====================================================

-- Products table indexes
DROP INDEX IF EXISTS idx_products_slug;
DROP INDEX IF EXISTS idx_products_category;

-- Product translations indexes
DROP INDEX IF EXISTS idx_product_translations_product_id;
DROP INDEX IF EXISTS idx_product_translations_language;

-- Case studies indexes
DROP INDEX IF EXISTS idx_case_studies_slug;

-- Case study translations indexes
DROP INDEX IF EXISTS idx_case_study_translations_case_study_id;
DROP INDEX IF EXISTS idx_case_study_translations_language;

-- Podcasts indexes
DROP INDEX IF EXISTS idx_podcasts_category_id;
DROP INDEX IF EXISTS idx_podcasts_published_at;
DROP INDEX IF EXISTS idx_podcasts_status;
DROP INDEX IF EXISTS idx_podcasts_slug;

-- Podcast categories indexes
DROP INDEX IF EXISTS idx_podcast_categories_slug;

-- Page sections indexes
DROP INDEX IF EXISTS idx_page_sections_page_name;

-- Page section translations indexes
DROP INDEX IF EXISTS idx_page_section_translations_section_id;
DROP INDEX IF EXISTS idx_page_section_translations_language;

-- Blog posts indexes
DROP INDEX IF EXISTS idx_blog_posts_slug;
DROP INDEX IF EXISTS idx_blog_posts_category;
DROP INDEX IF EXISTS idx_blog_posts_featured;

-- Blog post translations indexes
DROP INDEX IF EXISTS idx_blog_post_translations_post_id;
DROP INDEX IF EXISTS idx_blog_post_translations_language;

-- Static translations indexes
DROP INDEX IF EXISTS idx_static_translations_key;

-- Static translation values indexes
DROP INDEX IF EXISTS idx_static_translation_values_translation_id;
DROP INDEX IF EXISTS idx_static_translation_values_language;

-- =====================================================
-- 2. FIX MULTIPLE PERMISSIVE RLS POLICIES
-- =====================================================

-- Blog Posts: Remove redundant "Anyone can read" policy for authenticated users
DROP POLICY IF EXISTS "Anyone can read blog posts" ON public.blog_posts;

-- Blog Post Translations: Remove redundant policy
DROP POLICY IF EXISTS "Anyone can read blog post translations" ON public.blog_post_translations;

-- Page Sections: Remove redundant policy
DROP POLICY IF EXISTS "Anyone can read page sections" ON public.page_sections;

-- Page Section Translations: Remove redundant policy
DROP POLICY IF EXISTS "Anyone can read page section translations" ON public.page_section_translations;

-- Static Translations: Remove redundant policy
DROP POLICY IF EXISTS "Anyone can read static translations" ON public.static_translations;

-- Static Translation Values: Remove redundant policy
DROP POLICY IF EXISTS "Anyone can read static translation values" ON public.static_translation_values;

-- =====================================================
-- 3. FIX FUNCTION SEARCH PATH SECURITY ISSUES
-- =====================================================

-- Step 1: Drop all triggers that depend on functions
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
DROP TRIGGER IF EXISTS update_product_translations_updated_at ON public.product_translations;
DROP TRIGGER IF EXISTS update_case_studies_updated_at ON public.case_studies;
DROP TRIGGER IF EXISTS update_case_study_translations_updated_at ON public.case_study_translations;
DROP TRIGGER IF EXISTS update_page_sections_updated_at ON public.page_sections;
DROP TRIGGER IF EXISTS update_page_section_translations_updated_at ON public.page_section_translations;
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
DROP TRIGGER IF EXISTS update_blog_post_translations_updated_at ON public.blog_post_translations;
DROP TRIGGER IF EXISTS update_static_translations_updated_at ON public.static_translations;
DROP TRIGGER IF EXISTS update_static_translation_values_updated_at ON public.static_translation_values;
DROP TRIGGER IF EXISTS update_podcast_categories_updated_at ON public.podcast_categories;
DROP TRIGGER IF EXISTS update_podcasts_updated_at ON public.podcasts;

-- Step 2: Drop existing functions
DROP FUNCTION IF EXISTS public.increment_podcast_download_count(uuid);
DROP FUNCTION IF EXISTS public.increment_podcast_view_count(uuid);
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Step 3: Recreate functions with secure search path

-- Recreate increment_podcast_download_count with secure search path
CREATE OR REPLACE FUNCTION public.increment_podcast_download_count(podcast_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.podcasts
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE id = podcast_id;
END;
$$;

COMMENT ON FUNCTION public.increment_podcast_download_count(uuid) IS 
'Safely increments the download count for a podcast with immutable search path';

-- Recreate increment_podcast_view_count with secure search path
CREATE OR REPLACE FUNCTION public.increment_podcast_view_count(podcast_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.podcasts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = podcast_id;
END;
$$;

COMMENT ON FUNCTION public.increment_podcast_view_count(uuid) IS 
'Safely increments the view count for a podcast with immutable search path';

-- Recreate update_updated_at_column with secure search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_updated_at_column() IS 
'Trigger function to automatically update updated_at timestamp with immutable search path';

-- Step 4: Recreate all triggers with the secure function

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_translations_updated_at
  BEFORE UPDATE ON public.product_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_case_studies_updated_at
  BEFORE UPDATE ON public.case_studies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_case_study_translations_updated_at
  BEFORE UPDATE ON public.case_study_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_page_sections_updated_at
  BEFORE UPDATE ON public.page_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_page_section_translations_updated_at
  BEFORE UPDATE ON public.page_section_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_post_translations_updated_at
  BEFORE UPDATE ON public.blog_post_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_static_translations_updated_at
  BEFORE UPDATE ON public.static_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_static_translation_values_updated_at
  BEFORE UPDATE ON public.static_translation_values
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_podcast_categories_updated_at
  BEFORE UPDATE ON public.podcast_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_podcasts_updated_at
  BEFORE UPDATE ON public.podcasts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
