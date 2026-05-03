-- ================================================================
-- SECURITY FIX: Enable RLS on sales_line_items
-- Migration: 20260414100000_enable_rls_sales_line_items.sql
--
-- The sales_line_items table was created without RLS, making it
-- publicly accessible (Supabase critical warning: rls_disabled_in_public).
--
-- Security model matches the live DB pattern:
--   • Agents access their own data via authenticated JWT + auth.uid() check
--   • Admins access everything via service_role key (bypasses RLS in API routes)
--   • No is_admin() dependency (function not present in live DB)
-- ================================================================

ALTER TABLE public.sales_line_items ENABLE ROW LEVEL SECURITY;

-- Agents can read line items that belong to their own sales
CREATE POLICY "sales_line_items_select"
  ON public.sales_line_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sales_records sr
      WHERE sr.id = sale_id
        AND sr.agent_id = auth.uid()
    )
  );

-- Only active sales agents can insert line items for their own sales.
-- Admin inserts go through service_role key (bypasses RLS).
CREATE POLICY "sales_line_items_agent_insert"
  ON public.sales_line_items FOR INSERT TO authenticated
  WITH CHECK (
    is_sales_agent() AND
    EXISTS (
      SELECT 1 FROM public.sales_records sr
      WHERE sr.id = sale_id
        AND sr.agent_id = auth.uid()
    )
  );
