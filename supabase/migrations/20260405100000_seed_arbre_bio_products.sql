-- ================================================================
-- ARBRE BIO AFRICA — Product Seed & Site Settings Table
-- Migration: 20260405100000_seed_arbre_bio_products.sql
-- ================================================================

-- ----------------------------------------------------------------
-- 1. admin_site_settings (key/value store)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_settings"
  ON admin_site_settings
  FOR ALL
  USING (auth.role() = 'authenticated');

-- ----------------------------------------------------------------
-- 2. Product Categories
-- ----------------------------------------------------------------
INSERT INTO admin_product_categories (name, description)
VALUES
  ('Fertilizers',           'Mineral and compound fertilizers for crop nutrition'),
  ('Biostimulants',         'Organic biostimulants, plant extracts and microbial inoculants'),
  ('Greenhouse Accessories','Nets, films, clips and accessories for greenhouse construction'),
  ('Greenhouse Tropicale',  'Complete tropical greenhouse kits and high-tunnel structures'),
  ('Irrigation Systems',    'Drip kits, sprinklers, pumps and fertigation equipment'),
  ('Growing Media',         'Substrates: coco peat, perlite, vermiculite, rockwool and mixes'),
  ('Agriculture Advising',  'Agronomy consulting, soil analysis and field monitoring services'),
  ('Project Management',    'Engineering, installation and training services for farm projects')
ON CONFLICT (name) DO NOTHING;

-- ----------------------------------------------------------------
-- 3. Products
-- ----------------------------------------------------------------

-- Fertilizers
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'NPK 15-15-15',          'Balanced NPK compound fertilizer',                (SELECT id FROM admin_product_categories WHERE name = 'Fertilizers'), 35000,  'bag 50kg',  200, 30, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'NPK 15-15-15');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Urea 46%',              'High-nitrogen urea fertilizer',                    (SELECT id FROM admin_product_categories WHERE name = 'Fertilizers'), 28000,  'bag 50kg',  150, 25, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Urea 46%');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'DAP',                   'Di-ammonium phosphate fertilizer',                 (SELECT id FROM admin_product_categories WHERE name = 'Fertilizers'), 42000,  'bag 50kg',  100, 20, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'DAP');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Calcium Nitrate',       'Fast-acting calcium and nitrogen fertilizer',      (SELECT id FROM admin_product_categories WHERE name = 'Fertilizers'), 25000,  'bag 25kg',   80, 15, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Calcium Nitrate');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Potassium Nitrate KNO3','Soluble potassium nitrate for fertigation',        (SELECT id FROM admin_product_categories WHERE name = 'Fertilizers'), 32000,  'bag 25kg',   60, 10, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Potassium Nitrate KNO3');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Magnesium Sulphate',    'Epsom salt for magnesium deficiency correction',   (SELECT id FROM admin_product_categories WHERE name = 'Fertilizers'), 18000,  'bag 25kg',   90, 15, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Magnesium Sulphate');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Foliar Fertilizer Complex','Complete micronutrient foliar spray solution',  (SELECT id FROM admin_product_categories WHERE name = 'Fertilizers'), 12000,  'litre',     120, 20, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Foliar Fertilizer Complex');

-- Biostimulants
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Humic Acid Liquid',     'Concentrated humic acid soil conditioner',         (SELECT id FROM admin_product_categories WHERE name = 'Biostimulants'), 15000, 'litre',  80, 15, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Humic Acid Liquid');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Seaweed Extract',       'Ascophyllum nodosum seaweed biostimulant',         (SELECT id FROM admin_product_categories WHERE name = 'Biostimulants'), 18000, 'litre',  60, 10, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Seaweed Extract');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Mycorrhizal Inoculant', 'Arbuscular mycorrhizal fungi root inoculant',      (SELECT id FROM admin_product_categories WHERE name = 'Biostimulants'), 22000, 'kg',     40,  8, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Mycorrhizal Inoculant');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Trichoderma Biofungicide','Trichoderma harzianum biological fungicide',     (SELECT id FROM admin_product_categories WHERE name = 'Biostimulants'), 25000, 'kg',     35,  8, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Trichoderma Biofungicide');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Root Booster',          'Rooting hormone and biostimulant blend',           (SELECT id FROM admin_product_categories WHERE name = 'Biostimulants'), 14000, 'litre',  50, 10, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Root Booster');

-- Greenhouse Accessories
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Shade Net 50%',         '50% aluminet/HDPE shade net for greenhouses',      (SELECT id FROM admin_product_categories WHERE name = 'Greenhouse Accessories'), 1500,  'metre',     5000, 500, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Shade Net 50%');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Anti-insect Net',       '50-mesh insect exclusion netting',                 (SELECT id FROM admin_product_categories WHERE name = 'Greenhouse Accessories'), 2200,  'metre',     3000, 300, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Anti-insect Net');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Greenhouse Film 200μ',  '200 micron polyethylene greenhouse cover film',    (SELECT id FROM admin_product_categories WHERE name = 'Greenhouse Accessories'), 1800,  'metre',     4000, 400, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Greenhouse Film 200μ');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'UV Stabilised Film',    'Long-life UV-stabilised greenhouse film',          (SELECT id FROM admin_product_categories WHERE name = 'Greenhouse Accessories'), 2500,  'metre',     2000, 200, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'UV Stabilised Film');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Ground Cover Mulch',    'Woven PP ground cover mulch film',                 (SELECT id FROM admin_product_categories WHERE name = 'Greenhouse Accessories'),  900,  'metre',     6000, 600, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Ground Cover Mulch');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Clips & Ties',          'Pack of 100 plastic plant clips and soft ties',    (SELECT id FROM admin_product_categories WHERE name = 'Greenhouse Accessories'), 3500,  'pack/100',   500,  50, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Clips & Ties');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Seedling Trays 128-Cell','128-cell polystyrene seedling propagation tray',  (SELECT id FROM admin_product_categories WHERE name = 'Greenhouse Accessories'), 2800,  'piece',      800,  80, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Seedling Trays 128-Cell');

-- Greenhouse Tropicale
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Tropical Kit 20m²',     'Complete tropical greenhouse kit for 20 m²',       (SELECT id FROM admin_product_categories WHERE name = 'Greenhouse Tropicale'),  850000, 'unit', 10, 2, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Tropical Kit 20m²');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Tropical Kit 100m²',    'Complete tropical greenhouse kit for 100 m²',      (SELECT id FROM admin_product_categories WHERE name = 'Greenhouse Tropicale'), 3200000, 'unit',  5, 1, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Tropical Kit 100m²');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'High Tunnel 300m²',     'High-tunnel steel structure for 300 m²',           (SELECT id FROM admin_product_categories WHERE name = 'Greenhouse Tropicale'), 8500000, 'unit',  3, 1, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'High Tunnel 300m²');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Multi-span Structure',  'Multi-span commercial greenhouse structure',        (SELECT id FROM admin_product_categories WHERE name = 'Greenhouse Tropicale'),25000000, 'unit',  2, 1, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Multi-span Structure');

-- Irrigation Systems
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Drip Kit 0.5ha',        'Complete drip irrigation kit for 0.5 hectare',     (SELECT id FROM admin_product_categories WHERE name = 'Irrigation Systems'),  450000, 'kit',  15, 3, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Drip Kit 0.5ha');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Drip Kit 1ha',          'Complete drip irrigation kit for 1 hectare',       (SELECT id FROM admin_product_categories WHERE name = 'Irrigation Systems'),  820000, 'kit',  10, 2, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Drip Kit 1ha');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Drip Kit 5ha',          'Complete drip irrigation kit for 5 hectares',      (SELECT id FROM admin_product_categories WHERE name = 'Irrigation Systems'), 3500000, 'kit',   4, 1, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Drip Kit 5ha');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Micro-sprinkler Kit',   'Micro-sprinkler irrigation system kit',             (SELECT id FROM admin_product_categories WHERE name = 'Irrigation Systems'),  650000, 'kit',   8, 2, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Micro-sprinkler Kit');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Water Pump 1.5kW',      '1.5 kW electric water pump for irrigation',        (SELECT id FROM admin_product_categories WHERE name = 'Irrigation Systems'),  380000, 'piece', 12, 2, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Water Pump 1.5kW');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Filter Station 2"',     '2-inch disc filter station for drip systems',       (SELECT id FROM admin_product_categories WHERE name = 'Irrigation Systems'),   95000, 'piece', 20, 5, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Filter Station 2"');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Fertigation Unit',      'Venturi-based fertigation injection unit',          (SELECT id FROM admin_product_categories WHERE name = 'Irrigation Systems'),  750000, 'piece',  5, 1, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Fertigation Unit');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Rain Gun Sprinkler',    'Long-range impact rain gun sprinkler',              (SELECT id FROM admin_product_categories WHERE name = 'Irrigation Systems'),  180000, 'piece', 15, 3, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Rain Gun Sprinkler');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Lateral Pipe 16mm',     '16 mm PE lateral drip irrigation pipe',            (SELECT id FROM admin_product_categories WHERE name = 'Irrigation Systems'),     350, 'metre', 10000, 1000, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Lateral Pipe 16mm');

-- Growing Media (Substrat)
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Coco Peat Block 5kg',   'Compressed 5 kg coco peat block (expands to ~70L)', (SELECT id FROM admin_product_categories WHERE name = 'Growing Media'),  8500, 'piece', 300, 50, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Coco Peat Block 5kg');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Perlite 100L',          '100-litre bag of horticultural perlite',            (SELECT id FROM admin_product_categories WHERE name = 'Growing Media'), 22000, 'bag',   150, 25, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Perlite 100L');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Vermiculite 50L',       '50-litre bag of horticultural vermiculite',         (SELECT id FROM admin_product_categories WHERE name = 'Growing Media'), 18000, 'bag',   120, 20, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Vermiculite 50L');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Rockwool Slabs',        'Grodan-type rockwool growing slab for hydroponics', (SELECT id FROM admin_product_categories WHERE name = 'Growing Media'),  4500, 'piece', 400, 60, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Rockwool Slabs');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Potting Mix 50L',       'Premium ready-to-use potting and substrate mix',    (SELECT id FROM admin_product_categories WHERE name = 'Growing Media'), 12000, 'bag',   200, 30, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Potting Mix 50L');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Expanded Clay Pebbles 50L','50-litre bag of 8–16 mm expanded clay pebbles', (SELECT id FROM admin_product_categories WHERE name = 'Growing Media'), 15000, 'bag',   100, 20, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Expanded Clay Pebbles 50L');

-- Agriculture Advising
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Soil Analysis Service', 'Full soil physicochemical analysis with report',    (SELECT id FROM admin_product_categories WHERE name = 'Agriculture Advising'), 45000,  'service', 999, 0, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Soil Analysis Service');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Farm Visit & Diagnosis','On-site agronomist farm visit and diagnosis',       (SELECT id FROM admin_product_categories WHERE name = 'Agriculture Advising'), 75000,  'day',     999, 0, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Farm Visit & Diagnosis');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Crop Monitoring Plan',  'Monthly crop monitoring and advisory plan',         (SELECT id FROM admin_product_categories WHERE name = 'Agriculture Advising'), 120000, 'month',   999, 0, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Crop Monitoring Plan');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Agronomy Report',       'Detailed written agronomy and yield improvement report', (SELECT id FROM admin_product_categories WHERE name = 'Agriculture Advising'), 85000, 'report', 999, 0, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Agronomy Report');

-- Project Management
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Site Survey & Feasibility','Site survey and project feasibility study',      (SELECT id FROM admin_product_categories WHERE name = 'Project Management'), 150000, 'service', 999, 0, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Site Survey & Feasibility');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Engineering Design',    'Full engineering and technical design package',     (SELECT id FROM admin_product_categories WHERE name = 'Project Management'), 350000, 'service', 999, 0, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Engineering Design');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Project Management',    'Monthly project management and oversight service',  (SELECT id FROM admin_product_categories WHERE name = 'Project Management'), 250000, 'month',   999, 0, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Project Management');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Technical Installation','On-site technical installation supervision',        (SELECT id FROM admin_product_categories WHERE name = 'Project Management'), 500000, 'service', 999, 0, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Technical Installation');
INSERT INTO admin_products (name, description, category_id, unit_price, unit_of_measure, stock_quantity, reorder_level, is_active)
SELECT 'Training & Capacity Building','Farmer / staff training and capacity building day', (SELECT id FROM admin_product_categories WHERE name = 'Project Management'), 95000, 'day', 999, 0, true WHERE NOT EXISTS (SELECT 1 FROM admin_products WHERE name = 'Training & Capacity Building');
