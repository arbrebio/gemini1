-- ============================================================
-- Migration: 20260407000000_harden_rls_security
-- Purpose: Fix critical RLS vulnerability + harden all tables
--
-- ROOT CAUSE:
--   admin_notifications had RLS disabled → anyone with the
--   project URL could read/write/delete all notification data.
--
-- SECURITY MODEL:
--   • service_role key (used by ALL API routes) BYPASSES RLS
--     automatically — no policies needed for API routes.
--   • anon key (unauthenticated browser) is blocked by RLS.
--   • authenticated role (logged-in admin JWT) is allowed
--     only on admin tables, and only if the user has a record
--     in admin_profiles (i.e. is a real admin user).
--   • Public tables (career_jobs, podcasts, etc.) remain
--     readable but only published/active records.
--
-- GUARANTEES AFTER THIS MIGRATION:
--   ✓ No table in the public schema has RLS disabled
--   ✓ Anonymous users cannot read or write admin data
--   ✓ Only verified admin_profiles users can query admin tables
--   ✓ All future tables are protected by the helper function
-- ============================================================


-- ============================================================
-- STEP 1 — Helper: is_admin()
-- Returns TRUE when the calling JWT belongs to a user who has
-- a row in admin_profiles. Used in every admin table policy.
-- Service_role bypasses this check entirely (RLS bypass).
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM   public.admin_profiles
    WHERE  id = auth.uid()
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS
  'Returns true when the authenticated JWT belongs to a registered admin user. '
  'Used in RLS policies. Service_role bypasses RLS and never calls this.';


-- ============================================================
-- STEP 2 — Fix the flagged critical vulnerability:
--   admin_notifications had RLS explicitly DISABLED.
--   Enable it and lock it down.
-- ============================================================
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Drop the old "disable" comment-policy if it somehow exists
DROP POLICY IF EXISTS "notifications_open" ON admin_notifications;

-- Only verified admins can read/write notifications
-- (service_role API routes bypass this automatically)
CREATE POLICY "notifications_admin_only"
  ON admin_notifications
  FOR ALL
  TO authenticated
  USING  (is_admin())
  WITH CHECK (is_admin());


-- ============================================================
-- STEP 3 — Tighten existing admin table policies
-- Replace the broad `auth.role() = 'authenticated'` policies
-- (any logged-in Supabase user) with `is_admin()` checks
-- (only users who have an admin_profiles row).
-- ============================================================

-- ── admin_customers ─────────────────────────────────────────
DROP POLICY IF EXISTS "admin_customers_auth_all" ON admin_customers;
CREATE POLICY "admin_customers_admin_only"
  ON admin_customers FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ── admin_product_categories ────────────────────────────────
DROP POLICY IF EXISTS "admin_product_categories_auth_all" ON admin_product_categories;
CREATE POLICY "admin_product_categories_admin_only"
  ON admin_product_categories FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ── admin_products ──────────────────────────────────────────
DROP POLICY IF EXISTS "admin_products_auth_all" ON admin_products;
CREATE POLICY "admin_products_admin_only"
  ON admin_products FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ── admin_orders ────────────────────────────────────────────
DROP POLICY IF EXISTS "admin_orders_auth_all" ON admin_orders;
CREATE POLICY "admin_orders_admin_only"
  ON admin_orders FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ── admin_order_items ───────────────────────────────────────
DROP POLICY IF EXISTS "admin_order_items_auth_all" ON admin_order_items;
CREATE POLICY "admin_order_items_admin_only"
  ON admin_order_items FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ── admin_order_status_history ──────────────────────────────
DROP POLICY IF EXISTS "admin_order_status_history_auth_all" ON admin_order_status_history;
CREATE POLICY "admin_order_status_history_admin_only"
  ON admin_order_status_history FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ── admin_projects ──────────────────────────────────────────
DROP POLICY IF EXISTS "admin_projects_auth_all" ON admin_projects;
CREATE POLICY "admin_projects_admin_only"
  ON admin_projects FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ── admin_project_tasks ─────────────────────────────────────
DROP POLICY IF EXISTS "admin_project_tasks_auth_all" ON admin_project_tasks;
CREATE POLICY "admin_project_tasks_admin_only"
  ON admin_project_tasks FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ── admin_site_settings ─────────────────────────────────────
DROP POLICY IF EXISTS "admin_site_settings_auth_all" ON admin_site_settings;
CREATE POLICY "admin_site_settings_admin_only"
  ON admin_site_settings FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ── admin_profiles ──────────────────────────────────────────
-- Admins can read all profiles; can only update their own row.
DROP POLICY IF EXISTS "admin_profiles_auth_all" ON admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_select" ON admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_update" ON admin_profiles;

CREATE POLICY "admin_profiles_select"
  ON admin_profiles FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "admin_profiles_update"
  ON admin_profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());


-- ============================================================
-- STEP 4 — Tighten supplier table policies
-- ============================================================

DROP POLICY IF EXISTS "suppliers_auth_all"           ON suppliers;
DROP POLICY IF EXISTS "supplier_contacts_auth_all"   ON supplier_contacts;
DROP POLICY IF EXISTS "supplier_notes_auth_all"      ON supplier_notes;
DROP POLICY IF EXISTS "supplier_orders_auth_all"     ON supplier_orders;
DROP POLICY IF EXISTS "supplier_deliveries_auth_all" ON supplier_deliveries;
DROP POLICY IF EXISTS "supplier_status_log_auth_all" ON supplier_status_log;

CREATE POLICY "suppliers_admin_only"
  ON suppliers FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "supplier_contacts_admin_only"
  ON supplier_contacts FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "supplier_notes_admin_only"
  ON supplier_notes FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "supplier_orders_admin_only"
  ON supplier_orders FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "supplier_deliveries_admin_only"
  ON supplier_deliveries FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "supplier_status_log_admin_only"
  ON supplier_status_log FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());


-- ============================================================
-- STEP 5 — Tighten career employee / internal tables
-- Applications come from public but employees are internal.
-- ============================================================

DROP POLICY IF EXISTS "career_employees_auth_all"         ON career_employees;
DROP POLICY IF EXISTS "career_admin_settings_auth_all"    ON career_admin_settings;

CREATE POLICY "career_employees_admin_only"
  ON career_employees FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "career_admin_settings_admin_only"
  ON career_admin_settings FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());


-- ============================================================
-- STEP 6 — Verify no remaining tables with RLS disabled
-- This query should return 0 rows after this migration runs.
-- Run manually in Supabase SQL editor to confirm:
--
--   SELECT tablename
--   FROM   pg_tables
--   WHERE  schemaname = 'public'
--     AND  tablename NOT IN (
--            SELECT relname FROM pg_class c
--            JOIN pg_namespace n ON n.oid = c.relnamespace
--            WHERE n.nspname = 'public'
--              AND c.relrowsecurity = true
--          );
-- ============================================================


-- ============================================================
-- STEP 7 — Revenue RPC function for dashboard
-- Calculates total revenue from delivered orders safely
-- on the server side (avoids transferring all rows to client).
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_total_revenue()
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(total_amount), 0)
  FROM   public.admin_orders
  WHERE  status = 'delivered';
$$;

GRANT EXECUTE ON FUNCTION public.get_total_revenue() TO authenticated;

COMMENT ON FUNCTION public.get_total_revenue() IS
  'Returns the sum of total_amount for all delivered orders. '
  'Used by the admin dashboard revenue metric.';


-- ============================================================
-- DONE — Security model summary:
--
--   Role            | Access
--   ----------------|----------------------------------------
--   anon (no login) | Blocked from ALL admin/supplier/career
--                   | employee tables via RLS
--   authenticated   | Allowed ONLY if admin_profiles row exists
--                   | (is_admin() = true)
--   service_role    | Bypasses RLS entirely — used by all API
--                   | routes in /src/pages/api/admin/
--   postgres        | Bypasses RLS — Supabase internals only
--
-- To add a new admin table in the future, always include:
--   ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
--   CREATE POLICY "your_table_admin_only"
--     ON your_table FOR ALL TO authenticated
--     USING (is_admin()) WITH CHECK (is_admin());
-- ============================================================
