-- ================================================================
-- AUDIT FIXES — November 2026
--
-- Safe to run more than once. Paste into the Supabase SQL editor
-- AFTER the matching application code is deployed (the new API code
-- works both before and after this migration is applied).
--
--  1. Drop legacy 2025 "open to every authenticated user" policies
--  2. Stop sales agents editing their own profile row directly
--  3. Scope sale-proof storage access to the owning agent
--  4. Blog likes/comments: writes go through the API only
--  5. Atomic stock decrement
--  6. Shared (cross-instance) rate limiting
--  7. Persist contact / quote leads
--  8. Clear plaintext temporary passwords
-- ================================================================

-- ----------------------------------------------------------------
-- 1) Legacy open policies.
--    The 2025 migrations created policies such as
--    "Admins can view all customers" with USING (true) for every
--    authenticated user. The April 2026 hardening dropped policies
--    named *_auth_all but never these, and permissive policies are
--    OR-ed together — so any sales agent / terrain user JWT could
--    still read and write these tables directly.
-- ----------------------------------------------------------------
DO $$
DECLARE
  rec record;
BEGIN
  FOR rec IN
    SELECT * FROM (VALUES
      ('admin_customers',            'Admins can view all customers'),
      ('admin_customers',            'Admins can insert customers'),
      ('admin_customers',            'Admins can update customers'),
      ('admin_customers',            'Admins can delete customers'),
      ('admin_product_categories',   'Admins can view all categories'),
      ('admin_product_categories',   'Admins can insert categories'),
      ('admin_product_categories',   'Admins can update categories'),
      ('admin_product_categories',   'Admins can delete categories'),
      ('admin_products',             'Admins can view all products'),
      ('admin_products',             'Admins can insert products'),
      ('admin_products',             'Admins can update products'),
      ('admin_products',             'Admins can delete products'),
      ('admin_orders',               'Admins can view all orders'),
      ('admin_orders',               'Admins can insert orders'),
      ('admin_orders',               'Admins can update orders'),
      ('admin_orders',               'Admins can delete orders'),
      ('admin_order_items',          'Admins can view all order items'),
      ('admin_order_items',          'Admins can insert order items'),
      ('admin_order_items',          'Admins can update order items'),
      ('admin_order_items',          'Admins can delete order items'),
      ('admin_order_status_history', 'Admins can view order history'),
      ('admin_order_status_history', 'Admins can insert order history'),
      ('admin_profiles',             'Users can view all profiles'),
      ('admin_profiles',             'Users can update own profile'),
      ('admin_projects',             'Admins can view all projects'),
      ('admin_projects',             'Admins can manage projects'),
      ('admin_project_tasks',        'Admins can view all tasks'),
      ('admin_project_tasks',        'Admins can manage tasks'),
      ('admin_suppliers',            'Admins can view all suppliers'),
      ('admin_suppliers',            'Admins can manage suppliers'),
      ('admin_warehouses',           'Admins can view all warehouses'),
      ('admin_warehouses',           'Admins can manage warehouses'),
      ('admin_stock_movements',      'Admins can view all movements'),
      ('admin_stock_movements',      'Admins can create movements'),
      ('admin_site_settings',        'admin_settings'),
      ('page_sections',              'Authenticated users can manage page sections'),
      ('page_section_translations',  'Authenticated users can manage page section translations'),
      ('blog_posts',                 'Authenticated users can manage blog posts'),
      ('blog_post_translations',     'Authenticated users can manage blog post translations'),
      ('static_translations',        'Authenticated users can manage static translations'),
      ('static_translation_values',  'Authenticated users can manage static translation values')
    ) AS t(tbl, pol)
  LOOP
    IF to_regclass('public.' || quote_ident(rec.tbl)) IS NOT NULL THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', rec.pol, rec.tbl);
    END IF;
  END LOOP;

  -- Every table above keeps (or now gets) an admin-only policy. Public
  -- "Anyone can read ..." SELECT policies on the content tables are untouched.
  FOR rec IN
    SELECT unnest(ARRAY[
      'admin_customers', 'admin_product_categories', 'admin_products',
      'admin_orders', 'admin_order_items', 'admin_order_status_history',
      'admin_projects', 'admin_project_tasks', 'admin_site_settings',
      'admin_suppliers', 'admin_warehouses', 'admin_stock_movements',
      'page_sections', 'page_section_translations', 'blog_posts',
      'blog_post_translations', 'static_translations', 'static_translation_values'
    ]) AS tbl
  LOOP
    IF to_regclass('public.' || quote_ident(rec.tbl)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', rec.tbl);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', rec.tbl || '_admin_only', rec.tbl);
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin())',
        rec.tbl || '_admin_only', rec.tbl
      );
    END IF;
  END LOOP;
END $$;

-- admin_profiles: a user may read their own row; admins may read all.
-- (Previously every authenticated user could list every admin.)
DROP POLICY IF EXISTS "admin_profiles_select" ON public.admin_profiles;
CREATE POLICY "admin_profiles_select"
  ON public.admin_profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR is_admin());

-- admin_profiles: a user may edit their own name/phone/avatar but must not
-- be able to change their own role.
CREATE OR REPLACE FUNCTION public.admin_profiles_lock_role()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND coalesce(auth.role(), 'service_role') <> 'service_role' THEN
    RAISE EXCEPTION 'role can only be changed by a service-role operation';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS admin_profiles_lock_role ON public.admin_profiles;
CREATE TRIGGER admin_profiles_lock_role
  BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW EXECUTE FUNCTION public.admin_profiles_lock_role();

-- ----------------------------------------------------------------
-- 2) Sales agents could UPDATE any column of their own profile row
--    (is_active, employee_id → commission tier, worker_id ...).
--    All legitimate self-service edits go through the service-role API.
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "sales_agent_profiles_self_pw_update" ON public.sales_agent_profiles;

-- ----------------------------------------------------------------
-- 3) sale-proofs bucket: an agent may only touch proofs/<own uid>/...
--    (Previously any active agent could read every agent's proofs.)
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "sale_proofs_agent_upload" ON storage.objects;
CREATE POLICY "sale_proofs_agent_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'sale-proofs'
    AND is_sales_agent()
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

DROP POLICY IF EXISTS "sale_proofs_read" ON storage.objects;
CREATE POLICY "sale_proofs_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'sale-proofs'
    AND (
      is_admin()
      OR (is_sales_agent() AND (storage.foldername(name))[2] = auth.uid()::text)
    )
  );

-- ----------------------------------------------------------------
-- 4) Blog likes / comments: inserts now go through /api/blog/* with the
--    service role (rate limited, validated). Direct anonymous inserts via
--    PostgREST bypassed all of that. Public read stays.
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "public_insert_likes"    ON public.blog_post_likes;
DROP POLICY IF EXISTS "public_insert_comments" ON public.blog_post_comments;

-- Commenters' e-mail addresses must not be publicly selectable.
REVOKE SELECT ON public.blog_post_comments FROM anon, authenticated;
GRANT  SELECT (id, post_id, author_name, content, created_at)
  ON public.blog_post_comments TO anon, authenticated;

-- ----------------------------------------------------------------
-- 5) Atomic stock decrement (replaces read-then-write in the API).
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.decrement_product_stock(p_product_id uuid, p_quantity numeric)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.admin_products
     SET stock_quantity = GREATEST(0, stock_quantity - CEIL(GREATEST(p_quantity, 0))::integer)
   WHERE id = p_product_id
  RETURNING stock_quantity;
$$;

REVOKE ALL ON FUNCTION public.decrement_product_stock(uuid, numeric) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_product_stock(uuid, numeric) TO service_role;

-- ----------------------------------------------------------------
-- 6) Shared rate limiting. Serverless instances do not share memory,
--    so the in-process limiter alone is easy to bypass.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  key          text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  count        integer     NOT NULL DEFAULT 1
);
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
-- No policies: service role only.

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_key text, p_max integer, p_window_seconds integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  INSERT INTO public.api_rate_limits AS r (key, window_start, count)
  VALUES (p_key, now(), 1)
  ON CONFLICT (key) DO UPDATE
    SET count = CASE
                  WHEN r.window_start < now() - make_interval(secs => p_window_seconds) THEN 1
                  ELSE r.count + 1
                END,
        window_start = CASE
                  WHEN r.window_start < now() - make_interval(secs => p_window_seconds) THEN now()
                  ELSE r.window_start
                END
  RETURNING count INTO v_count;

  -- Opportunistic cleanup so the table never grows without bound.
  IF random() < 0.01 THEN
    DELETE FROM public.api_rate_limits WHERE window_start < now() - interval '1 day';
  END IF;

  RETURN v_count <= p_max;
END $$;

REVOKE ALL ON FUNCTION public.check_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer) TO service_role;

-- ----------------------------------------------------------------
-- 7) Contact / quote leads are now stored, not just e-mailed, so a
--    mail-provider outage no longer loses the lead.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_leads (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind       text NOT NULL CHECK (kind IN ('contact', 'quote')),
  name       text,
  email      text,
  phone      text,
  lang       text,
  payload    jsonb NOT NULL DEFAULT '{}'::jsonb,
  email_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_site_leads_created_at ON public.site_leads (created_at DESC);

ALTER TABLE public.site_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "site_leads_admin_only" ON public.site_leads;
CREATE POLICY "site_leads_admin_only" ON public.site_leads
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ----------------------------------------------------------------
-- 8) Temporary passwords are no longer stored in plaintext. The API
--    stops writing these columns; clear whatever is still there.
--    (Agents/technicians with a pending temporary password already
--    received it by e-mail; use "reset password" if one was lost.)
-- ----------------------------------------------------------------
UPDATE public.sales_agent_profiles SET temp_password = NULL WHERE temp_password IS NOT NULL;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'terrain_profiles' AND column_name = 'temp_password'
  ) THEN
    UPDATE public.terrain_profiles SET temp_password = NULL WHERE temp_password IS NOT NULL;
  END IF;
END $$;
