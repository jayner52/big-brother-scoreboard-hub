-- Add fields to track POV usage, nominees, and draft state in weekly_results
ALTER TABLE public.weekly_results 
ADD COLUMN nominees TEXT[],
ADD COLUMN pov_used BOOLEAN DEFAULT false,
ADD COLUMN pov_used_on TEXT,
ADD COLUMN replacement_nominee TEXT,
ADD COLUMN is_draft BOOLEAN DEFAULT false,
ADD COLUMN is_triple_eviction BOOLEAN DEFAULT false,
ADD COLUMN third_hoh_winner TEXT,
ADD COLUMN third_pov_winner TEXT,
ADD COLUMN third_evicted_contestant TEXT,
ADD COLUMN jury_phase_started BOOLEAN DEFAULT false;

-- Add second nominees for double eviction
ALTER TABLE public.weekly_results 
ADD COLUMN second_nominees TEXT[],
ADD COLUMN second_pov_used BOOLEAN DEFAULT false,
ADD COLUMN second_pov_used_on TEXT,
ADD COLUMN second_replacement_nominee TEXT;

-- Create survival tracking table for block survival points
CREATE TABLE public.contestant_nominations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contestant_id UUID NOT NULL REFERENCES public.contestants(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  nomination_type TEXT NOT NULL, -- 'initial', 'replacement'
  survived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on contestant_nominations
ALTER TABLE public.contestant_nominations ENABLE ROW LEVEL SECURITY;

-- Create policies for contestant_nominations
CREATE POLICY "Everyone can view contestant nominations" 
ON public.contestant_nominations 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage contestant nominations" 
ON public.contestant_nominations 
FOR ALL 
USING (true);

-- Create function to update weekly_results with current week status
CREATE OR REPLACE FUNCTION public.update_current_week_status()
RETURNS TRIGGER AS $$
BEGIN
  -- This will be used for real-time updates of current week status
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;