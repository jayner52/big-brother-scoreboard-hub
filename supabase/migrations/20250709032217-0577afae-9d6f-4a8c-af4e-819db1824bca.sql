-- Clear Season 26 contestants from current pool to force Season 27 re-seeding
-- This will trigger the get-pool-contestants function to re-seed with Season 27 global defaults

DELETE FROM contestants 
WHERE pool_id = '1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9' 
AND season_number = 26;