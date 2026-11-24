-- ================================================================
-- ARBRE BIO AFRICA — UNIFIED STAFF IDENTITY, ACTIVITY LOG, HR PORTAL
-- Migration: 20261124000000_staff_matricule_activity_hr.sql
--
-- 1. career_employees.matricule — one company-wide employee number,
--    defaulting to the Worker ID (ARB-YY-NNNNNN) on insert. Payroll
--    profiles reuse it, so payroll and HR always show the same number.
-- 2. employee_id links on terrain_profiles and admin_profiles
--    (sales_agent_profiles already has one), so every platform account
--    can be traced back to an employee and their matricule.
-- 3. hr_staff — accounts for the separate HR & Payroll portal (/hr/),
--    created by an admin, with per-area permissions.
-- 4. activity_log — append-only audit trail of actions across the
--    admin, HR, terrain and sales portals.
--
-- Idempotent: safe to run more than once.
-- ================================================================

-- ----------------------------------------------------------------
-- 1. MATRICULE
-- ----------------------------------------------------------------
ALTER TABLE public.career_employees ADD COLUMN IF NOT EXISTS matricule TEXT;

-- Backfill from existing payroll profiles first (those numbers are
-- already printed on bulletins and must not change).
UPDATE public.career_employees e
   SET matricule = p.matricule
  FROM public.employee_payroll_profiles p
 WHERE p.employee_id = e.id
   AND e.matricule IS NULL
   AND p.matricule IS NOT NULL
   AND btrim(p.matricule) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS career_employees_matricule_key
  ON public.career_employees (matricule);

-- Default matricule = the employee's Worker ID (ARB-YY-NNNNNN), which is
-- generated at hire, emailed to the employee and printed on the ID card.
-- It can be changed later from the employee record.
CREATE OR REPLACE FUNCTION public.career_employees_assign_matricule()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.matricule IS NULL OR btrim(NEW.matricule) = '' THEN
    NEW.matricule := NEW.worker_id;
  ELSE
    NEW.matricule := upper(btrim(NEW.matricule));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_career_employees_matricule ON public.career_employees;
CREATE TRIGGER trg_career_employees_matricule
  BEFORE INSERT OR UPDATE OF matricule ON public.career_employees
  FOR EACH ROW EXECUTE FUNCTION public.career_employees_assign_matricule();

-- Backfill everyone still without a number.
UPDATE public.career_employees SET matricule = worker_id WHERE matricule IS NULL;

ALTER TABLE public.career_employees ALTER COLUMN matricule SET NOT NULL;

-- Payroll profile matricule always mirrors the employee's matricule.
CREATE OR REPLACE FUNCTION public.payroll_profile_sync_matricule()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE m TEXT;
BEGIN
  SELECT matricule INTO m FROM public.career_employees WHERE id = NEW.employee_id;
  IF m IS NOT NULL THEN NEW.matricule := m; END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_payroll_profile_matricule ON public.employee_payroll_profiles;
CREATE TRIGGER trg_payroll_profile_matricule
  BEFORE INSERT OR UPDATE ON public.employee_payroll_profiles
  FOR EACH ROW EXECUTE FUNCTION public.payroll_profile_sync_matricule();

CREATE OR REPLACE FUNCTION public.career_employees_propagate_matricule()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.matricule IS DISTINCT FROM OLD.matricule THEN
    UPDATE public.employee_payroll_profiles SET matricule = NEW.matricule WHERE employee_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_career_employees_matricule_propagate ON public.career_employees;
CREATE TRIGGER trg_career_employees_matricule_propagate
  AFTER UPDATE OF matricule ON public.career_employees
  FOR EACH ROW EXECUTE FUNCTION public.career_employees_propagate_matricule();

-- Bring existing payroll profiles in line (no-op where already equal).
UPDATE public.employee_payroll_profiles p
   SET matricule = e.matricule
  FROM public.career_employees e
 WHERE e.id = p.employee_id AND p.matricule IS DISTINCT FROM e.matricule;

-- ----------------------------------------------------------------
-- 2. LINK PLATFORM ACCOUNTS TO EMPLOYEES
-- ----------------------------------------------------------------
ALTER TABLE public.terrain_profiles
  ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES public.career_employees(id) ON DELETE SET NULL;
ALTER TABLE public.admin_profiles
  ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES public.career_employees(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS terrain_profiles_employee_id_key
  ON public.terrain_profiles (employee_id) WHERE employee_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS admin_profiles_employee_id_key
  ON public.admin_profiles (employee_id) WHERE employee_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS sales_agent_profiles_employee_id_idx
  ON public.sales_agent_profiles (employee_id);

-- ----------------------------------------------------------------
-- 3. HR & PAYROLL PORTAL ACCOUNTS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hr_staff (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id           UUID REFERENCES public.career_employees(id) ON DELETE SET NULL,
  full_name             TEXT NOT NULL,
  email                 TEXT NOT NULL UNIQUE,
  -- Areas this person may use: recruitment (jobs + applications),
  -- employees (records, contracts, ID cards), payroll (salaries, bulletins).
  permissions           TEXT[] NOT NULL DEFAULT ARRAY['recruitment','employees']::TEXT[]
                        CHECK (permissions <@ ARRAY['recruitment','employees','payroll']::TEXT[]),
  active                BOOLEAN NOT NULL DEFAULT TRUE,
  must_change_password  BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at         TIMESTAMPTZ,
  created_by            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS hr_staff_employee_id_key
  ON public.hr_staff (employee_id) WHERE employee_id IS NOT NULL;

DROP TRIGGER IF EXISTS trg_hr_staff_updated_at ON public.hr_staff;
CREATE TRIGGER trg_hr_staff_updated_at
  BEFORE UPDATE ON public.hr_staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Server-side (service role) access only, like terrain/sales profiles.
ALTER TABLE public.hr_staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hr_staff_service_only" ON public.hr_staff;
CREATE POLICY "hr_staff_service_only" ON public.hr_staff FOR ALL USING (false) WITH CHECK (false);

-- ----------------------------------------------------------------
-- 4. ACTIVITY LOG (append-only)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_log (
  id               BIGSERIAL PRIMARY KEY,
  occurred_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  portal           TEXT NOT NULL CHECK (portal IN ('admin','hr','terrain','sales','system')),
  actor_id         UUID,                 -- auth.users id (kept even if the account is deleted)
  actor_kind       TEXT,                 -- admin | hr | terrain | sales_agent | unknown
  actor_name       TEXT,
  actor_email      TEXT,
  actor_employee_id UUID,
  actor_matricule  TEXT,
  action           TEXT NOT NULL,        -- machine key, e.g. careers.employees.create
  summary          TEXT NOT NULL,        -- human label, e.g. "Created employee"
  method           TEXT,
  path             TEXT,
  status           INT,
  entity_id        TEXT,
  details          JSONB NOT NULL DEFAULT '{}'::JSONB,
  ip               TEXT,
  user_agent       TEXT
);

CREATE INDEX IF NOT EXISTS activity_log_occurred_idx ON public.activity_log (occurred_at DESC);
CREATE INDEX IF NOT EXISTS activity_log_actor_idx    ON public.activity_log (actor_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS activity_log_employee_idx ON public.activity_log (actor_employee_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS activity_log_portal_idx   ON public.activity_log (portal, occurred_at DESC);
CREATE INDEX IF NOT EXISTS activity_log_entity_idx   ON public.activity_log (entity_id);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "activity_log_admin_read" ON public.activity_log;
CREATE POLICY "activity_log_admin_read" ON public.activity_log FOR SELECT USING (public.is_admin());
-- No INSERT/UPDATE/DELETE policies: only the server (service role) writes,
-- and nobody can edit or erase history from the browser.

-- Entries can never be rewritten, even by the service role. (Deleting old
-- rows stays possible from the SQL editor for retention clean-up.)
CREATE OR REPLACE FUNCTION public.activity_log_immutable()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'activity_log is append-only';
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_activity_log_immutable ON public.activity_log;
CREATE TRIGGER trg_activity_log_immutable
  BEFORE UPDATE ON public.activity_log
  FOR EACH ROW EXECUTE FUNCTION public.activity_log_immutable();

-- ================================================================
-- VERIFICATION:
--   SELECT matricule, first_name, last_name FROM career_employees ORDER BY matricule;
--   SELECT e.matricule, p.matricule FROM career_employees e
--     JOIN employee_payroll_profiles p ON p.employee_id = e.id WHERE e.matricule <> p.matricule;  -- expect 0 rows
--   SELECT count(*) FROM activity_log;
-- ================================================================
