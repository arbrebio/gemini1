-- =============================================================================
-- Migration: 20260405300000_seed_admin_products
-- Description: Seed product categories and ~40 products for Arbre Bio Africa
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Product Categories
-- ---------------------------------------------------------------------------
INSERT INTO admin_product_categories (name, description) VALUES
  ('Fertilizers',              'Organic and mineral fertilizers for soil enrichment'),
  ('Biostimulants',            'Natural plant growth enhancers and bio-stimulant inputs'),
  ('Greenhouse Accessories',   'Equipment and fittings for greenhouse management'),
  ('Greenhouse Tropicale',     'Tropical greenhouse structures and tunnel systems'),
  ('Irrigation Systems',       'Drip, sprinkler, and micro-irrigation components'),
  ('Growing Media',            'Substrates, coco peat, perlite, and growing mixes'),
  ('Agriculture Advising',     'Consulting, agronomic advice, and technical support services'),
  ('Project Management',       'Project coordination, monitoring, and management services')
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. Products — seeded per category
-- ---------------------------------------------------------------------------

-- ── Fertilizers ─────────────────────────────────────────────────────────────
INSERT INTO admin_products (name, sku, description, category_id, unit_price, cost_price, unit_of_measure, stock_quantity, reorder_level, max_stock_level, is_active)
SELECT
  p.name, p.sku, p.description,
  (SELECT id FROM admin_product_categories WHERE name = 'Fertilizers'),
  p.unit_price, p.cost_price, p.unit_of_measure,
  p.stock_quantity, p.reorder_level, p.max_stock_level, TRUE
FROM (VALUES
  ('Engrais NPK 15-15-15',        'FRT-001', 'Engrais granulaire équilibré pour cultures vivrières et maraîchères',            12500,  8500, 'sac 25 kg', 200, 20, 500),
  ('Engrais NPK 20-10-10',        'FRT-002', 'Formulation riche en azote, idéale pour la croissance végétative',                13000,  9000, 'sac 25 kg', 150, 20, 400),
  ('Urée 46%',                    'FRT-003', 'Source concentrée d''azote pour apport de couverture',                            10500,  7200, 'sac 50 kg', 300, 30, 600),
  ('Superphosphate Simple',       'FRT-004', 'Apport de phosphore pour l''enracinement et la floraison',                        9800,   6500, 'sac 50 kg', 180, 15, 400),
  ('Sulfate de Potasse',          'FRT-005', 'Potassium sans chlore, recommandé pour cultures sensibles',                       15200, 10500, 'sac 25 kg', 120, 10, 300),
  ('Compost Organique Premium',   'FRT-006', 'Compost mûri enrichi en micro-organismes bénéfiques',                             7500,  4800, 'sac 40 kg', 250, 25, 600),
  ('Engrais Foliaire Polyvalent', 'FRT-007', 'Solution nutritive complète pour application foliaire',                           18500, 12000, 'bidon 5 L', 80,  8, 200)
) AS p(name, sku, description, unit_price, cost_price, unit_of_measure, stock_quantity, reorder_level, max_stock_level)
ON CONFLICT (sku) DO NOTHING;

-- ── Biostimulants ────────────────────────────────────────────────────────────
INSERT INTO admin_products (name, sku, description, category_id, unit_price, cost_price, unit_of_measure, stock_quantity, reorder_level, max_stock_level, is_active)
SELECT
  p.name, p.sku, p.description,
  (SELECT id FROM admin_product_categories WHERE name = 'Biostimulants'),
  p.unit_price, p.cost_price, p.unit_of_measure,
  p.stock_quantity, p.reorder_level, p.max_stock_level, TRUE
FROM (VALUES
  ('Extrait d''Algues Ascophyllum', 'BIO-001', 'Biostimulant naturel issu d''algues marines — améliore la vigueur et la résistance au stress', 22000, 14500, 'bidon 1 L',  100, 10, 250),
  ('Acide Humique & Fulvique',      'BIO-002', 'Améliore la structure du sol et la disponibilité des nutriments',                                16500, 10000, 'bidon 5 L',   80,  8, 200),
  ('Trichoderma Bio-Fungicide',     'BIO-003', 'Champignon antagoniste contre les pathogènes racinaires (Fusarium, Pythium)',                    19800, 13000, 'sachet 1 kg', 60,  6, 150),
  ('Rhizobium Inoculant',           'BIO-004', 'Bactéries fixatrices d''azote pour légumineuses',                                               14500,  9500, 'sachet 200 g',70,  7, 150),
  ('Mycorhizes Granulaires',        'BIO-005', 'Champignons mycorhiziens pour améliorer l''absorption hydrique et minérale',                    28000, 18000, 'sachet 500 g', 50,  5, 100),
  ('Aminoacides Végétaux',          'BIO-006', 'Acides aminés hydrolysés pour stimuler la photosynthèse et la croissance',                      17500, 11500, 'bidon 1 L',   90,  9, 200)
) AS p(name, sku, description, unit_price, cost_price, unit_of_measure, stock_quantity, reorder_level, max_stock_level)
ON CONFLICT (sku) DO NOTHING;

-- ── Greenhouse Accessories ───────────────────────────────────────────────────
INSERT INTO admin_products (name, sku, description, category_id, unit_price, cost_price, unit_of_measure, stock_quantity, reorder_level, max_stock_level, is_active)
SELECT
  p.name, p.sku, p.description,
  (SELECT id FROM admin_product_categories WHERE name = 'Greenhouse Accessories'),
  p.unit_price, p.cost_price, p.unit_of_measure,
  p.stock_quantity, p.reorder_level, p.max_stock_level, TRUE
FROM (VALUES
  ('Film Plastique PE 200μ',       'GHA-001', 'Film de couverture polyéthylène anti-UV longue durée',                    45000, 30000, 'rouleau 100 m', 40,  4, 100),
  ('Filet Ombrage 50%',            'GHA-002', 'Filet de protection contre le rayonnement excessif',                      32000, 21000, 'rouleau 50 m',  30,  3,  80),
  ('Filet Anti-Insectes 50 mesh',  'GHA-003', 'Filet fin pour exclusion des insectes vecteurs',                          38000, 25000, 'rouleau 50 m',  25,  3,  60),
  ('Clips de Serrage Ø22mm',       'GHA-004', 'Clips en acier galvanisé pour fixation de films',                          1500,   850, 'paquet 50 pcs', 200, 20, 500),
  ('Ruban Adhésif Agricole',       'GHA-005', 'Ruban résistant UV pour réparation et jointure de films',                  3500,  2200, 'rouleau 50 m', 100, 10, 300),
  ('Thermomètre Min/Max Serre',    'GHA-006', 'Surveillance de température à l''intérieur des serres',                    8500,  5500, 'unité',          50,  5, 120),
  ('Hygromètre Numérique',         'GHA-007', 'Mesure de l''humidité relative et de la température en temps réel',       12000,  8000, 'unité',          40,  4, 100)
) AS p(name, sku, description, unit_price, cost_price, unit_of_measure, stock_quantity, reorder_level, max_stock_level)
ON CONFLICT (sku) DO NOTHING;

-- ── Greenhouse Tropicale ─────────────────────────────────────────────────────
INSERT INTO admin_products (name, sku, description, category_id, unit_price, cost_price, unit_of_measure, stock_quantity, reorder_level, max_stock_level, is_active)
SELECT
  p.name, p.sku, p.description,
  (SELECT id FROM admin_product_categories WHERE name = 'Greenhouse Tropicale'),
  p.unit_price, p.cost_price, p.unit_of_measure,
  p.stock_quantity, p.reorder_level, p.max_stock_level, TRUE
FROM (VALUES
  ('Tunnel Tropicale 8×30m',       'GHT-001', 'Structure tunnel galvanisée adaptée au climat tropical, ventilation haute',  1850000, 1300000, 'unité',   5, 1, 20),
  ('Tunnel Tropicale 6×20m',       'GHT-002', 'Modèle compact pour petits exploitants, montage facile',                     1100000,  780000, 'unité',   8, 1, 20),
  ('Serre Multi-Chapelle 12×50m',  'GHT-003', 'Structure multi-nef avec ouvertures zénithales pour ventilation tropicale',  4200000, 3000000, 'unité',   2, 1, 10),
  ('Portail Serre Galvanisé',      'GHT-004', 'Porte double battant acier galvanisé 2×2m',                                   185000,  120000, 'unité',  15, 2, 40),
  ('Kit Fondation Béton Serre',    'GHT-005', 'Plots béton et ancrages pour fixation de structure tunnel 8×30m',             95000,   62000, 'kit',     10, 1, 30)
) AS p(name, sku, description, unit_price, cost_price, unit_of_measure, stock_quantity, reorder_level, max_stock_level)
ON CONFLICT (sku) DO NOTHING;

-- ── Irrigation Systems ───────────────────────────────────────────────────────
INSERT INTO admin_products (name, sku, description, category_id, unit_price, cost_price, unit_of_measure, stock_quantity, reorder_level, max_stock_level, is_active)
SELECT
  p.name, p.sku, p.description,
  (SELECT id FROM admin_product_categories WHERE name = 'Irrigation Systems'),
  p.unit_price, p.cost_price, p.unit_of_measure,
  p.stock_quantity, p.reorder_level, p.max_stock_level, TRUE
FROM (VALUES
  ('Gaine Goutteurs Intégrés 16mm', 'IRR-001', 'Gaine d''irrigation goutte-à-goutte, espacement 30cm, débit 2 L/h',     18500, 12000, 'rouleau 1000 m', 30,  3,  80),
  ('Tête de Pompe Solaire 24V',     'IRR-002', 'Pompe submersible solaire 24V, débit 3000 L/h, H max 30m',             285000, 195000, 'unité',           10,  1,  30),
  ('Filtre à Tamis 2"',             'IRR-003', 'Filtre inox 130 mesh pour protection des goutteurs',                    22000,  14500, 'unité',           40,  4, 100),
  ('Vanne Solénoïde 1"',            'IRR-004', 'Électrovanne 24 VAC pour automatisation irrigation',                    35000,  23000, 'unité',           25,  3,  60),
  ('Programmateur 4 Stations',      'IRR-005', 'Contrôleur d''irrigation 4 zones, batterie 9V',                         48000,  31500, 'unité',           15,  2,  40),
  ('Connecteur Rapide Ø16mm',       'IRR-006', 'Raccord rapide pour gaines d''irrigation',                               1200,    700, 'sachet 10 pcs',  200, 20, 500),
  ('Asperseur Micro-Jet 90°',       'IRR-007', 'Micro-asperseur pour serre, couverture 1.5m, débit 60 L/h',             3500,   2200, 'unité',           80,  8, 200)
) AS p(name, sku, description, unit_price, cost_price, unit_of_measure, stock_quantity, reorder_level, max_stock_level)
ON CONFLICT (sku) DO NOTHING;

-- ── Growing Media ────────────────────────────────────────────────────────────
INSERT INTO admin_products (name, sku, description, category_id, unit_price, cost_price, unit_of_measure, stock_quantity, reorder_level, max_stock_level, is_active)
SELECT
  p.name, p.sku, p.description,
  (SELECT id FROM admin_product_categories WHERE name = 'Growing Media'),
  p.unit_price, p.cost_price, p.unit_of_measure,
  p.stock_quantity, p.reorder_level, p.max_stock_level, TRUE
FROM (VALUES
  ('Coco Peat Briquette 5 kg',     'GRM-001', 'Tourbe de coco compressée, EC <0.5 mS/cm, pH 5.8–6.5',                   9500,  6200, 'briquette 5 kg', 150, 15, 400),
  ('Perlite Horticole Grade 3',    'GRM-002', 'Perlite expansée pour aération et drainage des substrats',                11000,  7200, 'sac 100 L',       80,  8, 200),
  ('Substrat Hors-Sol Universel',  'GRM-003', 'Mélange prêt à l''emploi coco/perlite/compost pour culture hors-sol',   13500,  9000, 'sac 50 L',       100, 10, 300),
  ('Billes d''Argile Expansée',    'GRM-004', 'Hydroton 8–16mm pour systèmes hydro et aquaponiques',                    12000,  7800, 'sac 50 L',        60,  6, 150),
  ('Fibre de Coco Grossière',      'GRM-005', 'Fibres longues non transformées pour paillage et drainage',               7500,  4900, 'sac 25 kg',      120, 12, 300),
  ('Pot de Culture 10 L Aéré',     'GRM-006', 'Pot géotextile aérant pour culture hors-sol, 30×25cm',                   3200,  2000, 'unité',          200, 20, 500)
) AS p(name, sku, description, unit_price, cost_price, unit_of_measure, stock_quantity, reorder_level, max_stock_level)
ON CONFLICT (sku) DO NOTHING;

-- ── Agriculture Advising ─────────────────────────────────────────────────────
INSERT INTO admin_products (name, sku, description, category_id, unit_price, cost_price, unit_of_measure, stock_quantity, reorder_level, max_stock_level, is_active)
SELECT
  p.name, p.sku, p.description,
  (SELECT id FROM admin_product_categories WHERE name = 'Agriculture Advising'),
  p.unit_price, p.cost_price, p.unit_of_measure,
  p.stock_quantity, p.reorder_level, p.max_stock_level, TRUE
FROM (VALUES
  ('Diagnostic Agronomique Terrain',       'ADV-001', 'Visite de parcelle, analyse de sol et rapport de recommandations (demi-journée)',  150000, 80000, 'prestation', 999, 0, 999),
  ('Plan de Fumure Personnalisé',          'ADV-002', 'Élaboration d''un plan d''amendement et de fertilisation sur mesure',             85000,  45000, 'rapport',    999, 0, 999),
  ('Formation Bonnes Pratiques Agricoles', 'ADV-003', 'Session de formation en groupe (8–20 personnes) sur les pratiques agricoles durables', 250000, 140000, 'session', 999, 0, 999),
  ('Audit Système Irrigation Existant',    'ADV-004', 'Évaluation de l''efficience hydrique et recommandations d''optimisation',         120000,  65000, 'prestation', 999, 0, 999),
  ('Suivi Mensuel Exploitation',           'ADV-005', 'Accompagnement agronomique mensuel — 2 visites/mois + rapport',                   180000,  95000, 'mois',       999, 0, 999)
) AS p(name, sku, description, unit_price, cost_price, unit_of_measure, stock_quantity, reorder_level, max_stock_level)
ON CONFLICT (sku) DO NOTHING;

-- ── Project Management ───────────────────────────────────────────────────────
INSERT INTO admin_products (name, sku, description, category_id, unit_price, cost_price, unit_of_measure, stock_quantity, reorder_level, max_stock_level, is_active)
SELECT
  p.name, p.sku, p.description,
  (SELECT id FROM admin_product_categories WHERE name = 'Project Management'),
  p.unit_price, p.cost_price, p.unit_of_measure,
  p.stock_quantity, p.reorder_level, p.max_stock_level, TRUE
FROM (VALUES
  ('Étude de Faisabilité Projet Serre',    'PMG-001', 'Analyse technico-économique et plan d''investissement pour serre maraîchère',     380000, 210000, 'étude',      999, 0, 999),
  ('Coordination Installation Clé en Main','PMG-002', 'Gestion de chantier, supervision et réception d''un projet serre ou irrigation',  550000, 320000, 'projet',     999, 0, 999),
  ('Reporting & Suivi Financier Projet',   'PMG-003', 'Tableaux de bord, suivi budgétaire et rapports d''avancement mensuels',           120000,  65000, 'mois',       999, 0, 999),
  ('Sourcing & Procurement Matériaux',     'PMG-004', 'Identification fournisseurs, négociation et achats pour projets agricoles',        95000,  52000, 'prestation', 999, 0, 999),
  ('Formation Opérateurs Équipements',     'PMG-005', 'Formation des opérateurs locaux à la conduite et maintenance des équipements',    200000, 110000, 'session',    999, 0, 999)
) AS p(name, sku, description, unit_price, cost_price, unit_of_measure, stock_quantity, reorder_level, max_stock_level)
ON CONFLICT (sku) DO NOTHING;
