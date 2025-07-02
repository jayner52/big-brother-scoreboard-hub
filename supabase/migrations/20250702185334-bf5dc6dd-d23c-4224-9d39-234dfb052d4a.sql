-- Update scoring rules to match the user's chart exactly
UPDATE public.detailed_scoring_rules 
SET points = 3 
WHERE category = 'competitions' AND subcategory = 'hoh_winner';

UPDATE public.detailed_scoring_rules 
SET points = 3 
WHERE category = 'competitions' AND subcategory = 'pov_winner';

UPDATE public.detailed_scoring_rules 
SET points = 1 
WHERE category = 'weekly' AND subcategory = 'survival';

-- Remove Have/Have Not competitions
DELETE FROM public.detailed_scoring_rules 
WHERE subcategory LIKE '%have%' OR subcategory LIKE '%not%';

-- Add leaving not at eviction penalty
INSERT INTO public.detailed_scoring_rules (category, subcategory, points, description, is_active)
VALUES ('penalties', 'leaving_not_eviction', -5, 'Points deducted for leaving the game outside of eviction', true);

-- Add jury points
INSERT INTO public.detailed_scoring_rules (category, subcategory, points, description, is_active)
VALUES ('weekly', 'jury_member', 2, 'Points for making it to jury phase', true);

-- Add final placement points
INSERT INTO public.detailed_scoring_rules (category, subcategory, points, description, is_active)
VALUES ('final_placement', 'winner', 15, 'Points for winning the game', true);

INSERT INTO public.detailed_scoring_rules (category, subcategory, points, description, is_active)
VALUES ('final_placement', 'runner_up', 10, 'Points for runner-up', true);

INSERT INTO public.detailed_scoring_rules (category, subcategory, points, description, is_active)
VALUES ('final_placement', 'third_place', 8, 'Points for third place', true);

INSERT INTO public.detailed_scoring_rules (category, subcategory, points, description, is_active)
VALUES ('final_placement', 'fourth_place', 6, 'Points for fourth place', true);

INSERT INTO public.detailed_scoring_rules (category, subcategory, points, description, is_active)
VALUES ('final_placement', 'americas_favorite', 5, 'Points for Americas Favorite Player', true);

-- Add prize pool management table
CREATE TABLE public.prize_pools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  place_number INTEGER NOT NULL,
  prize_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'CAD',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for prize pools
ALTER TABLE public.prize_pools ENABLE ROW LEVEL SECURITY;

-- Create policies for prize pools
CREATE POLICY "Everyone can view prize pools" 
ON public.prize_pools 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage prize pools" 
ON public.prize_pools 
FOR ALL 
USING (true);

-- Add jury management to pool_settings
ALTER TABLE public.pool_settings 
ADD COLUMN IF NOT EXISTS jury_phase_started BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.pool_settings 
ADD COLUMN IF NOT EXISTS jury_start_timestamp TIMESTAMP WITH TIME ZONE;

-- Add current game status tracking to contestants
ALTER TABLE public.contestants 
ADD COLUMN IF NOT EXISTS current_hoh BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.contestants 
ADD COLUMN IF NOT EXISTS current_pov_winner BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.contestants 
ADD COLUMN IF NOT EXISTS currently_nominated BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.contestants 
ADD COLUMN IF NOT EXISTS pov_used_on BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.contestants 
ADD COLUMN IF NOT EXISTS final_placement INTEGER;

ALTER TABLE public.contestants 
ADD COLUMN IF NOT EXISTS americas_favorite BOOLEAN NOT NULL DEFAULT false;

-- Update bonus questions to match user's chart exactly
DELETE FROM public.bonus_questions;

INSERT INTO public.bonus_questions (question_text, question_type, sort_order, points_value, is_active) VALUES
('Who will be the first houseguest evicted?', 'player_select', 1, 5, true),
('Who will be the last houseguest evicted before finale night?', 'player_select', 2, 5, true),
('Who will win the most competitions overall?', 'player_select', 3, 5, true),
('Who will be nominated the most times?', 'player_select', 4, 5, true),
('Which two houseguests will be the final nominees?', 'dual_player_select', 5, 5, true),
('Will there be a unanimous vote this season?', 'yes_no', 6, 5, true),
('How many competitions will the winner have won?', 'number', 7, 5, true),
('Who will win Big Brother?', 'player_select', 8, 10, true);

-- Create trigger for updated_at
CREATE TRIGGER update_prize_pools_updated_at
BEFORE UPDATE ON public.prize_pools
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();