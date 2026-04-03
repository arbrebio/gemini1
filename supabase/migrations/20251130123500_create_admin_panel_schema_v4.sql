/*
  # Admin Panel Schema Extensions (v4)

  ## Overview
  Extends the admin order management system with:
  1. User Roles (admin_profiles)
  2. Project Management (admin_projects, admin_project_tasks)
  3. Supplier Management (admin_suppliers)
  4. Warehouse & Stock Movements (admin_warehouses, admin_stock_movements)

  ## 1. New Tables

  ### admin_profiles
  - Extends auth.users with role-based access control
  - Roles: super_admin, sales_manager, inventory_manager, technician, viewer

  ### admin_projects
  - Track EPC projects (Greenhouses, Irrigation)
  - Linked to customers

  ### admin_project_tasks
  - Tasks within projects
  - Assignable to users

  ### admin_suppliers
  - Manage supplier directory

  ### admin_warehouses
  - Multiple inventory locations

  ### admin_stock_movements
  - Audit trail for inventory changes

  ## 2. Security
  - RLS enabled on all tables
  - Policies for authenticated admin users
*/

-- 1. User Roles & Profiles
CREATE TABLE IF NOT EXISTS admin_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('super_admin', 'sales_manager', 'inventory_manager', 'technician', 'viewer')),
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Project Management
CREATE TABLE IF NOT EXISTS admin_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  customer_id uuid REFERENCES admin_customers(id) ON DELETE RESTRICT,
  type text NOT NULL CHECK (type IN ('greenhouse', 'irrigation', 'substrate', 'other')),
  status text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed', 'on_hold', 'cancelled')),
  start_date date,
  end_date date,
  budget numeric DEFAULT 0,
  description text,
  location text, -- Site location if different from customer address
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_project_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES admin_projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Supplier Management
CREATE TABLE IF NOT EXISTS admin_suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text,
  email text,
  phone text,
  address text,
  country text,
  website text,
  payment_terms text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Warehouse & Stock Movements
CREATE TABLE IF NOT EXISTS admin_warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  location text,
  manager_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES admin_products(id) ON DELETE RESTRICT,
  warehouse_id uuid REFERENCES admin_warehouses(id) ON DELETE RESTRICT,
  quantity integer NOT NULL, -- Positive for addition, negative for deduction
  type text NOT NULL CHECK (type IN ('purchase', 'sale', 'adjustment', 'transfer', 'return')),
  reference_id uuid, -- Can link to order_id or project_id
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_stock_movements ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Simplified for Admin Access)
-- In a real scenario, you'd check admin_profiles.role for granular permissions

-- Profiles
CREATE POLICY "Users can view all profiles" ON admin_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON admin_profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Projects
CREATE POLICY "Admins can view all projects" ON admin_projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage projects" ON admin_projects FOR ALL TO authenticated USING (true);

-- Tasks
CREATE POLICY "Admins can view all tasks" ON admin_project_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage tasks" ON admin_project_tasks FOR ALL TO authenticated USING (true);

-- Suppliers
CREATE POLICY "Admins can view all suppliers" ON admin_suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage suppliers" ON admin_suppliers FOR ALL TO authenticated USING (true);

-- Warehouses
CREATE POLICY "Admins can view all warehouses" ON admin_warehouses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage warehouses" ON admin_warehouses FOR ALL TO authenticated USING (true);

-- Stock Movements
CREATE POLICY "Admins can view all movements" ON admin_stock_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can create movements" ON admin_stock_movements FOR INSERT TO authenticated WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_admin_profiles_updated_at BEFORE UPDATE ON admin_profiles FOR EACH ROW EXECUTE FUNCTION update_admin_updated_at_column();
CREATE TRIGGER update_admin_projects_updated_at BEFORE UPDATE ON admin_projects FOR EACH ROW EXECUTE FUNCTION update_admin_updated_at_column();
CREATE TRIGGER update_admin_project_tasks_updated_at BEFORE UPDATE ON admin_project_tasks FOR EACH ROW EXECUTE FUNCTION update_admin_updated_at_column();
CREATE TRIGGER update_admin_suppliers_updated_at BEFORE UPDATE ON admin_suppliers FOR EACH ROW EXECUTE FUNCTION update_admin_updated_at_column();
CREATE TRIGGER update_admin_warehouses_updated_at BEFORE UPDATE ON admin_warehouses FOR EACH ROW EXECUTE FUNCTION update_admin_updated_at_column();

-- Insert default warehouse
INSERT INTO admin_warehouses (name, location) VALUES ('Main Warehouse - Abidjan', 'Cocody Riviera 3') ON CONFLICT (name) DO NOTHING;
