
-- Phase 1: Remove duplicate/unused database entries and fields
-- Delete inactive bb_arena_winner scoring rule (keeping the active one)
DELETE FROM detailed_scoring_rules 
WHERE subcategory = 'bb_arena_winner' 
AND is_active = false;

-- Remove unused contestant fields from old system
ALTER TABLE contestants 
DROP COLUMN IF EXISTS times_on_block_at_eviction,
DROP COLUMN IF EXISTS times_saved_by_veto;

-- Clean up any orphaned weekly_events that might be using old rule IDs
DELETE FROM weekly_events 
WHERE event_type NOT IN (
  SELECT id::text FROM detailed_scoring_rules WHERE is_active = true
) AND event_type ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Ensure BB Arena Winner has correct emoji in database
UPDATE detailed_scoring_rules 
SET emoji = '🏟️' 
WHERE subcategory = 'bb_arena_winner' 
AND is_active = true;
