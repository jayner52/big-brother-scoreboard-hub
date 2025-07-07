-- Add floater achievement tracking columns to contestants table
ALTER TABLE public.contestants 
ADD COLUMN consecutive_weeks_no_wins integer DEFAULT 0,
ADD COLUMN floater_achievement_earned boolean DEFAULT false,
ADD COLUMN last_competition_win_week integer DEFAULT 0;