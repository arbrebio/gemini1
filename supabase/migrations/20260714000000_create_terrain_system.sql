-- ================================================================
-- ARBRE BIO AFRICA — TERRAIN (FIELD OPERATIONS) SYSTEM
-- Migration: 20260714000000_create_terrain_system.sql
--
-- Replaces the previous browser-localStorage-only "Terrain" platform
-- (public/terrain/*.html + assets/core.js) with a real Supabase-backed
-- system: Supabase Auth for login, real tables for projects/visits/
-- tasks, and Supabase Storage for photos. Access control is enforced
-- entirely in the Astro API routes (service-role client + a custom
-- terrainAuth guard), matching this codebase's existing convention for
-- career/sales-agent/admin systems — RLS is locked to service-role only.
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------
-- 1. TERRAIN PROFILES — one row per auth.users account, role-gated
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS terrain_profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name             TEXT NOT NULL,
  email                 TEXT NOT NULL UNIQUE,
  role                  TEXT NOT NULL CHECK (role IN ('super_admin','engineer','technician')),
  phone                 TEXT,
  avatar_url            TEXT,
  active                BOOLEAN NOT NULL DEFAULT TRUE,
  -- Admin-issued temp password flow (mirrors sales_agent_profiles)
  must_change_password  BOOLEAN NOT NULL DEFAULT TRUE,
  temp_password         TEXT,
  created_by            UUID REFERENCES auth.users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_terrain_profiles_role ON terrain_profiles(role);
CREATE INDEX IF NOT EXISTS idx_terrain_profiles_active ON terrain_profiles(active);

-- ----------------------------------------------------------------
-- 2. PASSWORD RESET REQUESTS — replaces the old localStorage
--    "ab_reset_requests" mechanism; now visible to the admin from any
--    device instead of being trapped in one browser's local storage.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS terrain_password_reset_requests (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL UNIQUE REFERENCES terrain_profiles(id) ON DELETE CASCADE,
  requested_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 3. TERRAIN PROJECTS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS terrain_projects (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title          TEXT NOT NULL,
  client_name    TEXT NOT NULL,
  client_phone   TEXT,
  location       TEXT,
  zone           TEXT,
  project_types  TEXT[] NOT NULL DEFAULT '{}',
  status         TEXT NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active','confirmed','in_progress','archived')),
  assigned_to    UUID REFERENCES terrain_profiles(id),
  started_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_terrain_projects_assigned ON terrain_projects(assigned_to);
CREATE INDEX IF NOT EXISTS idx_terrain_projects_status ON terrain_projects(status);

-- ----------------------------------------------------------------
-- 4. TERRAIN VISITS — the 10-step site-visit intake form.
--    Core identification fields are real columns (frequently
--    filtered/displayed); the technical step-specific sections are
--    grouped as JSONB to avoid an unwieldy ~70-column table while
--    still preserving every field from the original form.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS terrain_visits (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id           UUID REFERENCES terrain_projects(id) ON DELETE SET NULL,
  visited_by           UUID NOT NULL REFERENCES terrain_profiles(id),
  status               TEXT NOT NULL DEFAULT 'submitted'
                       CHECK (status IN ('submitted','confirmed','in_progress')),

  -- Step 1 — Identification
  client_name          TEXT NOT NULL,
  client_phone         TEXT,
  client_email         TEXT,
  zone                 TEXT,
  site_address         TEXT,
  site_gps             TEXT,
  visit_date           DATE,
  land_area            TEXT,
  land_tenure          TEXT,
  client_experience    TEXT,

  -- Step 2 — Project types & objective
  project_types        TEXT[] NOT NULL DEFAULT '{}',
  project_objective     TEXT,
  organic_cert          TEXT,
  project_budget_range  TEXT,

  -- Steps 3-7 — technical sections (each null unless that project type applies)
  greenhouse_data       JSONB,
  irrigation_data       JSONB,
  substrate_data        JSONB,
  crops_data            JSONB,
  equipment_data        JSONB,

  -- Step 8 — Site observations
  site_observations     JSONB,

  -- Step 9 — Photos: [{ url, label, uploaded_at }]
  photos                JSONB NOT NULL DEFAULT '[]',
  photo_notes           TEXT,

  -- Step 10 — Summary
  blocking_issues       TEXT,
  recommendations       TEXT,
  next_steps            TEXT,
  estimated_budget      TEXT,

  confirmed_at          TIMESTAMPTZ,
  started_at            TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_terrain_visits_project ON terrain_visits(project_id);
CREATE INDEX IF NOT EXISTS idx_terrain_visits_visited_by ON terrain_visits(visited_by);
CREATE INDEX IF NOT EXISTS idx_terrain_visits_status ON terrain_visits(status);
CREATE INDEX IF NOT EXISTS idx_terrain_visits_created_at ON terrain_visits(created_at DESC);

-- ----------------------------------------------------------------
-- 5. TERRAIN TASKS (kanban: todo / in_progress / review / done)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS terrain_tasks (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id     UUID NOT NULL REFERENCES terrain_projects(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  description    TEXT,
  priority       TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
  category       TEXT,
  due_date       DATE,
  status         TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','in_progress','review','done')),
  assignees      UUID[] NOT NULL DEFAULT '{}',
  completed_by   UUID REFERENCES terrain_profiles(id),
  completed_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_terrain_tasks_project ON terrain_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_terrain_tasks_status ON terrain_tasks(status);
CREATE INDEX IF NOT EXISTS idx_terrain_tasks_assignees ON terrain_tasks USING GIN(assignees);

-- ----------------------------------------------------------------
-- 6. TASK COMMENTS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS terrain_task_comments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id      UUID NOT NULL REFERENCES terrain_tasks(id) ON DELETE CASCADE,
  author_id    UUID NOT NULL REFERENCES terrain_profiles(id),
  text         TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_terrain_task_comments_task ON terrain_task_comments(task_id);

-- ----------------------------------------------------------------
-- 7. TASK PROOF PHOTOS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS terrain_task_photos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id       UUID NOT NULL REFERENCES terrain_tasks(id) ON DELETE CASCADE,
  photo_url     TEXT NOT NULL,
  label         TEXT,
  uploaded_by   UUID NOT NULL REFERENCES terrain_profiles(id),
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_terrain_task_photos_task ON terrain_task_photos(task_id);

-- ----------------------------------------------------------------
-- TRIGGERS — auto-update updated_at (reuses the shared function
-- created by the career-system migration if it already exists)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_terrain_profiles_updated_at') THEN
    CREATE TRIGGER set_terrain_profiles_updated_at BEFORE UPDATE ON terrain_profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_terrain_projects_updated_at') THEN
    CREATE TRIGGER set_terrain_projects_updated_at BEFORE UPDATE ON terrain_projects
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_terrain_visits_updated_at') THEN
    CREATE TRIGGER set_terrain_visits_updated_at BEFORE UPDATE ON terrain_visits
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_terrain_tasks_updated_at') THEN
    CREATE TRIGGER set_terrain_tasks_updated_at BEFORE UPDATE ON terrain_tasks
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ----------------------------------------------------------------
-- ROW LEVEL SECURITY — locked to service-role only. All access
-- control (super_admin vs engineer vs technician, "own records only",
-- etc.) is enforced in the Astro API routes via lib/terrainAuth.ts,
-- matching career_employees / career_admin_settings / admin_notifications
-- elsewhere in this codebase.
-- ----------------------------------------------------------------
ALTER TABLE terrain_profiles                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE terrain_password_reset_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE terrain_projects                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE terrain_visits                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE terrain_tasks                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE terrain_task_comments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE terrain_task_photos              ENABLE ROW LEVEL SECURITY;

CREATE POLICY "terrain_profiles_service_only"                ON terrain_profiles                FOR ALL USING (false);
CREATE POLICY "terrain_password_reset_requests_service_only" ON terrain_password_reset_requests  FOR ALL USING (false);
CREATE POLICY "terrain_projects_service_only"                ON terrain_projects                 FOR ALL USING (false);
CREATE POLICY "terrain_visits_service_only"                  ON terrain_visits                   FOR ALL USING (false);
CREATE POLICY "terrain_tasks_service_only"                   ON terrain_tasks                    FOR ALL USING (false);
CREATE POLICY "terrain_task_comments_service_only"            ON terrain_task_comments            FOR ALL USING (false);
CREATE POLICY "terrain_task_photos_service_only"               ON terrain_task_photos              FOR ALL USING (false);

-- ----------------------------------------------------------------
-- STORAGE BUCKET for terrain photos (visit photos, task proof photos,
-- profile avatars). Public read (photos are internal-facing but not
-- sensitive; signed URLs would add friction for field use over 3G/4G).
-- ----------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'terrain-photos',
  'terrain-photos',
  TRUE,
  8388608, -- 8MB
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/heic']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public_read_terrain_photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'terrain-photos');

CREATE POLICY "service_manage_terrain_photos" ON storage.objects
  FOR ALL USING (bucket_id = 'terrain-photos' AND auth.role() = 'service_role');
