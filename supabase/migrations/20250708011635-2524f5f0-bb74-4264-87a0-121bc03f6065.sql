-- Add missing final week columns to weekly_results table
ALTER TABLE public.weekly_results 
ADD COLUMN IF NOT EXISTS winner TEXT,
ADD COLUMN IF NOT EXISTS runner_up TEXT,
ADD COLUMN IF NOT EXISTS americas_favorite_player TEXT;