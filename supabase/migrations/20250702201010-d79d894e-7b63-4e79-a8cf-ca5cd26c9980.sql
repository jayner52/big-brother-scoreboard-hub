-- Clear existing special events and add the exact 8 events from user requirements
DELETE FROM detailed_scoring_rules WHERE category = 'special_events';

-- Insert the exact special events with correct point values
INSERT INTO detailed_scoring_rules (category, subcategory, points, description, is_active) VALUES
('special_events', 'in_showmance', 2, 'In a showmance', true),
('special_events', 'wins_prize', 2, 'Wins a prize (cash, vacation)', true),
('special_events', 'costume_punishment', -1, 'Costume/Punishment/Consequence (not slop)', true),
('special_events', 'leaves_not_eviction', -3, 'Leaves not at eviction', true),
('special_events', 'comes_back_evicted', 5, 'Comes back after being evicted', true),
('special_events', 'special_power', 2, 'Given/Wins Special Power', true),
('special_events', 'power_from_hg', 1, 'Given power/prize from other HG', true),
('special_events', 'granted_safety', 1, 'Granted safety for the week/team wins comp', true);

-- Add POV saved by veto points rule
INSERT INTO detailed_scoring_rules (category, subcategory, points, description, is_active) VALUES
('weekly', 'saved_by_veto', 1, 'Saved by Power of Veto', true);

-- Add enable_bonus_questions setting to pool_settings if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pool_settings' AND column_name = 'enable_bonus_questions') THEN
        ALTER TABLE pool_settings ADD COLUMN enable_bonus_questions boolean DEFAULT true;
    END IF;
END $$;