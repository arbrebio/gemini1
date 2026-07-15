-- ================================================================
-- ARBRE BIO AFRICA — PAYROLL SYSTEM (Bulletin de Paie, Côte d'Ivoire)
-- Migration: 20260716000000_create_payroll_system.sql
-- Replicates SAGE Paie configuration: ITS 2024 (réforme), CNPS, CMU, FDFP.
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------
-- 1. PAYROLL SETTINGS (single row — company identifiers + legal rules)
--    Rules live in JSONB so a change in law needs no redeploy.
--    Identifiers are TEXT: "2305213 D" keeps its trailing letter.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payroll_settings (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_cnps_number         TEXT NOT NULL DEFAULT '456271',
  company_contribuable_number TEXT NOT NULL DEFAULT '2305213 D',
  rules                       JSONB NOT NULL,
  effective_from              DATE NOT NULL DEFAULT '2024-01-01',
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO payroll_settings (company_cnps_number, company_contribuable_number, rules, effective_from)
SELECT '456271', '2305213 D', '{
  "its_brackets": [
    {"upTo": 75000,   "rate": 0},
    {"upTo": 240000,  "rate": 0.16},
    {"upTo": 800000,  "rate": 0.21},
    {"upTo": 2400000, "rate": 0.24},
    {"upTo": 8000000, "rate": 0.28},
    {"upTo": null,    "rate": 0.32}
  ],
  "ricf_per_half_share": 5500,
  "ricf_cap": 44000,
  "cnps_retraite": {"employee_rate": 0.063, "employer_rate": 0.077, "ceiling": 3375000},
  "prestations_familiales": {"rate": 0.0575, "ceiling": 75000},
  "accident_travail": {"rate": 0.02, "ceiling": 75000},
  "taxe_apprentissage_rate": 0.004,
  "fpc_rate": 0.006,
  "fpc_regularisation_rate": 0.006,
  "its_patronal_rate": 0.012,
  "cmu_unit": 1000,
  "monthly_hours": 236.36
}'::jsonb, '2024-01-01'
WHERE NOT EXISTS (SELECT 1 FROM payroll_settings);

-- ----------------------------------------------------------------
-- 2. EMPLOYEE PAYROLL PROFILES (1:1 with career_employees)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employee_payroll_profiles (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id           UUID NOT NULL UNIQUE REFERENCES career_employees(id) ON DELETE CASCADE,
  matricule             TEXT NOT NULL UNIQUE,           -- ex: ABA-CI11
  base_salary           NUMERIC(14,2) NOT NULL DEFAULT 0,   -- code 100 Salaire de base
  sursalaire            NUMERIC(14,2) NOT NULL DEFAULT 0,   -- code 190 Sursalaire
  transport_allowance   NUMERIC(14,2) NOT NULL DEFAULT 0,   -- code 10200 Indemnité de Transport
  parts_igr             NUMERIC(3,1) NOT NULL DEFAULT 1.0 CHECK (parts_igr >= 1.0 AND parts_igr <= 5.0),
  cmu_dependents        INT NOT NULL DEFAULT 0 CHECK (cmu_dependents >= 0),
  employee_cnps_number  TEXT,
  bank_account          TEXT,                           -- N° de compte (RIB)
  category              TEXT,                           -- Catégorie
  grade                 TEXT,
  salary_type           TEXT NOT NULL DEFAULT 'Mensuel',
  payment_method        TEXT NOT NULL DEFAULT 'Virement',
  seniority_date        DATE,                           -- Date ancienneté (défaut: start_date)
  extra_lines           JSONB NOT NULL DEFAULT '[]',    -- [{code,label,amount,taxable}]
  active                BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 3. PAYROLL SLIPS (immutable once validated)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payroll_slips (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id      UUID NOT NULL REFERENCES career_employees(id) ON DELETE CASCADE,
  period_year      INT NOT NULL,
  period_month     INT NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  period_start     DATE NOT NULL,
  period_end       DATE NOT NULL,
  payment_date     DATE NOT NULL,
  profile_snapshot JSONB NOT NULL,   -- payroll profile + employee identity at generation time
  rules_snapshot   JSONB NOT NULL,   -- rules used (reproducibility)
  company_snapshot JSONB NOT NULL DEFAULT '{}',  -- CNPS/NCC identifiers at generation time
  lines            JSONB NOT NULL,   -- computed rows (code, label, nombre, base, taux/gain/retenue sal+pat)
  totals           JSONB NOT NULL,   -- brut, retenues sal/pat, net à payer, brut imposable...
  cumuls           JSONB NOT NULL,   -- year-to-date figures
  conges           JSONB NOT NULL DEFAULT '{}',
  status           TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','validated')),
  validated_at     TIMESTAMPTZ,
  created_by       UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (employee_id, period_year, period_month)
);

-- ----------------------------------------------------------------
-- TRIGGERS
-- ----------------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_payroll_settings_updated_at') THEN
    CREATE TRIGGER set_payroll_settings_updated_at BEFORE UPDATE ON payroll_settings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_employee_payroll_profiles_updated_at') THEN
    CREATE TRIGGER set_employee_payroll_profiles_updated_at BEFORE UPDATE ON employee_payroll_profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Validated slips are immutable (only draft→validated transition is allowed once)
CREATE OR REPLACE FUNCTION prevent_validated_slip_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status = 'validated' THEN
    RAISE EXCEPTION 'Un bulletin de paie validé est immuable (slip %)', OLD.id;
  END IF;
  IF TG_OP = 'DELETE' AND OLD.status = 'validated' THEN
    RAISE EXCEPTION 'Un bulletin de paie validé ne peut pas être supprimé (slip %)', OLD.id;
  END IF;
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at = NOW();
    RETURN NEW;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'guard_payroll_slips_immutable') THEN
    CREATE TRIGGER guard_payroll_slips_immutable BEFORE UPDATE OR DELETE ON payroll_slips
      FOR EACH ROW EXECUTE FUNCTION prevent_validated_slip_changes();
  END IF;
END $$;

-- ----------------------------------------------------------------
-- INDEXES
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_payroll_profiles_employee ON employee_payroll_profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_slips_employee_year ON payroll_slips(employee_id, period_year);
CREATE INDEX IF NOT EXISTS idx_payroll_slips_period ON payroll_slips(period_year, period_month);
CREATE INDEX IF NOT EXISTS idx_payroll_slips_status ON payroll_slips(status);

-- ----------------------------------------------------------------
-- ROW LEVEL SECURITY (service-role bypasses; authenticated = admin panel)
-- ----------------------------------------------------------------
ALTER TABLE payroll_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_payroll_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_slips ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payroll_settings' AND policyname = 'admin_all_payroll_settings') THEN
    CREATE POLICY "admin_all_payroll_settings" ON payroll_settings
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'employee_payroll_profiles' AND policyname = 'admin_all_payroll_profiles') THEN
    CREATE POLICY "admin_all_payroll_profiles" ON employee_payroll_profiles
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payroll_slips' AND policyname = 'admin_all_payroll_slips') THEN
    CREATE POLICY "admin_all_payroll_slips" ON payroll_slips
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;
