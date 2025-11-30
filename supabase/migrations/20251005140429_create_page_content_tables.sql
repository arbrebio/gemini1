/*
  # Create Page Content Tables for Full Website Internationalization

  ## New Tables
  
  1. `page_sections`
    - `id` (uuid, primary key)
    - `page_name` (text) - e.g., 'greenhouses_index', 'irrigation_index'
    - `section_key` (text) - e.g., 'hero', 'features', 'specifications'
    - `order_index` (integer) - display order
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
  
  2. `page_section_translations`
    - `id` (uuid, primary key)
    - `section_id` (uuid, foreign key to page_sections)
    - `language` (text) - 'en', 'fr', 'es', 'af'
    - `title` (text)
    - `subtitle` (text)
    - `description` (text)
    - `content` (jsonb) - flexible content structure
    - `cta_text` (text)
    - `cta_url` (text)
    - `image_url` (text)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
  
  3. `blog_posts`
    - `id` (uuid, primary key)
    - `slug` (text, unique)
    - `author` (text)
    - `image` (text)
    - `category` (text)
    - `featured` (boolean)
    - `pub_date` (date)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
  
  4. `blog_post_translations`
    - `id` (uuid, primary key)
    - `post_id` (uuid, foreign key to blog_posts)
    - `language` (text) - 'en', 'fr', 'es', 'af'
    - `title` (text)
    - `description` (text)
    - `content` (text) - full markdown/html content
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
  
  5. `static_translations`
    - `id` (uuid, primary key)
    - `key` (text, unique) - translation key
    - `category` (text) - grouping for organization
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
  
  6. `static_translation_values`
    - `id` (uuid, primary key)
    - `translation_id` (uuid, foreign key to static_translations)
    - `language` (text) - 'en', 'fr', 'es', 'af'
    - `value` (text)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for public read access
  - Add policies for authenticated admin write access
*/

-- Create page_sections table
CREATE TABLE IF NOT EXISTS page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name text NOT NULL,
  section_key text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(page_name, section_key)
);

ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read page sections"
  ON page_sections FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage page sections"
  ON page_sections FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create page_section_translations table
CREATE TABLE IF NOT EXISTS page_section_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES page_sections(id) ON DELETE CASCADE,
  language text NOT NULL CHECK (language IN ('en', 'fr', 'es', 'af')),
  title text,
  subtitle text,
  description text,
  content jsonb DEFAULT '{}'::jsonb,
  cta_text text,
  cta_url text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(section_id, language)
);

ALTER TABLE page_section_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read page section translations"
  ON page_section_translations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage page section translations"
  ON page_section_translations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  author text NOT NULL,
  image text,
  category text NOT NULL,
  featured boolean DEFAULT false,
  pub_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read blog posts"
  ON blog_posts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage blog posts"
  ON blog_posts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create blog_post_translations table
CREATE TABLE IF NOT EXISTS blog_post_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  language text NOT NULL CHECK (language IN ('en', 'fr', 'es', 'af')),
  title text NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(post_id, language)
);

ALTER TABLE blog_post_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read blog post translations"
  ON blog_post_translations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage blog post translations"
  ON blog_post_translations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create static_translations table
CREATE TABLE IF NOT EXISTS static_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE static_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read static translations"
  ON static_translations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage static translations"
  ON static_translations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create static_translation_values table
CREATE TABLE IF NOT EXISTS static_translation_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  translation_id uuid NOT NULL REFERENCES static_translations(id) ON DELETE CASCADE,
  language text NOT NULL CHECK (language IN ('en', 'fr', 'es', 'af')),
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(translation_id, language)
);

ALTER TABLE static_translation_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read static translation values"
  ON static_translation_values FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage static translation values"
  ON static_translation_values FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_page_sections_page_name ON page_sections(page_name);
CREATE INDEX IF NOT EXISTS idx_page_section_translations_section_id ON page_section_translations(section_id);
CREATE INDEX IF NOT EXISTS idx_page_section_translations_language ON page_section_translations(language);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);
CREATE INDEX IF NOT EXISTS idx_blog_post_translations_post_id ON blog_post_translations(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_translations_language ON blog_post_translations(language);
CREATE INDEX IF NOT EXISTS idx_static_translations_key ON static_translations(key);
CREATE INDEX IF NOT EXISTS idx_static_translation_values_translation_id ON static_translation_values(translation_id);
CREATE INDEX IF NOT EXISTS idx_static_translation_values_language ON static_translation_values(language);