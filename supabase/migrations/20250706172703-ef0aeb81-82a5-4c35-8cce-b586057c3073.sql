-- Add number_of_free_picks column to pools table
ALTER TABLE public.pools ADD COLUMN number_of_free_picks INTEGER DEFAULT 1;