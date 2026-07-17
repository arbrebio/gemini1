-- ============================================================
-- Migration: 20260720000000_fix_supplier_rls
-- Purpose: Close a HIGH-severity broken-access-control hole.
--
-- ROOT CAUSE:
--   The supplier tables (20260405000000_create_supplier_system.sql)
--   gate RLS on `auth.role() = 'authenticated'` instead of the
--   admin-only `is_admin()` helper used elsewhere. Every sales-agent
--   and terrain (field) login is a real Supabase `authenticated`
--   user, so any of them could call Supabase directly with the
--   public anon key + their own JWT and read/modify every supplier,
--   contact, note, purchase order, delivery, and status log —
--   bypassing the admin-only API routes.
--
--   This is the same regression already fixed for payroll/career in
--   20260717000000_fix_payroll_career_rls.sql, which itself followed
--   20260407000000_harden_rls_security.sql's is_admin() pattern.
--
-- SAFETY:
--   • API routes (src/pages/api/admin/suppliers/*) use the
--     service-role key, which BYPASSES RLS — the admin panel is
--     unaffected.
--   • Admin users have a row in admin_profiles, so is_admin() = true
--     for them on any direct client read.
--   • Only non-admin agent/terrain accounts lose direct access — the goal.
--   • Idempotent: drops each policy if present, then recreates it.
-- ============================================================

ALTER TABLE suppliers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_contacts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_notes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_status_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_suppliers" ON suppliers;
CREATE POLICY "admin_all_suppliers" ON suppliers
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_all_sup_contacts" ON supplier_contacts;
CREATE POLICY "admin_all_sup_contacts" ON supplier_contacts
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_all_sup_notes" ON supplier_notes;
CREATE POLICY "admin_all_sup_notes" ON supplier_notes
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_all_sup_orders" ON supplier_orders;
CREATE POLICY "admin_all_sup_orders" ON supplier_orders
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_all_sup_deliveries" ON supplier_deliveries;
CREATE POLICY "admin_all_sup_deliveries" ON supplier_deliveries
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_all_sup_status_log" ON supplier_status_log;
CREATE POLICY "admin_all_sup_status_log" ON supplier_status_log
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- VERIFY (run manually after applying):
--   SELECT tablename, policyname, qual
--   FROM pg_policies
--   WHERE tablename IN ('suppliers','supplier_contacts','supplier_notes',
--     'supplier_orders','supplier_deliveries','supplier_status_log');
--   -> every qual should read: is_admin()
-- ============================================================
