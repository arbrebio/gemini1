-- Add ID card fields to career_employees
ALTER TABLE career_employees
  ADD COLUMN IF NOT EXISTS id_card_front_url  TEXT,
  ADD COLUMN IF NOT EXISTS id_card_back_url   TEXT,
  ADD COLUMN IF NOT EXISTS id_number          TEXT,
  ADD COLUMN IF NOT EXISTS id_card_expiry     DATE,
  ADD COLUMN IF NOT EXISTS gender             TEXT;

COMMENT ON COLUMN career_employees.id_card_front_url IS 'Supabase Storage URL for front side of ID card';
COMMENT ON COLUMN career_employees.id_card_back_url  IS 'Supabase Storage URL for back side of ID card';
COMMENT ON COLUMN career_employees.id_number         IS 'National ID / passport number';
COMMENT ON COLUMN career_employees.id_card_expiry    IS 'Expiry date of the ID card';
COMMENT ON COLUMN career_employees.gender            IS 'Gender as read from ID card';
