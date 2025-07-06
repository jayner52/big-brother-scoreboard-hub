-- Add allow_duplicate_picks field to pools table
ALTER TABLE public.pools ADD COLUMN IF NOT EXISTS allow_duplicate_picks boolean DEFAULT true;