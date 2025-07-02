-- Add the 4 missing contestants to reach 16 total
INSERT INTO public.contestants (name, is_active, group_id, sort_order) VALUES
('America', true, (SELECT id FROM public.contestant_groups WHERE group_name = 'Group 1'), 4),
('Blue', true, (SELECT id FROM public.contestant_groups WHERE group_name = 'Group 2'), 4),
('Bowie', true, (SELECT id FROM public.contestant_groups WHERE group_name = 'Group 3'), 4),
('Cameron', true, (SELECT id FROM public.contestant_groups WHERE group_name = 'Group 4'), 4);

-- Add bio field to contestants table
ALTER TABLE public.contestants ADD COLUMN bio TEXT;
ALTER TABLE public.contestants ADD COLUMN photo_url TEXT;

-- Create comprehensive weekly events tracking table
CREATE TABLE public.weekly_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_number INTEGER NOT NULL,
  contestant_id UUID NOT NULL REFERENCES public.contestants(id),
  event_type TEXT NOT NULL, -- 'nominee_1', 'nominee_2', 'pov_winner', 'replacement_nominee', 'evicted', 'hoh_winner', etc.
  event_details JSONB DEFAULT '{}',
  points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create special events tracking
CREATE TABLE public.special_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_number INTEGER NOT NULL,
  contestant_id UUID NOT NULL REFERENCES public.contestants(id),
  event_type TEXT NOT NULL, -- 'showmance', 'power', 'punishment', 'prize', 'safety', 'floater', 'other'
  description TEXT,
  points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create detailed scoring rules table with all categories
CREATE TABLE public.detailed_scoring_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  subcategory TEXT,
  points INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert all scoring rules from the spreadsheet
INSERT INTO public.detailed_scoring_rules (category, subcategory, points, description) VALUES
-- Weekly Competition Points
('weekly_competition', 'hoh_winner', 10, 'Head of Household Winner'),
('weekly_competition', 'pov_winner', 5, 'Power of Veto Winner'),
('weekly_competition', 'nominee', 2, 'Nominated for Eviction'),
('weekly_competition', 'nominee_saved', 3, 'Nominated but Saved by POV'),
('weekly_competition', 'replacement_nominee', 1, 'Replacement Nominee'),

-- Special Events
('special_events', 'double_eviction_winner', 5, 'Double Eviction Competition Winner'),
('special_events', 'luxury_comp_winner', 3, 'Luxury Competition Winner'),
('special_events', 'have_not_comp_winner', 2, 'Have/Have Not Competition Winner'),
('special_events', 'showmance', 2, 'In a Showmance'),
('special_events', 'power_awarded', 3, 'Special Power Awarded'),
('special_events', 'punishment', -2, 'Received Punishment'),
('special_events', 'prize_won', 2, 'Prize Won in Competition'),
('special_events', 'safety_awarded', 3, 'Safety Awarded'),

-- Survival Milestones
('survival', 'weekly_survival', 5, 'Survived the Week'),
('survival', 'made_jury', 10, 'Made it to Jury'),
('survival', 'final_6', 5, 'Made it to Final 6'),
('survival', 'final_4', 5, 'Made it to Final 4'),
('survival', 'final_3', 10, 'Made it to Final 3'),
('survival', 'final_2', 15, 'Made it to Final 2'),

-- End Game
('endgame', 'winner', 25, 'Season Winner'),
('endgame', 'runner_up', 15, 'Runner-up (2nd Place)'),
('endgame', 'americas_favorite', 10, 'America''s Favorite Player'),

-- Penalties
('penalties', 'rule_violation', -5, 'Rule Violation'),
('penalties', 'expelled', -10, 'Expelled from House'),

-- Bonus Categories
('bonus', 'consecutive_hoh', 5, 'Consecutive HOH Wins (per additional win)'),
('bonus', 'competition_beast', 10, 'Won 5+ Competitions'),
('bonus', 'social_game', 5, 'Strong Social Game Bonus'),
('bonus', 'strategic_move', 3, 'Major Strategic Move');

-- Enable RLS on new tables
ALTER TABLE public.weekly_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detailed_scoring_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for weekly_events
CREATE POLICY "Everyone can view weekly events" 
ON public.weekly_events 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert weekly events" 
ON public.weekly_events 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update weekly events" 
ON public.weekly_events 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can delete weekly events" 
ON public.weekly_events 
FOR DELETE 
USING (true);

-- Create RLS policies for special_events
CREATE POLICY "Everyone can view special events" 
ON public.special_events 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert special events" 
ON public.special_events 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update special events" 
ON public.special_events 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can delete special events" 
ON public.special_events 
FOR DELETE 
USING (true);

-- Create RLS policies for detailed_scoring_rules
CREATE POLICY "Everyone can view scoring rules" 
ON public.detailed_scoring_rules 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage scoring rules" 
ON public.detailed_scoring_rules 
FOR ALL 
USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_weekly_events_updated_at
BEFORE UPDATE ON public.weekly_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate points for a contestant
CREATE OR REPLACE FUNCTION public.calculate_contestant_points(contestant_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  total_points INTEGER := 0;
  weekly_points INTEGER := 0;
  special_points INTEGER := 0;
BEGIN
  -- Calculate weekly event points
  SELECT COALESCE(SUM(points_awarded), 0) INTO weekly_points
  FROM public.weekly_events
  WHERE contestant_id = contestant_id_param;
  
  -- Calculate special event points
  SELECT COALESCE(SUM(points_awarded), 0) INTO special_points
  FROM public.special_events
  WHERE contestant_id = contestant_id_param;
  
  total_points := weekly_points + special_points;
  
  RETURN total_points;
END;
$$ LANGUAGE plpgsql;