-- ================================================================
-- PASSWORD MANAGEMENT FOR SALES AGENTS
-- Adds must_change_password + temp_password to sales_agent_profiles
-- ================================================================

-- must_change_password: set to true when admin creates/resets an account
-- temp_password: the admin-generated plain-text password (visible to admin only,
--   cleared as soon as the agent sets their own password)
ALTER TABLE public.sales_agent_profiles
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS temp_password         TEXT;

-- Index for quickly finding agents who still need to change their password
CREATE INDEX IF NOT EXISTS idx_sales_agent_must_change_pw
  ON public.sales_agent_profiles (must_change_password)
  WHERE must_change_password = true;

-- Allow agents to update their own must_change_password and temp_password fields
-- (needed when they call the change-password API with service-role, but kept for completeness)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'sales_agent_profiles'
      AND policyname = 'sales_agent_profiles_self_pw_update'
  ) THEN
    CREATE POLICY "sales_agent_profiles_self_pw_update"
      ON public.sales_agent_profiles FOR UPDATE TO authenticated
      USING (id = auth.uid())
      WITH CHECK (id = auth.uid());
  END IF;
END $$;
