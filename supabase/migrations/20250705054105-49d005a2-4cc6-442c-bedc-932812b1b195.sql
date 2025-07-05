-- CRITICAL: Add pool_id columns to make data pool-specific instead of global
-- This fixes the major issue where all pools share the same data

-- Add pool_id to contestants table
ALTER TABLE public.contestants 
ADD COLUMN pool_id UUID REFERENCES public.pools(id) ON DELETE CASCADE;

-- Add pool_id to bonus_questions table  
ALTER TABLE public.bonus_questions
ADD COLUMN pool_id UUID REFERENCES public.pools(id) ON DELETE CASCADE;

-- Add pool_id to weekly_events table
ALTER TABLE public.weekly_events
ADD COLUMN pool_id UUID REFERENCES public.pools(id) ON DELETE CASCADE;

-- Add pool_id to weekly_results table
ALTER TABLE public.weekly_results  
ADD COLUMN pool_id UUID REFERENCES public.pools(id) ON DELETE CASCADE;

-- Add pool_id to contestant_groups table
ALTER TABLE public.contestant_groups
ADD COLUMN pool_id UUID REFERENCES public.pools(id) ON DELETE CASCADE;

-- Add pool_id to special_events table for completeness
ALTER TABLE public.special_events
ADD COLUMN pool_id UUID REFERENCES public.pools(id) ON DELETE CASCADE;

-- Update RLS policies to be pool-specific instead of global

-- Drop existing global policies for contestants
DROP POLICY IF EXISTS "Everyone can view contestants" ON public.contestants;
DROP POLICY IF EXISTS "Admins can insert contestants" ON public.contestants; 
DROP POLICY IF EXISTS "Admins can update contestants" ON public.contestants;
DROP POLICY IF EXISTS "Admins can delete contestants" ON public.contestants;

-- Create pool-specific policies for contestants
CREATE POLICY "Users can view contestants in their pools" ON public.contestants
  FOR SELECT 
  USING (
    pool_id IN (
      SELECT pool_id FROM pool_memberships 
      WHERE user_id = auth.uid() AND active = true
    )
  );

CREATE POLICY "Pool admins can manage contestants" ON public.contestants
  FOR ALL
  USING (get_user_pool_admin_status(pool_id))
  WITH CHECK (get_user_pool_admin_status(pool_id));

-- Drop existing global policies for bonus_questions
DROP POLICY IF EXISTS "Everyone can view active bonus questions" ON public.bonus_questions;
DROP POLICY IF EXISTS "Enable full access for bonus questions management" ON public.bonus_questions;

-- Create pool-specific policies for bonus_questions  
CREATE POLICY "Users can view bonus questions in their pools" ON public.bonus_questions
  FOR SELECT
  USING (
    is_active = true AND
    pool_id IN (
      SELECT pool_id FROM pool_memberships 
      WHERE user_id = auth.uid() AND active = true
    )
  );

CREATE POLICY "Pool admins can manage bonus questions" ON public.bonus_questions
  FOR ALL
  USING (get_user_pool_admin_status(pool_id))
  WITH CHECK (get_user_pool_admin_status(pool_id));

-- Drop existing global policies for weekly_events
DROP POLICY IF EXISTS "Everyone can view weekly events" ON public.weekly_events;
DROP POLICY IF EXISTS "Admins can insert weekly events" ON public.weekly_events;
DROP POLICY IF EXISTS "Admins can update weekly events" ON public.weekly_events;
DROP POLICY IF EXISTS "Admins can delete weekly events" ON public.weekly_events;

-- Create pool-specific policies for weekly_events
CREATE POLICY "Users can view weekly events in their pools" ON public.weekly_events
  FOR SELECT
  USING (
    pool_id IN (
      SELECT pool_id FROM pool_memberships 
      WHERE user_id = auth.uid() AND active = true
    )
  );

CREATE POLICY "Pool admins can manage weekly events" ON public.weekly_events
  FOR ALL
  USING (get_user_pool_admin_status(pool_id))
  WITH CHECK (get_user_pool_admin_status(pool_id));

-- Drop existing global policies for weekly_results
DROP POLICY IF EXISTS "Everyone can view weekly results" ON public.weekly_results;
DROP POLICY IF EXISTS "Admins can insert weekly results" ON public.weekly_results;
DROP POLICY IF EXISTS "Admins can update weekly results" ON public.weekly_results;
DROP POLICY IF EXISTS "Admins can delete weekly results" ON public.weekly_results;

-- Create pool-specific policies for weekly_results
CREATE POLICY "Users can view weekly results in their pools" ON public.weekly_results
  FOR SELECT
  USING (
    pool_id IN (
      SELECT pool_id FROM pool_memberships 
      WHERE user_id = auth.uid() AND active = true
    )
  );

CREATE POLICY "Pool admins can manage weekly results" ON public.weekly_results
  FOR ALL
  USING (get_user_pool_admin_status(pool_id))
  WITH CHECK (get_user_pool_admin_status(pool_id));

-- Drop existing global policies for contestant_groups
DROP POLICY IF EXISTS "Everyone can view contestant groups" ON public.contestant_groups;

-- Create pool-specific policies for contestant_groups
CREATE POLICY "Users can view contestant groups in their pools" ON public.contestant_groups
  FOR SELECT
  USING (
    pool_id IN (
      SELECT pool_id FROM pool_memberships 
      WHERE user_id = auth.uid() AND active = true
    )
  );

CREATE POLICY "Pool admins can manage contestant groups" ON public.contestant_groups
  FOR ALL
  USING (get_user_pool_admin_status(pool_id))
  WITH CHECK (get_user_pool_admin_status(pool_id));

-- Update special_events policies to be pool-specific
DROP POLICY IF EXISTS "Everyone can view special events" ON public.special_events;
DROP POLICY IF EXISTS "Admins can insert special events" ON public.special_events;
DROP POLICY IF EXISTS "Admins can update special events" ON public.special_events;
DROP POLICY IF EXISTS "Admins can delete special events" ON public.special_events;

CREATE POLICY "Users can view special events in their pools" ON public.special_events
  FOR SELECT
  USING (
    pool_id IN (
      SELECT pool_id FROM pool_memberships 
      WHERE user_id = auth.uid() AND active = true
    )
  );

CREATE POLICY "Pool admins can manage special events" ON public.special_events
  FOR ALL
  USING (get_user_pool_admin_status(pool_id))
  WITH CHECK (get_user_pool_admin_status(pool_id));

-- Add new fields to pools table for additional features
ALTER TABLE public.pools 
ADD COLUMN finale_week_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN hide_picks_until_draft_closed BOOLEAN DEFAULT FALSE,
ADD COLUMN season_locked BOOLEAN DEFAULT FALSE;