-- ============================================================
-- Migration: 20260717000000_fix_payroll_career_rls
-- Purpose: Close a HIGH-severity broken-access-control hole.
--
-- ROOT CAUSE:
--   The payroll tables (20260716000000) and career/HR tables
--   (20260404000000) gate RLS on `auth.role() = 'authenticated'`
--   instead of the admin-only `is_admin()` helper used elsewhere.
--   Every sales-agent and terrain (field) login is a real Supabase
--   `authenticated` user, so any of them could call Supabase directly
--   with the public anon key + their own JWT and read/modify EVERY
--   employee's salary slip, payroll profile, and all job-applicant
--   PII / uploaded documents — bypassing the admin-only API routes.
--
--   This is a regression: 20260407000000_harden_rls_security.sql
--   already replaced this exact anti-pattern everywhere else with
--   is_admin(). This migration brings payroll + career in line.
--
-- SAFETY:
--   • API routes use the service-role key, which BYPASSES RLS — the
--     admin panel is unaffected.
--   • Admin users have a row in admin_profiles, so is_admin() = true
--     for them on any direct client read.
--   • Only non-admin agent/terrain accounts lose direct access — the goal.
--   • Idempotent: drops each policy if present, then recreates it.
-- ============================================================

-- Safety net: ensure the helper exists (defined in 20260407000000).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles WHERE id = auth.uid()
  );
$$;

-- ------------------------------------------------------------
-- 1) PAYROLL tables  (20260716000000_create_payroll_system.sql)
-- ------------------------------------------------------------
ALTER TABLE payroll_settings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_payroll_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_slips             ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_payroll_settings" ON payroll_settings;
CREATE POLICY "admin_all_payroll_settings" ON payroll_settings
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_all_payroll_profiles" ON employee_payroll_profiles;
CREATE POLICY "admin_all_payroll_profiles" ON employee_payroll_profiles
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_all_payroll_slips" ON payroll_slips;
CREATE POLICY "admin_all_payroll_slips" ON payroll_slips
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ------------------------------------------------------------
-- 2) CAREER / HR tables  (20260404000000_create_career_system.sql)
--    Keep public_read_published_jobs intact (public careers page).
-- ------------------------------------------------------------
ALTER TABLE career_jobs                ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_applications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_documents           ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_application_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_employees           ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_admin_settings      ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_jobs" ON career_jobs;
CREATE POLICY "admin_all_jobs" ON career_jobs
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_all_applications" ON career_applications;
CREATE POLICY "admin_all_applications" ON career_applications
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_all_documents" ON career_documents;
CREATE POLICY "admin_all_documents" ON career_documents
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_all_timeline" ON career_application_timeline;
CREATE POLICY "admin_all_timeline" ON career_application_timeline
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_all_employees" ON career_employees;
CREATE POLICY "admin_all_employees" ON career_employees
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_career_settings" ON career_admin_settings;
CREATE POLICY "admin_career_settings" ON career_admin_settings
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ------------------------------------------------------------
-- 3) CAREER-DOCUMENTS storage bucket policies
--    Applicant CV/document uploads go through the server-side
--    careers/apply.ts route (service-role, bypasses RLS), so the
--    unauthenticated anon INSERT policy is unnecessary and unsafe
--    (anyone could write arbitrary files into the bucket). Drop it,
--    and gate admin read/delete on is_admin() rather than any
--    authenticated user.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "anon_upload_career_docs" ON storage.objects;

DROP POLICY IF EXISTS "admin_read_career_docs" ON storage.objects;
CREATE POLICY "admin_read_career_docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'career-documents' AND is_admin());

DROP POLICY IF EXISTS "admin_delete_career_docs" ON storage.objects;
CREATE POLICY "admin_delete_career_docs" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'career-documents' AND is_admin());

DROP POLICY IF EXISTS "admin_manage_career_photos" ON storage.objects;
CREATE POLICY "admin_manage_career_photos" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'career-photos' AND is_admin())
  WITH CHECK (bucket_id = 'career-photos' AND is_admin());

-- ============================================================
-- VERIFY (run manually after applying):
--   SELECT tablename, policyname, qual
--   FROM pg_policies
--   WHERE tablename IN ('payroll_slips','employee_payroll_profiles',
--     'payroll_settings','career_applications','career_employees',
--     'career_documents');
--   -> every qual should read: is_admin()
-- ============================================================
