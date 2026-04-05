-- ================================================================
-- ARBRE BIO AFRICA — CAREER SYSTEM
-- Migration: 20260404000000_create_career_system.sql
-- ================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------
-- 1. CAREER JOBS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS career_jobs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_en      TEXT NOT NULL,
  title_fr      TEXT NOT NULL,
  title_es      TEXT,
  title_af      TEXT,
  slug          TEXT UNIQUE NOT NULL,
  description_en TEXT NOT NULL,  -- Accepts raw HTML content
  description_fr TEXT NOT NULL,
  description_es TEXT,
  description_af TEXT,
  requirements_en TEXT,
  requirements_fr TEXT,
  requirements_es TEXT,
  requirements_af TEXT,
  location      TEXT NOT NULL DEFAULT 'Côte d''Ivoire',
  job_type      TEXT NOT NULL DEFAULT 'full_time'
                CHECK (job_type IN ('full_time','part_time','contract','internship','volunteer')),
  department    TEXT,
  salary_range  TEXT,
  status        TEXT NOT NULL DEFAULT 'published'
                CHECK (status IN ('draft','published','closed','archived')),
  deadline      DATE,
  positions     INT NOT NULL DEFAULT 1,
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 2. CAREER APPLICATIONS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS career_applications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id          UUID NOT NULL REFERENCES career_jobs(id) ON DELETE CASCADE,
  -- Applicant info
  first_name      TEXT NOT NULL,
  middle_name     TEXT,
  last_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  birth_date      DATE,
  nationality     TEXT,
  address         TEXT,
  city            TEXT,
  country         TEXT DEFAULT 'Côte d''Ivoire',
  cover_letter    TEXT,
  -- Application tracking
  status          TEXT NOT NULL DEFAULT 'submitted'
                  CHECK (status IN (
                    'submitted','under_review','interview_scheduled',
                    'interview_done','offer_sent','hired','rejected','withdrawn'
                  )),
  portal_token    TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  portal_email    TEXT NOT NULL,
  -- Result / employee link
  employee_id     UUID,
  admin_notes     TEXT,
  rejection_reason TEXT,
  -- Timestamps
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at     TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 3. APPLICATION DOCUMENTS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS career_documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id  UUID NOT NULL REFERENCES career_applications(id) ON DELETE CASCADE,
  doc_type        TEXT NOT NULL
                  CHECK (doc_type IN ('cv','id_card','diploma','certificate','cover_letter','other')),
  file_name       TEXT NOT NULL,
  file_url        TEXT NOT NULL,   -- Supabase Storage URL
  file_size       INT,
  mime_type       TEXT,
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 4. APPLICATION TIMELINE (status history)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS career_application_timeline (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id  UUID NOT NULL REFERENCES career_applications(id) ON DELETE CASCADE,
  status          TEXT NOT NULL,
  note            TEXT,
  changed_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 5. CAREER EMPLOYEES (hired & onboarded)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS career_employees (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id  UUID REFERENCES career_applications(id),
  -- Personal info
  first_name      TEXT NOT NULL,
  middle_name     TEXT,
  last_name       TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  phone           TEXT,
  birth_date      DATE NOT NULL,
  nationality     TEXT,
  address         TEXT,
  city            TEXT,
  country         TEXT DEFAULT 'Côte d''Ivoire',
  photo_url       TEXT,
  -- Worker identification
  worker_id       TEXT NOT NULL UNIQUE, -- e.g. ABA26CI010290KKA
  qr_code_url     TEXT,                 -- Stored QR image URL
  -- Employment details
  job_title       TEXT NOT NULL,
  department      TEXT,
  start_date      DATE,
  contract_type   TEXT DEFAULT 'CDI',
  contract_url    TEXT,                 -- Signed contract document URL
  -- Status
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','inactive','terminated','on_leave')),
  -- Portal access
  portal_token    TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  -- Timestamps
  hired_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES auth.users(id),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 6. CAREER ADMIN CREDENTIALS (single record)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS career_admin_settings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_email     TEXT NOT NULL DEFAULT 'careers-admin@arbrebio.com',
  first_login     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- TRIGGERS — auto-update updated_at
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_career_jobs_updated_at') THEN
    CREATE TRIGGER set_career_jobs_updated_at BEFORE UPDATE ON career_jobs
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_career_applications_updated_at') THEN
    CREATE TRIGGER set_career_applications_updated_at BEFORE UPDATE ON career_applications
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_career_employees_updated_at') THEN
    CREATE TRIGGER set_career_employees_updated_at BEFORE UPDATE ON career_employees
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ----------------------------------------------------------------
-- INDEXES
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_career_jobs_status ON career_jobs(status);
CREATE INDEX IF NOT EXISTS idx_career_jobs_slug ON career_jobs(slug);
CREATE INDEX IF NOT EXISTS idx_career_applications_job ON career_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_career_applications_status ON career_applications(status);
CREATE INDEX IF NOT EXISTS idx_career_applications_email ON career_applications(email);
CREATE INDEX IF NOT EXISTS idx_career_applications_token ON career_applications(portal_token);
CREATE INDEX IF NOT EXISTS idx_career_employees_worker_id ON career_employees(worker_id);
CREATE INDEX IF NOT EXISTS idx_career_employees_email ON career_employees(email);
CREATE INDEX IF NOT EXISTS idx_career_employees_token ON career_employees(portal_token);

-- ----------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------
ALTER TABLE career_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_application_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_admin_settings ENABLE ROW LEVEL SECURITY;

-- Public can read published jobs
CREATE POLICY "public_read_published_jobs" ON career_jobs
  FOR SELECT USING (status = 'published');

-- Admin full access to jobs
CREATE POLICY "admin_all_jobs" ON career_jobs
  FOR ALL USING (auth.role() = 'authenticated');

-- Applications: admin full access
CREATE POLICY "admin_all_applications" ON career_applications
  FOR ALL USING (auth.role() = 'authenticated');

-- Documents: admin full access
CREATE POLICY "admin_all_documents" ON career_documents
  FOR ALL USING (auth.role() = 'authenticated');

-- Timeline: admin full access
CREATE POLICY "admin_all_timeline" ON career_application_timeline
  FOR ALL USING (auth.role() = 'authenticated');

-- Employees: admin full access
CREATE POLICY "admin_all_employees" ON career_employees
  FOR ALL USING (auth.role() = 'authenticated');

-- Career admin settings: admin only
CREATE POLICY "admin_career_settings" ON career_admin_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- ----------------------------------------------------------------
-- STORAGE BUCKET for career documents
-- ----------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'career-documents',
  'career-documents',
  FALSE,
  10485760, -- 10MB limit
  ARRAY['application/pdf','image/jpeg','image/jpg','image/png','application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

-- Public read on career-employee-photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'career-photos',
  'career-photos',
  TRUE,
  5242880, -- 5MB
  ARRAY['image/jpeg','image/jpg','image/png','image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "anon_upload_career_docs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'career-documents');

CREATE POLICY "admin_read_career_docs" ON storage.objects
  FOR SELECT USING (bucket_id = 'career-documents' AND auth.role() = 'authenticated');

CREATE POLICY "admin_delete_career_docs" ON storage.objects
  FOR DELETE USING (bucket_id = 'career-documents' AND auth.role() = 'authenticated');

CREATE POLICY "public_read_career_photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'career-photos');

CREATE POLICY "admin_manage_career_photos" ON storage.objects
  FOR ALL USING (bucket_id = 'career-photos' AND auth.role() = 'authenticated');
