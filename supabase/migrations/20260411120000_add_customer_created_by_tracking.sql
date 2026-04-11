-- Add customer registration tracking
-- Tracks which sales agent registered each customer

ALTER TABLE admin_customers
ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN created_by_name TEXT;

-- Add index for filtering/sorting by agent
CREATE INDEX idx_admin_customers_created_by ON admin_customers(created_by);

-- Add comment for clarity
COMMENT ON COLUMN admin_customers.created_by IS 'UUID of the sales agent who registered this customer';
COMMENT ON COLUMN admin_customers.created_by_name IS 'Full name of the sales agent who registered this customer (denormalized for display)';
