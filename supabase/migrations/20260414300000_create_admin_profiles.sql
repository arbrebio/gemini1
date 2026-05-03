-- ================================================================
-- CREATE admin_profiles TABLE
-- Migration: 20260414300000_create_admin_profiles.sql
--
-- This table was defined in an older migration that was never
-- applied to the live database. This migration creates it safely
-- using IF NOT EXISTS and is idempotent.
--
-- Stores role + display info for admin panel users.
-- Avatar URL is saved here after upload to admin-avatars bucket.
-- ================================================================

CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'super_admin'
                CHECK (role IN ('super_admin','sales_manager','inventory_manager','technician','viewer')),
  full_name   TEXT,
  phone       TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read all profiles
-- (used by Header.astro to show name/role/avatar)
CREATE POLICY "admin_profiles_select"
  ON public.admin_profiles FOR SELECT TO authenticated
  USING (true);

-- Users can only update their own profile row (avatar, name, phone, etc.)
CREATE POLICY "admin_profiles_update"
  ON public.admin_profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Service role can INSERT/DELETE (used when creating/removing admin accounts)
-- No INSERT policy for authenticated role — admin creation is server-side only.

-- ================================================================
-- Seed: insert the primary admin account if not already present.
-- Replace 'farms@arbrebio.com' with the actual admin email if different.
-- ================================================================
INSERT INTO public.admin_profiles (id, role, full_name)
SELECT id, 'super_admin', split_part(email, '@', 1)
FROM auth.users
WHERE email = 'farms@arbrebio.com'
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- VERIFICATION:
--   SELECT id, role, full_name FROM public.admin_profiles;
-- ================================================================
