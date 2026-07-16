-- ================================================================
-- ARBRE BIO AFRICA — PAYROLL: admin delete of validated slips + congés
-- Migration: 20260718000000_payroll_delete_and_conges.sql
-- ================================================================

-- ----------------------------------------------------------------
-- 1. Allow admins to delete a validated slip (to fix a mistake and
--    regenerate). Validated slips stay immutable to UPDATE — only
--    DELETE is now permitted. The admin API (requireAdminAuth) is
--    the sole caller of DELETE on payroll_slips.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION prevent_validated_slip_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status = 'validated' THEN
    RAISE EXCEPTION 'Un bulletin de paie validé est immuable (slip %)', OLD.id;
  END IF;
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at = NOW();
    RETURN NEW;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------
-- 2. Congés payés — fields needed to compute the CONGÉS block that
--    renderBulletin.ts already displays but which was always empty.
--    Acquisition follows the Ivorian Code du Travail: 2.2 jours
--    ouvrables per full month of service, running balance.
-- ----------------------------------------------------------------
ALTER TABLE employee_payroll_profiles
  ADD COLUMN IF NOT EXISTS leave_days_taken     NUMERIC(6,2) NOT NULL DEFAULT 0,  -- cumul jours de congé pris depuis l'embauche
  ADD COLUMN IF NOT EXISTS leave_last_start_date DATE,                            -- date de départ du dernier congé
  ADD COLUMN IF NOT EXISTS leave_last_end_date   DATE;                            -- date de reprise du dernier congé

COMMENT ON COLUMN employee_payroll_profiles.leave_days_taken IS
  'Cumul des jours de congé payé pris depuis la date d''ancienneté (mis à jour manuellement par un admin).';
