-- Set registration deadline to 7 days from now for testing
UPDATE public.pool_settings 
SET registration_deadline = now() + interval '7 days', 
    updated_at = now();

-- Verify we now have 5 snapshots for week 1
SELECT COUNT(*) as snapshot_count, week_number FROM public.weekly_team_snapshots 
WHERE week_number = 1 GROUP BY week_number;