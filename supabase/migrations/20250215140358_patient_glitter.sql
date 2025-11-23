/*
  # Newsletter Subscription System

  1. New Tables
    - `newsletter_subscribers`
      - `id` (uuid, primary key)
      - `full_name` (text, nullable)
      - `email` (text, unique, not null)
      - `source` (text, not null)
      - `status` (text, not null) - active/unsubscribed
      - `confirmed` (boolean, not null)
      - `confirmation_token` (text, unique)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `newsletter_subscribers` table
    - Add policies for service role access
*/

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  email text UNIQUE NOT NULL,
  source text NOT NULL DEFAULT 'website',
  status text NOT NULL DEFAULT 'pending',
  confirmed boolean NOT NULL DEFAULT false,
  confirmation_token text UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy for service role to manage subscribers
CREATE POLICY "Service role can manage subscribers"
  ON newsletter_subscribers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_newsletter_subscribers_updated_at
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();