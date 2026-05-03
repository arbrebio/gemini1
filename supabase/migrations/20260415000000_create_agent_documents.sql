-- ================================================================
-- AGENT DOCUMENTS
-- Migration: 20260415000000_create_agent_documents.sql
--
-- Stores metadata for documents uploaded by admins for each agent.
-- Files live in the private 'agent-documents' Supabase Storage bucket.
-- Agents access their own documents via signed URLs (server-generated).
-- ================================================================

-- ── Table ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agent_documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id      UUID NOT NULL REFERENCES public.sales_agent_profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('learning', 'catalog', 'pricing')),
  file_name     TEXT NOT NULL,
  file_path     TEXT NOT NULL,          -- path inside 'agent-documents' bucket
  file_type     TEXT NOT NULL,          -- MIME type
  file_size     BIGINT NOT NULL DEFAULT 0,
  uploaded_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agent_documents_agent_idx ON public.agent_documents(agent_id);
CREATE INDEX IF NOT EXISTS agent_documents_cat_idx   ON public.agent_documents(agent_id, category);

ALTER TABLE public.agent_documents ENABLE ROW LEVEL SECURITY;

-- Service role (server-side) bypasses RLS automatically.
-- Authenticated users (admin panel) cannot read this table directly
-- — all access goes through server API routes using service role key.
-- No policies needed for the admin panel (service role bypasses RLS).

-- Agents (anon/authenticated) cannot read via Supabase client directly.
-- All agent access goes through /api/sales-agent/documents which generates
-- signed URLs server-side.

-- ── Storage bucket ────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'agent-documents',
  'agent-documents',
  false,            -- PRIVATE — access only via signed URLs
  52428800,         -- 50 MB limit per file
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Service role has full access (no policy needed — bypasses RLS).
-- No public read: bucket is private.

-- ================================================================
-- VERIFICATION:
--   SELECT id, name, public FROM storage.buckets WHERE id = 'agent-documents';
--   SELECT id, agent_id, category, title FROM public.agent_documents LIMIT 10;
-- ================================================================
