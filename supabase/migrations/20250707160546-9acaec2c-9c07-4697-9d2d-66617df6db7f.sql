-- Add prize visibility control fields to pools table
ALTER TABLE public.pools 
ADD COLUMN IF NOT EXISTS show_prize_total boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_prize_amounts boolean DEFAULT true;