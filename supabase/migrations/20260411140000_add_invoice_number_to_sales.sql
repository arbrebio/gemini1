-- Add invoice number to sales records (generated on validation)
ALTER TABLE sales_records ADD COLUMN IF NOT EXISTS invoice_number TEXT UNIQUE;

-- Index for fast lookup by invoice number
CREATE INDEX IF NOT EXISTS idx_sales_records_invoice_number ON sales_records(invoice_number);

-- Ensure the created_by tracking columns also exist on admin_customers
-- (safe to run even if already applied)
ALTER TABLE admin_customers ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE admin_customers ADD COLUMN IF NOT EXISTS created_by_name TEXT;
CREATE INDEX IF NOT EXISTS idx_admin_customers_created_by ON admin_customers(created_by);
