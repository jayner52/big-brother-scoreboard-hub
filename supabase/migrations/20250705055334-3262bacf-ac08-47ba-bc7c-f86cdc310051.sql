-- Phase 2A: Critical Data Seeding Functions
-- Create function to seed default bonus questions for a new pool
CREATE OR REPLACE FUNCTION seed_pool_bonus_questions(target_pool_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Copy all existing bonus questions (with pool_id = null) to the new pool
  INSERT INTO public.bonus_questions (
    pool_id,
    question_text,
    question_type,
    sort_order,
    points_value,
    is_active
  )
  SELECT 
    target_pool_id,
    question_text,
    question_type,
    sort_order,
    points_value,
    is_active
  FROM public.bonus_questions 
  WHERE pool_id IS NULL
  AND is_active = true;
END;
$$;

-- Create function to seed default contestant groups for a new pool
CREATE OR REPLACE FUNCTION seed_pool_contestant_groups(target_pool_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Copy all existing contestant groups (with pool_id = null) to the new pool
  INSERT INTO public.contestant_groups (
    pool_id,
    group_name,
    sort_order
  )
  SELECT 
    target_pool_id,
    group_name,
    sort_order
  FROM public.contestant_groups 
  WHERE pool_id IS NULL;
END;
$$;

-- Create function to seed default contestants for a new pool
CREATE OR REPLACE FUNCTION seed_pool_contestants(target_pool_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  group_mapping RECORD;
BEGIN
  -- First, create a temporary mapping between old and new group IDs
  FOR group_mapping IN
    SELECT 
      old_g.id as old_group_id,
      new_g.id as new_group_id
    FROM public.contestant_groups old_g
    JOIN public.contestant_groups new_g ON old_g.group_name = new_g.group_name
    WHERE old_g.pool_id IS NULL 
    AND new_g.pool_id = target_pool_id
  LOOP
    -- Copy contestants from the old group to the new group
    INSERT INTO public.contestants (
      pool_id,
      group_id,
      name,
      age,
      hometown,
      occupation,
      bio,
      photo_url,
      sort_order,
      is_active,
      season_number
    )
    SELECT 
      target_pool_id,
      group_mapping.new_group_id,
      name,
      age,
      hometown,
      occupation,
      bio,
      photo_url,
      sort_order,
      is_active,
      season_number
    FROM public.contestants 
    WHERE group_id = group_mapping.old_group_id
    AND pool_id IS NULL
    AND is_active = true;
  END LOOP;
END;
$$;

-- Create comprehensive function to seed all pool defaults
CREATE OR REPLACE FUNCTION seed_new_pool_defaults(target_pool_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Seed contestant groups first
  PERFORM seed_pool_contestant_groups(target_pool_id);
  
  -- Then seed contestants (depends on groups)
  PERFORM seed_pool_contestants(target_pool_id);
  
  -- Finally seed bonus questions
  PERFORM seed_pool_bonus_questions(target_pool_id);
END;
$$;