-- ================================================================
-- ARBRE BIO AFRICA — SUPPLIER MANAGEMENT SYSTEM
-- Migration: 20260405000000_create_supplier_system.sql
-- ================================================================

-- ----------------------------------------------------------------
-- 1. SUPPLIERS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suppliers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Identity
  company_name     TEXT NOT NULL,
  trade_name       TEXT,
  logo_url         TEXT,
  -- Category (Arbre Bio Africa product lines)
  category         TEXT NOT NULL
                   CHECK (category IN (
                     'fertilizer',
                     'biostimulant',
                     'greenhouse_accessories',
                     'greenhouse_tropicale',
                     'irrigation_system',
                     'growing_media',
                     'agriculture_advising',
                     'project_management',
                     'other'
                   )),
  -- Contact
  contact_name     TEXT,
  contact_email    TEXT,
  contact_phone    TEXT,
  website          TEXT,
  -- Address
  address          TEXT,
  city             TEXT,
  country          TEXT NOT NULL DEFAULT 'Côte d''Ivoire',
  -- Status
  status           TEXT NOT NULL DEFAULT 'active'
                   CHECK (status IN ('active','suspended','pending','blacklisted')),
  -- Terms & Financials
  payment_terms    TEXT,                 -- e.g. "Net 30", "50% upfront"
  currency         TEXT DEFAULT 'XOF',
  tax_id           TEXT,
  contract_url     TEXT,
  -- Rating
  rating           SMALLINT CHECK (rating BETWEEN 1 AND 5),
  -- Notes
  notes            TEXT,
  -- Meta
  created_by       UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 2. SUPPLIER CONTACTS (multiple contacts per supplier)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS supplier_contacts (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id      UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  full_name        TEXT NOT NULL,
  job_title        TEXT,
  email            TEXT,
  phone            TEXT,
  is_primary       BOOLEAN DEFAULT FALSE,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 3. SUPPLIER NOTES (admin note log)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS supplier_notes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id      UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  content          TEXT NOT NULL,
  written_by       UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 4. PURCHASE ORDERS (order tracking per supplier)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS supplier_orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id      UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  order_number     TEXT NOT NULL UNIQUE,
  -- Items summary (JSON array of {product, qty, unit_price, unit})
  items            JSONB DEFAULT '[]'::jsonb,
  total_amount     NUMERIC(14,2),
  currency         TEXT DEFAULT 'XOF',
  status           TEXT NOT NULL DEFAULT 'draft'
                   CHECK (status IN (
                     'draft','sent','confirmed','in_transit',
                     'partially_delivered','delivered','cancelled','disputed'
                   )),
  notes            TEXT,
  ordered_at       TIMESTAMPTZ,
  expected_at      DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 5. DELIVERIES (track physical deliveries)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS supplier_deliveries (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id         UUID NOT NULL REFERENCES supplier_orders(id) ON DELETE CASCADE,
  supplier_id      UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  -- Delivery details
  tracking_number  TEXT,
  carrier          TEXT,
  items_received   JSONB DEFAULT '[]'::jsonb,  -- [{product, qty_ordered, qty_received}]
  is_complete      BOOLEAN DEFAULT FALSE,
  received_at      TIMESTAMPTZ,
  received_by      UUID REFERENCES auth.users(id),
  -- Quality
  quality_ok       BOOLEAN,
  quality_notes    TEXT,
  -- Documents
  delivery_note_url TEXT,
  invoice_url      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 6. SUPPLIER STATUS LOG
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS supplier_status_log (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id      UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  old_status       TEXT,
  new_status       TEXT NOT NULL,
  reason           TEXT,
  changed_by       UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- TRIGGERS — updated_at
-- ----------------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_suppliers_updated_at') THEN
    CREATE TRIGGER set_suppliers_updated_at BEFORE UPDATE ON suppliers
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_supplier_orders_updated_at') THEN
    CREATE TRIGGER set_supplier_orders_updated_at BEFORE UPDATE ON supplier_orders
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ----------------------------------------------------------------
-- INDEXES
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_suppliers_status   ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_category ON suppliers(category);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_supplier ON supplier_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_status   ON supplier_orders(status);
CREATE INDEX IF NOT EXISTS idx_supplier_deliveries_order ON supplier_deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_supplier_notes_supplier   ON supplier_notes(supplier_id);

-- ----------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------
ALTER TABLE suppliers               ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_contacts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_notes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_deliveries     ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_status_log     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_suppliers"       ON suppliers           FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_sup_contacts"    ON supplier_contacts   FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_sup_notes"       ON supplier_notes      FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_sup_orders"      ON supplier_orders     FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_sup_deliveries"  ON supplier_deliveries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_sup_status_log"  ON supplier_status_log FOR ALL USING (auth.role() = 'authenticated');
