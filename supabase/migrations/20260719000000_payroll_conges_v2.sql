-- ================================================================
-- ARBRE BIO AFRICA — PAYROLL: congés model correction
-- Migration: 20260719000000_payroll_conges_v2.sql
--
-- The initial congés implementation (20260718000000) modeled leave taken as
-- a lifetime cumulative field on the employee's payroll PROFILE. Comparing
-- against a real SAGE bulletin proved this wrong: "congé pris" and its dates
-- are PER PAY PERIOD facts that belong on the slip itself (payroll_slips
-- already has a `conges` JSONB column for exactly this), with the running
-- balance carried forward slip-to-slip like `cumuls` already is. Drop the
-- profile columns added by mistake.
-- ================================================================

ALTER TABLE employee_payroll_profiles
  DROP COLUMN IF EXISTS leave_days_taken,
  DROP COLUMN IF EXISTS leave_last_start_date,
  DROP COLUMN IF EXISTS leave_last_end_date;
