/*
# Fix Newsletter Subscription Functionality

1. New Tables
   - No new tables created

2. Changes
   - Add trigger function to update updated_at column
   - Add trigger to newsletter_subscribers table

3. Security
   - No security changes
*/

-- Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to newsletter_subscribers table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_newsletter_subscribers_updated_at'
    ) THEN
        CREATE TRIGGER update_newsletter_subscribers_updated_at
        BEFORE UPDATE ON newsletter_subscribers
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Ensure the newsletter_subscribers table has the correct structure
DO $$
BEGIN
    -- Check if confirmation_token has a default value, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'newsletter_subscribers' 
        AND column_name = 'confirmation_token' 
        AND column_default IS NOT NULL
    ) THEN
        ALTER TABLE newsletter_subscribers 
        ALTER COLUMN confirmation_token 
        SET DEFAULT encode(gen_random_bytes(32), 'hex'::text);
    END IF;
    
    -- Check if status has a default value, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'newsletter_subscribers' 
        AND column_name = 'status' 
        AND column_default = '''pending''::text'
    ) THEN
        ALTER TABLE newsletter_subscribers 
        ALTER COLUMN status 
        SET DEFAULT 'pending'::text;
    END IF;
    
    -- Check if confirmed has a default value, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'newsletter_subscribers' 
        AND column_name = 'confirmed' 
        AND column_default = 'false'
    ) THEN
        ALTER TABLE newsletter_subscribers 
        ALTER COLUMN confirmed 
        SET DEFAULT false;
    END IF;
    
    -- Check if created_at has a default value, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'newsletter_subscribers' 
        AND column_name = 'created_at' 
        AND column_default = 'now()'
    ) THEN
        ALTER TABLE newsletter_subscribers 
        ALTER COLUMN created_at 
        SET DEFAULT now();
    END IF;
    
    -- Check if updated_at has a default value, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'newsletter_subscribers' 
        AND column_name = 'updated_at' 
        AND column_default = 'now()'
    ) THEN
        ALTER TABLE newsletter_subscribers 
        ALTER COLUMN updated_at 
        SET DEFAULT now();
    END IF;
END $$;