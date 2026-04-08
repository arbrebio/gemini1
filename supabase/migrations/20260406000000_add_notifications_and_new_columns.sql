-- ============================================================
-- Migration: Add notifications table + new columns
-- Date: 2026-04-06
-- ============================================================

-- 1. Add photo_url to admin_products
ALTER TABLE admin_products
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 2. Add whatsapp_number to career_employees
ALTER TABLE career_employees
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- 3. Add employee_id to admin_project_tasks (FK to career_employees)
ALTER TABLE admin_project_tasks
  ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES career_employees(id) ON DELETE SET NULL;

-- 4. Create admin_notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type         TEXT NOT NULL DEFAULT 'default',
  message      TEXT NOT NULL,
  entity_id    UUID,
  entity_type  TEXT,
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast unread count polling
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read
  ON admin_notifications (is_read);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at
  ON admin_notifications (created_at DESC);

-- ============================================================
-- RLS: disable RLS on admin_notifications (admin-only table,
-- accessed exclusively via service-role key from API routes)
-- ============================================================
ALTER TABLE admin_notifications DISABLE ROW LEVEL SECURITY;
