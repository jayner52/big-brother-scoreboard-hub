-- Create pool_settings table for configurable pool management
CREATE TABLE public.pool_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season_name TEXT NOT NULL DEFAULT 'Big Brother 26',
  entry_fee_amount DECIMAL(10,2) NOT NULL DEFAULT 25.00,
  entry_fee_currency TEXT NOT NULL DEFAULT 'CAD',
  payment_method_1 TEXT NOT NULL DEFAULT 'E-transfer',
  payment_details_1 TEXT NOT NULL DEFAULT 'email@example.com',
  payment_method_2 TEXT DEFAULT 'Venmo',
  payment_details_2 TEXT DEFAULT '@username',
  registration_deadline TIMESTAMP WITH TIME ZONE,
  draft_open BOOLEAN NOT NULL DEFAULT true,
  season_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contestant_groups table for organizing draft groups
CREATE TABLE public.contestant_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_name TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bonus_questions table for managing prediction questions
CREATE TABLE public.bonus_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('player_select', 'dual_player_select', 'yes_no', 'number')),
  sort_order INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  correct_answer TEXT,
  points_value INTEGER NOT NULL DEFAULT 5,
  answer_revealed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add group assignment to contestants table
ALTER TABLE public.contestants 
ADD COLUMN group_id UUID REFERENCES public.contestant_groups(id),
ADD COLUMN sort_order INTEGER DEFAULT 0;

-- Recreate pool_entries table with new team structure
DROP TABLE IF EXISTS public.pool_entries;

CREATE TABLE public.pool_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  participant_name TEXT NOT NULL,
  team_name TEXT NOT NULL,
  
  -- Team roster (5 players)
  player_1 TEXT NOT NULL,
  player_2 TEXT NOT NULL,
  player_3 TEXT NOT NULL,
  player_4 TEXT NOT NULL,
  player_5 TEXT NOT NULL,
  
  -- Bonus question answers (stored as JSONB for flexibility)
  bonus_answers JSONB NOT NULL DEFAULT '{}',
  
  -- Scoring
  weekly_points INTEGER NOT NULL DEFAULT 0,
  bonus_points INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  current_rank INTEGER,
  
  -- Metadata
  payment_confirmed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weekly_team_scores table for tracking points over time
CREATE TABLE public.weekly_team_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pool_entry_id UUID NOT NULL REFERENCES public.pool_entries(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  survival_points INTEGER NOT NULL DEFAULT 0,
  competition_points INTEGER NOT NULL DEFAULT 0,
  bonus_points_earned INTEGER NOT NULL DEFAULT 0,
  total_week_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(pool_entry_id, week_number)
);

-- Enable RLS on all new tables
ALTER TABLE public.pool_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contestant_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_team_scores ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for pool_settings
CREATE POLICY "Everyone can view pool settings" 
ON public.pool_settings 
FOR SELECT 
USING (true);

-- Create RLS policies for contestant_groups
CREATE POLICY "Everyone can view contestant groups" 
ON public.contestant_groups 
FOR SELECT 
USING (true);

-- Create RLS policies for bonus_questions
CREATE POLICY "Everyone can view active bonus questions" 
ON public.bonus_questions 
FOR SELECT 
USING (is_active = true);

-- Create RLS policies for new pool_entries
CREATE POLICY "Users can view all pool entries" 
ON public.pool_entries 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own pool entry" 
ON public.pool_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pool entry" 
ON public.pool_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for weekly_team_scores
CREATE POLICY "Users can view all weekly scores" 
ON public.weekly_team_scores 
FOR SELECT 
USING (true);

-- Add triggers for updated_at columns
CREATE TRIGGER update_pool_settings_updated_at
BEFORE UPDATE ON public.pool_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bonus_questions_updated_at
BEFORE UPDATE ON public.bonus_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pool_entries_updated_at
BEFORE UPDATE ON public.pool_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default pool settings
INSERT INTO public.pool_settings (
  season_name,
  entry_fee_amount,
  entry_fee_currency,
  payment_method_1,
  payment_details_1,
  payment_method_2,
  payment_details_2
) VALUES (
  'Big Brother 26',
  25.00,
  'CAD',
  'E-transfer',
  'your-email@example.com',
  'Venmo',
  '@your-venmo'
);

-- Insert contestant groups
INSERT INTO public.contestant_groups (group_name, sort_order) VALUES
('Group A', 1),
('Group B', 2),
('Group C', 3),
('Group D', 4),
('Free Pick', 5);

-- Insert bonus questions
INSERT INTO public.bonus_questions (question_text, question_type, sort_order, points_value) VALUES
('Who will be evicted first?', 'player_select', 1, 5),
('Who will be evicted second?', 'player_select', 2, 5),
('Who will be the first HOH?', 'player_select', 3, 5),
('Who will win the season?', 'player_select', 4, 10),
('Who will be runner-up?', 'player_select', 5, 5),
('Who will be AFP (America''s Favorite Player)?', 'player_select', 6, 5),
('What will be the first person evicted''s vote count?', 'number', 7, 5),
('Who will have a showmance? (Select 2)', 'dual_player_select', 8, 5),
('Who will win the most competitions overall?', 'player_select', 9, 5),
('Who will win the most HOH competitions?', 'player_select', 10, 5),
('Who will win the most POV competitions?', 'player_select', 11, 5),
('Will anyone be expelled from the game?', 'yes_no', 12, 5),
('Will there be a double eviction?', 'yes_no', 13, 5),
('Will someone return to the game after being evicted?', 'yes_no', 14, 5);

-- Update existing contestants with group assignments (alphabetical distribution)
UPDATE public.contestants SET 
  group_id = (SELECT id FROM public.contestant_groups WHERE group_name = 'Group A'),
  sort_order = 1
WHERE name IN ('Angela');

UPDATE public.contestants SET 
  group_id = (SELECT id FROM public.contestant_groups WHERE group_name = 'Group B'),
  sort_order = 1
WHERE name IN ('Brooklyn');

UPDATE public.contestants SET 
  group_id = (SELECT id FROM public.contestant_groups WHERE group_name = 'Group C'),
  sort_order = 1
WHERE name IN ('Cam', 'Chelsie');

UPDATE public.contestants SET 
  group_id = (SELECT id FROM public.contestant_groups WHERE group_name = 'Group D'),
  sort_order = 1
WHERE name IN ('Joseph', 'Kimo', 'Lisa');

UPDATE public.contestants SET 
  group_id = (SELECT id FROM public.contestant_groups WHERE group_name = 'Group A'),
  sort_order = 2
WHERE name IN ('Makensy');

UPDATE public.contestants SET 
  group_id = (SELECT id FROM public.contestant_groups WHERE group_name = 'Group B'),
  sort_order = 2
WHERE name IN ('Quinn');

UPDATE public.contestants SET 
  group_id = (SELECT id FROM public.contestant_groups WHERE group_name = 'Group C'),
  sort_order = 2
WHERE name IN ('Rubina');

UPDATE public.contestants SET 
  group_id = (SELECT id FROM public.contestant_groups WHERE group_name = 'Group D'),
  sort_order = 2
WHERE name IN ('T''Kor', 'Tucker');