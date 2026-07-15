-- ================================================================
-- SALES AGENT NOTIFICATIONS
-- Migration: 20260715000000_create_agent_notifications.sql
--
-- Per-agent notification feed (mirrors admin_notifications, but scoped
-- to a single agent via agent_id) so the sales-agent portal can show a
-- notification bell in its header, same as the admin panel's.
-- Rows are created server-side (service role) whenever an admin
-- validates/rejects one of the agent's sales.
-- ================================================================

CREATE TABLE IF NOT EXISTS public.agent_notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    UUID NOT NULL REFERENCES public.sales_agent_profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'default',
  message     TEXT NOT NULL,
  entity_id   TEXT,
  entity_type TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_notifications_agent ON public.agent_notifications(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_notifications_unread ON public.agent_notifications(agent_id, is_read);

ALTER TABLE public.agent_notifications ENABLE ROW LEVEL SECURITY;

-- Locked to service-role only — the /api/sales-agent/notifications route
-- verifies the agent's JWT itself and always queries with the service key,
-- matching this codebase's convention for the sales-agent and terrain systems.
