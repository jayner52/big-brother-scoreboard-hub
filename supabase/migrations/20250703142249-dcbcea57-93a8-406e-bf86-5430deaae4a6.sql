-- Update current game week to 5 since weeks 1-4 are completed
UPDATE current_game_week SET week_number = 5, updated_at = now();

-- Regenerate snapshots for all completed weeks to include all 6 entries
SELECT generate_weekly_snapshots(1);
SELECT generate_weekly_snapshots(2);
SELECT generate_weekly_snapshots(3);
SELECT generate_weekly_snapshots(4);