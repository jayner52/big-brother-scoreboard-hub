-- Fix Week 4 completion status to unblock weekly progression
UPDATE weekly_results 
SET is_draft = false 
WHERE week_number = 4;

-- Ensure current game week is properly set to Week 5 (since Week 4 should be complete)
UPDATE current_game_week 
SET week_number = 5, updated_at = now();