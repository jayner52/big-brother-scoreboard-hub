-- Fix Week 1 eviction status - Adrian Rocha and Ashley Hollis should be active
-- Only Jimmy Heagerty should be evicted in Week 1 according to weekly_results

UPDATE public.contestants 
SET is_active = true
WHERE pool_id = '1164288f-70b3-43c5-b19d-b57e115b8710'
AND name IN ('Adrian Rocha', 'Ashley Hollis');