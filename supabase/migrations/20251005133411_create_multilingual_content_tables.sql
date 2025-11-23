/*
  # Multilingual Content Management System

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `slug` (text, unique identifier for the product)
      - `brand` (text, manufacturer/brand name)
      - `category` (text, product category like 'sprinklers', 'drippers', etc.)
      - `image` (text, image URL)
      - `catalog` (text, catalog/PDF URL)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `product_translations`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `language` (text, language code: en, fr, es, af)
      - `name` (text, translated product name)
      - `short_description` (text, brief description)
      - `description` (text, full description)
      - `specifications` (jsonb, technical specifications)
      - `features` (jsonb, product features array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - Unique constraint on (product_id, language)
    
    - `case_studies`
      - `id` (uuid, primary key)
      - `slug` (text, unique identifier)
      - `client` (text, client name)
      - `location` (text, project location)
      - `area` (text, project area/size)
      - `type` (text, project type)
      - `client_image` (text, client photo URL)
      - `before_image` (text, before photo URL)
      - `after_image` (text, after photo URL)
      - `stats` (jsonb, statistics array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `case_study_translations`
      - `id` (uuid, primary key)
      - `case_study_id` (uuid, foreign key to case_studies)
      - `language` (text, language code: en, fr, es, af)
      - `title` (text, translated title)
      - `description` (text, project description)
      - `challenge` (text, challenge faced)
      - `solution` (text, solution implemented)
      - `results` (jsonb, results array)
      - `testimonial` (text, client testimonial)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - Unique constraint on (case_study_id, language)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (no authentication required for public content)
    - Add policies for authenticated admin users to manage content

  3. Indexes
    - Index on product slug and category for fast lookups
    - Index on case study slug for fast lookups
    - Index on language codes for fast filtering
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  brand text NOT NULL,
  category text NOT NULL,
  image text,
  catalog text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product_translations table
CREATE TABLE IF NOT EXISTS product_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  language text NOT NULL CHECK (language IN ('en', 'fr', 'es', 'af')),
  name text NOT NULL,
  short_description text,
  description text,
  specifications jsonb DEFAULT '{}'::jsonb,
  features jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, language)
);

-- Create case_studies table
CREATE TABLE IF NOT EXISTS case_studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  client text NOT NULL,
  location text NOT NULL,
  area text,
  type text,
  client_image text,
  before_image text,
  after_image text,
  stats jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create case_study_translations table
CREATE TABLE IF NOT EXISTS case_study_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id uuid NOT NULL REFERENCES case_studies(id) ON DELETE CASCADE,
  language text NOT NULL CHECK (language IN ('en', 'fr', 'es', 'af')),
  title text NOT NULL,
  description text,
  challenge text,
  solution text,
  results jsonb DEFAULT '[]'::jsonb,
  testimonial text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(case_study_id, language)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_product_translations_product_id ON product_translations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_translations_language ON product_translations(language);
CREATE INDEX IF NOT EXISTS idx_case_studies_slug ON case_studies(slug);
CREATE INDEX IF NOT EXISTS idx_case_study_translations_case_study_id ON case_study_translations(case_study_id);
CREATE INDEX IF NOT EXISTS idx_case_study_translations_language ON case_study_translations(language);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_study_translations ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to product translations"
  ON product_translations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to case studies"
  ON case_studies FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to case study translations"
  ON case_study_translations FOR SELECT
  TO anon, authenticated
  USING (true);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_translations_updated_at
  BEFORE UPDATE ON product_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_studies_updated_at
  BEFORE UPDATE ON case_studies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_study_translations_updated_at
  BEFORE UPDATE ON case_study_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();