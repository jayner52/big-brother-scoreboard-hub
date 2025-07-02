-- Fix scoring rules to match the user's chart
UPDATE public.detailed_scoring_rules 
SET points = 3 
WHERE subcategory = 'hoh_winner';

UPDATE public.detailed_scoring_rules 
SET points = 3 
WHERE subcategory = 'pov_winner';

UPDATE public.detailed_scoring_rules 
SET points = 1 
WHERE subcategory = 'survival';

-- Remove Have/Have Not entries
DELETE FROM public.detailed_scoring_rules 
WHERE subcategory LIKE '%have%' OR subcategory LIKE '%not%';

-- Fix special event scoring
UPDATE public.detailed_scoring_rules 
SET points = 2 
WHERE subcategory = 'prize_won';

UPDATE public.detailed_scoring_rules 
SET points = -1 
WHERE subcategory = 'punishment';

-- Add missing special event types from the chart
INSERT INTO public.detailed_scoring_rules (category, subcategory, points, description, is_active) VALUES
('special_events', 'win_prize', 2, 'Won a prize/reward', true),
('special_events', 'punishment', -1, 'Received punishment', true),
('special_events', 'backdoor', 1, 'Backdoored someone', true),
('special_events', 'alliance_betrayal', 1, 'Betrayed alliance member', true),
('special_events', 'showmance', 1, 'In a showmance', true),
('jury', 'jury_member', 2, 'Made it to jury', true),
('final_placement', 'winner', 10, 'Won the game', true),
('final_placement', 'runner_up', 5, 'Runner-up', true),
('final_placement', 'americas_favorite', 3, 'Americas Favorite Player', true)
ON CONFLICT DO NOTHING;

-- Update bonus questions to match the chart with correct point values
DELETE FROM public.bonus_questions;

INSERT INTO public.bonus_questions (question_text, question_type, sort_order, points_value, is_active) VALUES
('Who will win Big Brother?', 'player_select', 1, 10, true),
('Who will be the runner-up?', 'player_select', 2, 5, true),
('Who will be Americas Favorite Player?', 'player_select', 3, 3, true),
('Who will be evicted first?', 'player_select', 4, 2, true),
('Who will be evicted second?', 'player_select', 5, 2, true),
('Who will be evicted third?', 'player_select', 6, 2, true),
('Who will win the first HOH?', 'player_select', 7, 1, true),
('Who will win the first POV?', 'player_select', 8, 1, true),
('Will there be a double eviction?', 'yes_no', 9, 1, true),
('How many showmances will there be?', 'number', 10, 1, true);

-- Add jury phase controls to pool_settings if not exists
ALTER TABLE public.pool_settings 
ADD COLUMN IF NOT EXISTS jury_phase_active boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS jury_start_week integer,
ADD COLUMN IF NOT EXISTS jury_start_timestamp timestamp with time zone;