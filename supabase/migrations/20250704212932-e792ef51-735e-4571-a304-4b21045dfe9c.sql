-- Update current game week to 7 (which matches the logs)
UPDATE public.current_game_week SET week_number = 7, updated_at = now();

-- Test the fixed function by regenerating week 1 snapshots
SELECT public.generate_weekly_snapshots(1);