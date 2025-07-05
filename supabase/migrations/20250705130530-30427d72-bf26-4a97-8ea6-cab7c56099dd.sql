-- CRITICAL FIX: Assign groups to contestants with null group_id
-- This ensures all contestants are properly assigned to groups for the draft form

DO $$
DECLARE
  pool_record RECORD;
  contestant_record RECORD;
  group_records RECORD[];
  group_count INTEGER;
  assignment_index INTEGER := 0;
BEGIN
  -- Process each pool
  FOR pool_record IN SELECT id FROM public.pools LOOP
    RAISE NOTICE '🔧 Processing pool: %', pool_record.id;
    
    -- Get groups for this pool
    SELECT ARRAY(
      SELECT ROW(id, group_name)::RECORD 
      FROM public.contestant_groups 
      WHERE pool_id = pool_record.id 
      ORDER BY sort_order
    ) INTO group_records;
    
    group_count := array_length(group_records, 1);
    
    IF group_count IS NULL OR group_count = 0 THEN
      RAISE NOTICE '⚠️  No groups found for pool %, skipping', pool_record.id;
      CONTINUE;
    END IF;
    
    RAISE NOTICE '📋 Found % groups for pool %', group_count, pool_record.id;
    
    -- Update contestants with null group_id in this pool
    FOR contestant_record IN 
      SELECT id, name FROM public.contestants 
      WHERE pool_id = pool_record.id AND group_id IS NULL
      ORDER BY sort_order, name
    LOOP
      -- Round-robin assignment
      assignment_index := assignment_index % group_count + 1;
      
      UPDATE public.contestants 
      SET group_id = (group_records[assignment_index]).f1::uuid
      WHERE id = contestant_record.id;
      
      RAISE NOTICE '✅ Assigned % to group % (index %)', 
        contestant_record.name, 
        (group_records[assignment_index]).f2, 
        assignment_index;
    END LOOP;
    
    -- Reset for next pool
    assignment_index := 0;
  END LOOP;
  
  RAISE NOTICE '🎯 Completed group assignment for all pools';
END $$;