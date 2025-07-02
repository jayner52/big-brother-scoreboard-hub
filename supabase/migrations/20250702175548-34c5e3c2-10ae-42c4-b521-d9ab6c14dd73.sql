-- Update pool settings for Big Brother 27 and add flexible configuration
UPDATE pool_settings SET 
  season_name = 'Big Brother 27',
  updated_at = now();

-- Add flexible pool configuration fields
ALTER TABLE pool_settings
ADD COLUMN IF NOT EXISTS number_of_groups INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS picks_per_team INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS enable_free_pick BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS group_names TEXT[] DEFAULT ARRAY['Group A', 'Group B', 'Group C', 'Group D'];

-- Add email field to pool entries
ALTER TABLE pool_entries
ADD COLUMN IF NOT EXISTS email TEXT;

-- Fix contestant group assignments to be balanced (4 groups of 4)
-- First, get the current contestants and redistribute them
WITH balanced_assignment AS (
  SELECT 
    id,
    name,
    ROW_NUMBER() OVER (ORDER BY name) as rn,
    CASE 
      WHEN ROW_NUMBER() OVER (ORDER BY name) % 4 = 1 THEN (SELECT id FROM contestant_groups WHERE group_name = 'Group A')
      WHEN ROW_NUMBER() OVER (ORDER BY name) % 4 = 2 THEN (SELECT id FROM contestant_groups WHERE group_name = 'Group B')
      WHEN ROW_NUMBER() OVER (ORDER BY name) % 4 = 3 THEN (SELECT id FROM contestant_groups WHERE group_name = 'Group C')
      ELSE (SELECT id FROM contestant_groups WHERE group_name = 'Group D')
    END as new_group_id
  FROM contestants 
  WHERE is_active = true
)
UPDATE contestants 
SET group_id = balanced_assignment.new_group_id
FROM balanced_assignment 
WHERE contestants.id = balanced_assignment.id;

-- Add missing Big Brother 27 contestants if needed
INSERT INTO contestants (name, is_active, sort_order) VALUES
('Ainsley', true, 17),
('Cedric', true, 18),
('Leah', true, 19)
ON CONFLICT (name) DO NOTHING;

-- Add Quits/Expelled special event to scoring rules
INSERT INTO detailed_scoring_rules (category, subcategory, points, description, is_active) VALUES
('Special Events', 'Quits/Expelled', -3, 'Contestant quits or is expelled from the game', true)
ON CONFLICT DO NOTHING;

-- Update other scoring rules to match the user's screenshot
UPDATE detailed_scoring_rules SET points = 3 WHERE category = 'Weekly Competition' AND subcategory = 'Head of Household';
UPDATE detailed_scoring_rules SET points = 2 WHERE category = 'Weekly Competition' AND subcategory = 'Power of Veto';
UPDATE detailed_scoring_rules SET points = -2 WHERE category = 'Weekly Competition' AND subcategory = 'Evicted';
UPDATE detailed_scoring_rules SET points = 1 WHERE category = 'Weekly Competition' AND subcategory = 'Survival';

-- Add additional scoring rules
INSERT INTO detailed_scoring_rules (category, subcategory, points, description, is_active) VALUES
('Special Events', 'Competition Win', 1, 'Wins any competition (excluding HOH/POV)', true),
('Special Events', 'Have-Not', -1, 'Selected as a Have-Not for the week', true),
('Special Events', 'Punishment', -1, 'Receives a punishment from a competition', true),
('Special Events', 'Prize', 1, 'Wins a prize from a competition', true),
('Milestones', 'Make Jury', 3, 'Survives to become a jury member', true),
('Milestones', 'Final 3', 5, 'Reaches the final 3', true),
('Milestones', 'Final 2', 8, 'Reaches the final 2', true),
('Milestones', 'Winner', 15, 'Wins Big Brother', true)
ON CONFLICT DO NOTHING;