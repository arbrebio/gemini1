-- Enable sales agents to register multiple products per sale
-- Creates sales_line_items table to replace single product columns

-- Create sales_line_items table
CREATE TABLE IF NOT EXISTS sales_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales_records(id) ON DELETE CASCADE,
  product_id UUID REFERENCES admin_products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  line_total NUMERIC(12, 2) NOT NULL GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient lookups
CREATE INDEX idx_sales_line_items_sale_id ON sales_line_items(sale_id);
CREATE INDEX idx_sales_line_items_product_id ON sales_line_items(product_id);

-- Add comments for clarity
COMMENT ON TABLE sales_line_items IS 'Line items for sales, enabling multiple products per sale';
COMMENT ON COLUMN sales_line_items.sale_id IS 'Reference to the parent sales_records';
COMMENT ON COLUMN sales_line_items.product_id IS 'Reference to products (nullable, allows custom products)';
COMMENT ON COLUMN sales_line_items.product_name IS 'Denormalized product name for reporting when product is deleted';
COMMENT ON COLUMN sales_line_items.quantity IS 'Quantity of this line item';
COMMENT ON COLUMN sales_line_items.unit_price IS 'Price per unit at time of sale';
COMMENT ON COLUMN sales_line_items.line_total IS 'Computed: quantity * unit_price';

-- Note: The sales_records.total_amount remains the sum of all line_items' line_total
-- Commission is calculated on sales_records.total_amount for the entire sale
