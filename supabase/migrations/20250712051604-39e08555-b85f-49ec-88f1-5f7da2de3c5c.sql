-- Add additional player columns to support larger teams (up to 12 players)
-- This fixes the issue where only 5 players save even when picks_per_team is higher

ALTER TABLE public.pool_entries 
ADD COLUMN player_6 text,
ADD COLUMN player_7 text,
ADD COLUMN player_8 text,
ADD COLUMN player_9 text,
ADD COLUMN player_10 text,
ADD COLUMN player_11 text,
ADD COLUMN player_12 text;