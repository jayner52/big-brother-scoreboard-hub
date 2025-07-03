-- Add season tracking and clean up contestants table
ALTER TABLE public.contestants 
ADD COLUMN IF NOT EXISTS season_number INTEGER DEFAULT 26;

-- Add data source tracking
ALTER TABLE public.contestants 
ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'manual';

-- Create index for season filtering
CREATE INDEX IF NOT EXISTS idx_contestants_season ON public.contestants(season_number);

-- Clear all existing contestants to start fresh
DELETE FROM public.contestants;