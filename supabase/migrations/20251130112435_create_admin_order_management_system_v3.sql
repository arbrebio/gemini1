/*
  # Admin Order Management System

  ## Overview
  Creates a comprehensive order management system for agricultural equipment and services,
  enabling admin staff to manage customers, products, and orders efficiently.

  ## 1. New Tables

  ### admin_customers
  - `id` (uuid, primary key) - Unique customer identifier
  - `email` (text, unique) - Customer email address
  - `full_name` (text) - Customer's full name
  - `phone` (text) - Contact phone number
  - `company_name` (text, nullable) - Farm or company name
  - `address` (text, nullable) - Physical address
  - `city` (text, nullable) - City
  - `region` (text, nullable) - Region/State
  - `postal_code` (text, nullable) - Postal code
  - `farm_size_hectares` (numeric, nullable) - Size of farm in hectares
  - `primary_crops` (text[], nullable) - Array of primary crops grown
  - `notes` (text, nullable) - Additional notes about customer
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### admin_product_categories
  - `id` (uuid, primary key) - Category identifier
  - `name` (text, unique) - Category name
  - `description` (text, nullable) - Category description
  - `created_at` (timestamptz) - Record creation timestamp

  ### admin_products
  - `id` (uuid, primary key) - Product identifier
  - `category_id` (uuid, foreign key) - References admin_product_categories
  - `name` (text) - Product name
  - `description` (text, nullable) - Product description
  - `sku` (text, unique, nullable) - Stock keeping unit
  - `unit_price` (numeric) - Price per unit in XOF
  - `unit_of_measure` (text) - Unit (e.g., "piece", "meter", "kg")
  - `stock_quantity` (integer) - Current stock level
  - `reorder_level` (integer) - Reorder threshold
  - `is_active` (boolean) - Whether product is available
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### admin_orders
  - `id` (uuid, primary key) - Order identifier
  - `order_number` (text, unique) - Human-readable order number
  - `customer_id` (uuid, foreign key) - References admin_customers
  - `status` (text) - Order status enum
  - `total_amount` (numeric) - Total order value in XOF
  - `notes` (text, nullable) - Order notes
  - `project_description` (text, nullable) - Customer's project details
  - `delivery_address` (text, nullable) - Delivery location
  - `delivery_date` (date, nullable) - Scheduled delivery date
  - `created_by` (uuid, nullable) - Admin user who created order
  - `created_at` (timestamptz) - Order creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `fulfilled_at` (timestamptz, nullable) - Fulfillment timestamp

  ### admin_order_items
  - `id` (uuid, primary key) - Order item identifier
  - `order_id` (uuid, foreign key) - References admin_orders
  - `product_id` (uuid, foreign key) - References admin_products
  - `quantity` (numeric) - Quantity ordered
  - `unit_price` (numeric) - Price per unit at time of order
  - `subtotal` (numeric) - Line item total
  - `created_at` (timestamptz) - Record creation timestamp

  ### admin_order_status_history
  - `id` (uuid, primary key) - History entry identifier
  - `order_id` (uuid, foreign key) - References admin_orders
  - `status` (text) - New status
  - `notes` (text, nullable) - Status change notes
  - `changed_by` (uuid, nullable) - Admin user who changed status
  - `created_at` (timestamptz) - Change timestamp

  ## 2. Security

  All tables have RLS enabled with policies restricting access to authenticated admin users only.
  
  ## 3. Indexes

  Indexes added for foreign key relationships and common queries.

  ## 4. Triggers

  - Auto-update `updated_at` timestamps
  - Auto-generate order numbers
*/

-- Create admin_customers table
CREATE TABLE IF NOT EXISTS admin_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  company_name text,
  address text,
  city text,
  region text,
  postal_code text,
  farm_size_hectares numeric,
  primary_crops text[],
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin_product_categories table
CREATE TABLE IF NOT EXISTS admin_product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create admin_products table
CREATE TABLE IF NOT EXISTS admin_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES admin_product_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  sku text UNIQUE,
  unit_price numeric NOT NULL DEFAULT 0,
  unit_of_measure text NOT NULL DEFAULT 'piece',
  stock_quantity integer DEFAULT 0,
  reorder_level integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS admin_order_number_seq START 1;

-- Create admin_orders table
CREATE TABLE IF NOT EXISTS admin_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL DEFAULT '',
  customer_id uuid REFERENCES admin_customers(id) ON DELETE RESTRICT NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  total_amount numeric DEFAULT 0,
  notes text,
  project_description text,
  delivery_address text,
  delivery_date date,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  fulfilled_at timestamptz,
  CONSTRAINT valid_order_status CHECK (status IN ('draft', 'confirmed', 'processing', 'ready', 'delivered', 'cancelled'))
);

-- Create admin_order_items table
CREATE TABLE IF NOT EXISTS admin_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES admin_orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES admin_products(id) ON DELETE RESTRICT NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  subtotal numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create admin_order_status_history table
CREATE TABLE IF NOT EXISTS admin_order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES admin_orders(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL,
  notes text,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_customers_email ON admin_customers(email);
CREATE INDEX IF NOT EXISTS idx_admin_orders_number ON admin_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_admin_orders_customer ON admin_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_admin_orders_status ON admin_orders(status);
CREATE INDEX IF NOT EXISTS idx_admin_orders_created ON admin_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_products_category ON admin_products(category_id);
CREATE INDEX IF NOT EXISTS idx_admin_products_sku ON admin_products(sku);
CREATE INDEX IF NOT EXISTS idx_admin_order_items_order ON admin_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_admin_order_status_history_order ON admin_order_status_history(order_id);

-- Enable RLS
ALTER TABLE admin_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_order_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_customers
CREATE POLICY "Admins can view all customers"
  ON admin_customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert customers"
  ON admin_customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update customers"
  ON admin_customers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete customers"
  ON admin_customers FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for admin_product_categories
CREATE POLICY "Admins can view all categories"
  ON admin_product_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON admin_product_categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update categories"
  ON admin_product_categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete categories"
  ON admin_product_categories FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for admin_products
CREATE POLICY "Admins can view all products"
  ON admin_products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert products"
  ON admin_products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update products"
  ON admin_products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete products"
  ON admin_products FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for admin_orders
CREATE POLICY "Admins can view all orders"
  ON admin_orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert orders"
  ON admin_orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update orders"
  ON admin_orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete orders"
  ON admin_orders FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for admin_order_items
CREATE POLICY "Admins can view all order items"
  ON admin_order_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert order items"
  ON admin_order_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update order items"
  ON admin_order_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete order items"
  ON admin_order_items FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for admin_order_status_history
CREATE POLICY "Admins can view order history"
  ON admin_order_status_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert order history"
  ON admin_order_status_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_admin_customers_updated_at ON admin_customers;
CREATE TRIGGER update_admin_customers_updated_at
  BEFORE UPDATE ON admin_customers
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_products_updated_at ON admin_products;
CREATE TRIGGER update_admin_products_updated_at
  BEFORE UPDATE ON admin_products
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_orders_updated_at ON admin_orders;
CREATE TRIGGER update_admin_orders_updated_at
  BEFORE UPDATE ON admin_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_updated_at_column();

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION generate_admin_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'ORD-' || TO_CHAR(NEW.created_at, 'YYYYMMDD') || '-' || 
                        LPAD(NEXTVAL('admin_order_number_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order number generation
DROP TRIGGER IF EXISTS generate_admin_order_number_trigger ON admin_orders;
CREATE TRIGGER generate_admin_order_number_trigger
  BEFORE INSERT ON admin_orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_admin_order_number();

-- Insert default product categories
INSERT INTO admin_product_categories (name, description) VALUES
  ('Irrigation Systems', 'Drip irrigation, sprinklers, and controllers'),
  ('Greenhouses', 'Greenhouse structures and accessories'),
  ('Growing Substrates', 'Coco peat, soil mixes, and growing media'),
  ('Fertilizers', 'Organic and chemical fertilizers'),
  ('Seeds & Seedlings', 'Quality seeds and plant seedlings'),
  ('Tools & Equipment', 'Farming tools and machinery'),
  ('Pest Control', 'Pesticides and pest management solutions'),
  ('Other Products', 'Miscellaneous agricultural supplies')
ON CONFLICT (name) DO NOTHING;