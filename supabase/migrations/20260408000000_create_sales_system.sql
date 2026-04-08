-- ================================================================
-- ARBRE BIO AFRICA — SALES MANAGEMENT SYSTEM
-- Migration: 20260408000000_create_sales_system.sql
--
-- Creates:
--   • sales_agent_profiles — links Supabase auth users → employees
--   • sales_records        — one row per sale
--   • is_sales_agent()     — RLS helper function
--   • sale-proofs storage bucket (private, PDF + images)
--   • Full RLS policies
-- ================================================================

-- ================================================================
-- TABLE 1: sales_agent_profiles
-- Links a Supabase auth.users row to (optionally) a career_employee.
-- Created/managed exclusively by super-admin via admin panel.
-- ================================================================
CREATE TABLE IF NOT EXISTS public.sales_agent_profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id      UUID REFERENCES public.career_employees(id) ON DELETE SET NULL,
  full_name        TEXT NOT NULL,
  email            TEXT NOT NULL UNIQUE,
  worker_id        TEXT,
  phone            TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  suspended_at     TIMESTAMPTZ,
  suspended_reason TEXT,
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sales_agent_profiles ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- TABLE 2: sales_records
-- One row per sale registered by a sales agent.
-- ================================================================
CREATE TABLE IF NOT EXISTS public.sales_records (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id              UUID NOT NULL REFERENCES public.sales_agent_profiles(id) ON DELETE RESTRICT,
  agent_name            TEXT NOT NULL,
  worker_id             TEXT,

  -- What was sold
  product_id            UUID REFERENCES public.admin_products(id) ON DELETE SET NULL,
  product_name          TEXT NOT NULL,
  quantity              NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price            NUMERIC(12,2) NOT NULL,
  total_amount          NUMERIC(12,2) NOT NULL,

  -- Client information
  client_name           TEXT NOT NULL,

  -- Payment details
  payment_method        TEXT NOT NULL CHECK (payment_method IN (
                          'wire_transfer', 'orange_money', 'mtn_money',
                          'moov_money', 'wave', 'cash'
                        )),
  transaction_reference TEXT,

  -- Proof of payment (uploaded file)
  proof_url             TEXT,
  proof_file_name       TEXT,

  -- Commission (frozen at the moment of sale creation — never retroactively changed)
  commission_rate       NUMERIC(5,2) NOT NULL,   -- 5.00 or 8.00 (percent)
  commission_amount     NUMERIC(12,2) NOT NULL,  -- total_amount * commission_rate / 100

  -- Validation workflow
  status                TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'validated', 'rejected')),
  validated_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  validated_at          TIMESTAMPTZ,
  rejection_reason      TEXT,

  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sales_records ENABLE ROW LEVEL SECURITY;

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_sales_records_agent_id
  ON public.sales_records(agent_id);
CREATE INDEX IF NOT EXISTS idx_sales_records_status
  ON public.sales_records(status);
CREATE INDEX IF NOT EXISTS idx_sales_records_created_at
  ON public.sales_records(created_at DESC);

-- ================================================================
-- TRIGGERS — auto-update updated_at (reuses existing function)
-- ================================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_sales_agent_profiles_updated_at'
  ) THEN
    CREATE TRIGGER set_sales_agent_profiles_updated_at
      BEFORE UPDATE ON public.sales_agent_profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_sales_records_updated_at'
  ) THEN
    CREATE TRIGGER set_sales_records_updated_at
      BEFORE UPDATE ON public.sales_records
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ================================================================
-- RLS HELPER: is_sales_agent()
-- Returns TRUE when the calling JWT belongs to an active agent.
-- Service_role bypasses RLS entirely (same model as is_admin()).
-- ================================================================
CREATE OR REPLACE FUNCTION public.is_sales_agent()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM   public.sales_agent_profiles
    WHERE  id        = auth.uid()
      AND  is_active = true
  );
$$;

COMMENT ON FUNCTION public.is_sales_agent() IS
  'Returns true when the authenticated JWT belongs to an active sales agent. '
  'Used in RLS policies. Service_role bypasses RLS and never calls this.';

-- ================================================================
-- RLS POLICIES: sales_agent_profiles
-- ================================================================

-- Agents can read their own profile; admins can read all
CREATE POLICY "sales_agent_profiles_select"
  ON public.sales_agent_profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR is_admin());

-- Only admins can insert/update/delete agent profiles
CREATE POLICY "sales_agent_profiles_admin_write"
  ON public.sales_agent_profiles FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "sales_agent_profiles_admin_update"
  ON public.sales_agent_profiles FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "sales_agent_profiles_admin_delete"
  ON public.sales_agent_profiles FOR DELETE TO authenticated
  USING (is_admin());

-- ================================================================
-- RLS POLICIES: sales_records
-- ================================================================

-- Agents see only their own sales; admins see all
CREATE POLICY "sales_records_select"
  ON public.sales_records FOR SELECT TO authenticated
  USING (agent_id = auth.uid() OR is_admin());

-- Only active sales agents can insert their own sales
CREATE POLICY "sales_records_agent_insert"
  ON public.sales_records FOR INSERT TO authenticated
  WITH CHECK (agent_id = auth.uid() AND is_sales_agent());

-- Only admins can update (validate/reject)
CREATE POLICY "sales_records_admin_update"
  ON public.sales_records FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- Only admins can delete
CREATE POLICY "sales_records_admin_delete"
  ON public.sales_records FOR DELETE TO authenticated
  USING (is_admin());

-- ================================================================
-- STORAGE BUCKET: sale-proofs (private)
-- Accepts: PDF + common image formats, max 15 MB
-- ================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sale-proofs',
  'sale-proofs',
  false,
  15728640,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp',
    'application/pdf'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Active agents can upload proofs
CREATE POLICY "sale_proofs_agent_upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'sale-proofs' AND is_sales_agent());

-- Agents can read their own uploads; admins can read all
CREATE POLICY "sale_proofs_read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'sale-proofs' AND (is_sales_agent() OR is_admin()));

-- ================================================================
-- VERIFICATION (run manually in SQL editor after migration):
--
--   SELECT * FROM public.sales_agent_profiles LIMIT 1;
--   SELECT * FROM public.sales_records LIMIT 1;
--   SELECT is_sales_agent();
--   SELECT id, name FROM storage.buckets WHERE id = 'sale-proofs';
-- ================================================================
