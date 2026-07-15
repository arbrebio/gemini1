-- ================================================================
-- ARBRE BIO AFRICA — PAYROLL: admin-uploaded company logo
-- Migration: 20260717000000_add_payroll_logo.sql
-- ================================================================

ALTER TABLE payroll_settings ADD COLUMN IF NOT EXISTS logo_url TEXT;
