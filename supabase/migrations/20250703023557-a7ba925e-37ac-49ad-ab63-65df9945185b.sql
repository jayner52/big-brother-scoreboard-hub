-- Add BB Arena scoring rule to detailed_scoring_rules
INSERT INTO public.detailed_scoring_rules (category, subcategory, points, description, is_active)
VALUES ('weekly', 'bb_arena_winner', 2, 'Won the BB Arena competition (removed from the block)', true);

-- Add a new table to track the actual current week for the game
CREATE TABLE IF NOT EXISTS public.current_game_week (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_number INTEGER NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.current_game_week ENABLE ROW LEVEL SECURITY;

-- Create policies for current_game_week
CREATE POLICY "Everyone can view current game week" 
ON public.current_game_week 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can update current game week" 
ON public.current_game_week 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Insert initial current week (week 1)
INSERT INTO public.current_game_week (week_number) VALUES (1)
ON CONFLICT DO NOTHING;

-- Create function to update current game week
CREATE OR REPLACE FUNCTION public.update_current_game_week(new_week_number INTEGER)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.current_game_week 
  SET week_number = new_week_number, updated_at = now();
  
  IF NOT FOUND THEN
    INSERT INTO public.current_game_week (week_number) VALUES (new_week_number);
  END IF;
END;
$$;