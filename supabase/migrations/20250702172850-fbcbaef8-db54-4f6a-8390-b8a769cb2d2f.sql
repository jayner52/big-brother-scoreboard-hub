-- Fix contestant group assignments - distribute contestants across groups A-D
-- Get the contestant IDs first, then assign them to groups
UPDATE contestants 
SET group_id = (
  SELECT id FROM contestant_groups 
  WHERE group_name = CASE 
    WHEN contestants.name IN ('Ainsley', 'Angela', 'Brooklyn', 'Cam') THEN 'Group A'
    WHEN contestants.name IN ('Cedric', 'Chelsie', 'Joseph', 'Kimo') THEN 'Group B'  
    WHEN contestants.name IN ('Leah', 'Lisa', 'Makensy', 'Quinn') THEN 'Group C'
    ELSE 'Group D'
  END
  LIMIT 1
)
WHERE group_id IS NULL OR group_id NOT IN (SELECT id FROM contestant_groups);

-- Add bio fields for contestants
ALTER TABLE contestants 
ADD COLUMN IF NOT EXISTS hometown TEXT,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS occupation TEXT;

-- Add jury phase tracking to pool settings
ALTER TABLE pool_settings
ADD COLUMN IF NOT EXISTS jury_phase_active BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS jury_start_week INTEGER;

-- Add double eviction support to weekly events
ALTER TABLE weekly_events
ADD COLUMN IF NOT EXISTS eviction_round INTEGER DEFAULT 1;

-- Update weekly_results for double eviction support
ALTER TABLE weekly_results
ADD COLUMN IF NOT EXISTS is_double_eviction BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS second_hoh_winner TEXT,
ADD COLUMN IF NOT EXISTS second_pov_winner TEXT,
ADD COLUMN IF NOT EXISTS second_evicted_contestant TEXT;