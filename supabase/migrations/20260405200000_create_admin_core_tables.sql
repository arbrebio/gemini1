-- =============================================================================
-- Migration: 20260405200000_create_admin_core_tables
-- Description: Core admin tables for Arbre Bio Africa admin panel
--   - admin_customers
--   - admin_product_categories
--   - admin_products
--   - admin_orders
--   - admin_order_items
--   - admin_order_status_history
--   - admin_projects
--   - admin_project_tasks
--   - admin_site_settings
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. admin_customers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_customers (
  id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name            TEXT        NOT NULL,
  email                TEXT        NOT NULL UNIQUE,
  phone                TEXT,
  company_name         TEXT,
  address              TEXT,
  city                 TEXT,
  region               TEXT,
  country              TEXT        DEFAULT 'Côte d''Ivoire',
  farm_size_hectares   NUMERIC(10,2),
  primary_crops        TEXT,
  customer_type        TEXT        CHECK (customer_type IN ('Farmer','Cooperative','Enterprise','Government')),
  notes                TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 2. admin_product_categories
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_product_categories (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT        NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 3. admin_products
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_products (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT        NOT NULL,
  sku              TEXT        UNIQUE,
  description      TEXT,
  category_id      UUID        REFERENCES admin_product_categories(id) ON DELETE SET NULL,
  unit_price       NUMERIC(14,2) NOT NULL DEFAULT 0,
  cost_price       NUMERIC(14,2) DEFAULT 0,
  unit_of_measure  TEXT        DEFAULT 'unit',
  stock_quantity   INTEGER     NOT NULL DEFAULT 0,
  reorder_level    INTEGER     DEFAULT 5,
  max_stock_level  INTEGER     DEFAULT 1000,
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 4. admin_orders
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_orders (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number     TEXT        NOT NULL UNIQUE,
  customer_id      UUID        NOT NULL REFERENCES admin_customers(id) ON DELETE RESTRICT,
  status           TEXT        NOT NULL DEFAULT 'draft'
                               CHECK (status IN ('draft','confirmed','processing','shipped','delivered','cancelled')),
  total_amount     NUMERIC(14,2) NOT NULL DEFAULT 0,
  notes            TEXT,
  delivery_address TEXT,
  delivery_date    DATE,
  fulfilled_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 5. admin_order_items
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_order_items (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID          NOT NULL REFERENCES admin_orders(id) ON DELETE CASCADE,
  product_id  UUID          REFERENCES admin_products(id) ON DELETE SET NULL,
  quantity    NUMERIC(14,3) NOT NULL,
  unit_price  NUMERIC(14,2) NOT NULL,
  subtotal    NUMERIC(14,2) NOT NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 6. admin_order_status_history
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_order_status_history (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID        NOT NULL REFERENCES admin_orders(id) ON DELETE CASCADE,
  status      TEXT        NOT NULL,
  notes       TEXT,
  changed_by  UUID        REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 7. admin_projects
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_projects (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT        NOT NULL,
  description     TEXT,
  status          TEXT        NOT NULL DEFAULT 'planning'
                              CHECK (status IN ('planning','active','on_hold','completed','cancelled')),
  customer_id     UUID        REFERENCES admin_customers(id) ON DELETE SET NULL,
  start_date      DATE,
  end_date        DATE,
  budget          NUMERIC(14,2),
  budget_currency TEXT        DEFAULT 'XOF',
  tags            TEXT[],
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 8. admin_project_tasks
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_project_tasks (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id    UUID        NOT NULL REFERENCES admin_projects(id) ON DELETE CASCADE,
  title         TEXT        NOT NULL,
  description   TEXT,
  status        TEXT        NOT NULL DEFAULT 'todo'
                            CHECK (status IN ('todo','in_progress','done')),
  priority      TEXT        DEFAULT 'medium'
                            CHECK (priority IN ('low','medium','high','urgent')),
  due_date      DATE,
  assignee_name TEXT,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 9. admin_site_settings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_site_settings (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  key        TEXT        NOT NULL UNIQUE,
  value      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Triggers for updated_at
-- (Requires update_updated_at_column() function from earlier migrations)
-- ---------------------------------------------------------------------------

-- admin_customers
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_admin_customers_updated_at'
  ) THEN
    CREATE TRIGGER set_admin_customers_updated_at
      BEFORE UPDATE ON admin_customers
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- admin_products
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_admin_products_updated_at'
  ) THEN
    CREATE TRIGGER set_admin_products_updated_at
      BEFORE UPDATE ON admin_products
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- admin_orders
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_admin_orders_updated_at'
  ) THEN
    CREATE TRIGGER set_admin_orders_updated_at
      BEFORE UPDATE ON admin_orders
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- admin_projects
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_admin_projects_updated_at'
  ) THEN
    CREATE TRIGGER set_admin_projects_updated_at
      BEFORE UPDATE ON admin_projects
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- admin_project_tasks
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_admin_project_tasks_updated_at'
  ) THEN
    CREATE TRIGGER set_admin_project_tasks_updated_at
      BEFORE UPDATE ON admin_project_tasks
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE admin_customers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_product_categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_products               ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_orders                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_order_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_order_status_history   ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_projects               ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_project_tasks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_site_settings          ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Policies — authenticated users have full access to all admin tables
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'admin_customers_auth_all' AND tablename = 'admin_customers'
  ) THEN
    CREATE POLICY admin_customers_auth_all ON admin_customers
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'admin_product_categories_auth_all' AND tablename = 'admin_product_categories'
  ) THEN
    CREATE POLICY admin_product_categories_auth_all ON admin_product_categories
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'admin_products_auth_all' AND tablename = 'admin_products'
  ) THEN
    CREATE POLICY admin_products_auth_all ON admin_products
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'admin_orders_auth_all' AND tablename = 'admin_orders'
  ) THEN
    CREATE POLICY admin_orders_auth_all ON admin_orders
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'admin_order_items_auth_all' AND tablename = 'admin_order_items'
  ) THEN
    CREATE POLICY admin_order_items_auth_all ON admin_order_items
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'admin_order_status_history_auth_all' AND tablename = 'admin_order_status_history'
  ) THEN
    CREATE POLICY admin_order_status_history_auth_all ON admin_order_status_history
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'admin_projects_auth_all' AND tablename = 'admin_projects'
  ) THEN
    CREATE POLICY admin_projects_auth_all ON admin_projects
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'admin_project_tasks_auth_all' AND tablename = 'admin_project_tasks'
  ) THEN
    CREATE POLICY admin_project_tasks_auth_all ON admin_project_tasks
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'admin_site_settings_auth_all' AND tablename = 'admin_site_settings'
  ) THEN
    CREATE POLICY admin_site_settings_auth_all ON admin_site_settings
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_admin_customers_email
  ON admin_customers(email);

CREATE INDEX IF NOT EXISTS idx_admin_orders_customer
  ON admin_orders(customer_id);

CREATE INDEX IF NOT EXISTS idx_admin_orders_status
  ON admin_orders(status);

CREATE INDEX IF NOT EXISTS idx_admin_order_items_order
  ON admin_order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_admin_products_category
  ON admin_products(category_id);

CREATE INDEX IF NOT EXISTS idx_admin_products_sku
  ON admin_products(sku);

CREATE INDEX IF NOT EXISTS idx_admin_projects_customer
  ON admin_projects(customer_id);

CREATE INDEX IF NOT EXISTS idx_admin_project_tasks_project
  ON admin_project_tasks(project_id);

CREATE INDEX IF NOT EXISTS idx_admin_site_settings_key
  ON admin_site_settings(key);
