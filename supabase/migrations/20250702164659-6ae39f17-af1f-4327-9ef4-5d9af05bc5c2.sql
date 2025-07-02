-- Fix RLS policies to allow admin operations
-- Create admin policies for weekly_results
CREATE POLICY "Admins can insert weekly results" 
ON public.weekly_results 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update weekly results" 
ON public.weekly_results 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can delete weekly results" 
ON public.weekly_results 
FOR DELETE 
USING (true);

-- Create admin policies for bonus_questions
CREATE POLICY "Admins can insert bonus questions" 
ON public.bonus_questions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update bonus questions" 
ON public.bonus_questions 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can delete bonus questions" 
ON public.bonus_questions 
FOR DELETE 
USING (true);

-- Create admin policies for contestants
CREATE POLICY "Admins can insert contestants" 
ON public.contestants 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update contestants" 
ON public.contestants 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can delete contestants" 
ON public.contestants 
FOR DELETE 
USING (true);

-- Rebalance contestant groups to 4 groups of 3
-- First, let's update the existing contestants to have better group distribution
UPDATE public.contestants SET group_id = (
  SELECT id FROM public.contestant_groups WHERE group_name = 'Group 1'
), sort_order = 1 WHERE name = 'Angela';

UPDATE public.contestants SET group_id = (
  SELECT id FROM public.contestant_groups WHERE group_name = 'Group 1'
), sort_order = 2 WHERE name = 'Brooklyn';

UPDATE public.contestants SET group_id = (
  SELECT id FROM public.contestant_groups WHERE group_name = 'Group 1'
), sort_order = 3 WHERE name = 'Cam';

UPDATE public.contestants SET group_id = (
  SELECT id FROM public.contestant_groups WHERE group_name = 'Group 2'
), sort_order = 1 WHERE name = 'Chelsie';

UPDATE public.contestants SET group_id = (
  SELECT id FROM public.contestant_groups WHERE group_name = 'Group 2'
), sort_order = 2 WHERE name = 'Joseph';

UPDATE public.contestants SET group_id = (
  SELECT id FROM public.contestant_groups WHERE group_name = 'Group 2'
), sort_order = 3 WHERE name = 'Kimo';

UPDATE public.contestants SET group_id = (
  SELECT id FROM public.contestant_groups WHERE group_name = 'Group 3'
), sort_order = 1 WHERE name = 'Leah';

UPDATE public.contestants SET group_id = (
  SELECT id FROM public.contestant_groups WHERE group_name = 'Group 3'
), sort_order = 2 WHERE name = 'Makensy';

UPDATE public.contestants SET group_id = (
  SELECT id FROM public.contestant_groups WHERE group_name = 'Group 3'
), sort_order = 3 WHERE name = 'Quinn';

UPDATE public.contestants SET group_id = (
  SELECT id FROM public.contestant_groups WHERE group_name = 'Group 4'
), sort_order = 1 WHERE name = 'Rubina';

UPDATE public.contestants SET group_id = (
  SELECT id FROM public.contestant_groups WHERE group_name = 'Group 4'
), sort_order = 2 WHERE name = 'T\'Kor';

UPDATE public.contestants SET group_id = (
  SELECT id FROM public.contestant_groups WHERE group_name = 'Group 4'
), sort_order = 3 WHERE name = 'Tucker';