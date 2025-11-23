/*
  # Create Podcast Management System

  ## Overview
  This migration creates a comprehensive podcast management system for educational content
  about precision agriculture. The system supports both audio and video podcasts with
  admin-controlled uploads and public access without subscription requirements.

  ## 1. New Tables
  
  ### podcast_categories
  - `id` (uuid, primary key) - Unique identifier for each category
  - `name` (text, not null) - Category name (e.g., "Irrigation", "Greenhouse Management")
  - `slug` (text, unique, not null) - URL-friendly version of category name
  - `description` (text) - Brief description of the category
  - `icon` (text) - Icon name or emoji for visual representation
  - `display_order` (integer) - Order for displaying categories
  - `created_at` (timestamptz) - Timestamp when category was created
  - `updated_at` (timestamptz) - Timestamp when category was last updated

  ### podcasts
  - `id` (uuid, primary key) - Unique identifier for each podcast
  - `title` (text, not null) - Podcast episode title
  - `slug` (text, unique, not null) - URL-friendly version of title
  - `description` (text) - Detailed description of the podcast content
  - `category_id` (uuid, foreign key) - References podcast_categories
  - `type` (text, not null) - Either 'audio' or 'video'
  - `duration_seconds` (integer) - Length of podcast in seconds
  - `audio_url` (text) - URL to audio file (Supabase Storage or Google Drive)
  - `video_url` (text) - URL to video file (Supabase Storage or Google Drive)
  - `thumbnail_url` (text) - URL to episode thumbnail image
  - `file_size_bytes` (bigint) - Size of the media file
  - `upload_source` (text) - Either 'direct' or 'google_drive'
  - `status` (text, not null) - 'draft', 'published', or 'archived'
  - `view_count` (integer) - Number of times podcast has been viewed
  - `download_count` (integer) - Number of times podcast has been downloaded
  - `published_at` (timestamptz) - When podcast was published
  - `created_at` (timestamptz) - Timestamp when podcast was created
  - `updated_at` (timestamptz) - Timestamp when podcast was last updated

  ## 2. Security Configuration
  
  ### Row Level Security (RLS)
  - Enable RLS on both tables
  - Public read access for published podcasts (no authentication required)
  - Admin-only write access using service role for managing content
  - Enforce restrictive policies to protect draft and archived content

  ## 3. Indexes
  - Index on podcasts.category_id for fast category filtering
  - Index on podcasts.published_at for chronological sorting
  - Index on podcasts.status for filtering by publication status
  - Index on podcasts.slug for fast URL lookups

  ## 4. Database Functions
  - Auto-update trigger for updated_at timestamps
  - Function to auto-generate slugs from titles if not provided
  - Function to increment view and download counts

  ## 5. Default Data
  - Pre-populate podcast_categories with common agriculture topics
*/

-- Create podcast_categories table
CREATE TABLE IF NOT EXISTS podcast_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text DEFAULT '🎙️',
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create podcasts table
CREATE TABLE IF NOT EXISTS podcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  category_id uuid REFERENCES podcast_categories(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('audio', 'video')),
  duration_seconds integer DEFAULT 0,
  audio_url text,
  video_url text,
  thumbnail_url text,
  file_size_bytes bigint DEFAULT 0,
  upload_source text DEFAULT 'direct' CHECK (upload_source IN ('direct', 'google_drive')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  view_count integer DEFAULT 0,
  download_count integer DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE podcast_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for podcast_categories

-- Allow anyone to view all categories
CREATE POLICY "Anyone can view podcast categories"
  ON podcast_categories
  FOR SELECT
  USING (true);

-- Only service role can manage categories
CREATE POLICY "Service role can manage categories"
  ON podcast_categories
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for podcasts

-- Allow anyone to view published podcasts
CREATE POLICY "Anyone can view published podcasts"
  ON podcasts
  FOR SELECT
  USING (status = 'published');

-- Only service role can manage podcasts
CREATE POLICY "Service role can manage podcasts"
  ON podcasts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_podcasts_category_id ON podcasts(category_id);
CREATE INDEX IF NOT EXISTS idx_podcasts_published_at ON podcasts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_podcasts_status ON podcasts(status);
CREATE INDEX IF NOT EXISTS idx_podcasts_slug ON podcasts(slug);
CREATE INDEX IF NOT EXISTS idx_podcast_categories_slug ON podcast_categories(slug);

-- Function to auto-update updated_at timestamp (reuse existing function if available)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
  ) THEN
    CREATE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Create triggers for updated_at
CREATE TRIGGER update_podcast_categories_updated_at
  BEFORE UPDATE ON podcast_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_podcasts_updated_at
  BEFORE UPDATE ON podcasts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_podcast_view_count(podcast_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE podcasts
  SET view_count = view_count + 1
  WHERE id = podcast_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_podcast_download_count(podcast_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE podcasts
  SET download_count = download_count + 1
  WHERE id = podcast_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default podcast categories
INSERT INTO podcast_categories (name, slug, description, icon, display_order) VALUES
  ('Irrigation Systems', 'irrigation-systems', 'Learn about modern irrigation techniques and water management', '💧', 1),
  ('Greenhouse Management', 'greenhouse-management', 'Expert tips on greenhouse construction and climate control', '🏡', 2),
  ('Crop Production', 'crop-production', 'Best practices for growing high-yield crops', '🌾', 3),
  ('Soil Health', 'soil-health', 'Understanding and improving soil quality for better yields', '🌱', 4),
  ('Precision Farming', 'precision-farming', 'Using technology and data for optimized farming', '📊', 5),
  ('Pest Management', 'pest-management', 'Integrated pest management strategies', '🐛', 6),
  ('Farm Business', 'farm-business', 'Agricultural business and marketing insights', '💼', 7),
  ('Success Stories', 'success-stories', 'Real farmer success stories and case studies', '⭐', 8)
ON CONFLICT (slug) DO NOTHING;