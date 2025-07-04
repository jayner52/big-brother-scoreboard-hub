-- Add missing AI Arena columns to weekly_results table
ALTER TABLE public.weekly_results 
ADD COLUMN IF NOT EXISTS ai_arena_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_arena_winner text DEFAULT NULL;