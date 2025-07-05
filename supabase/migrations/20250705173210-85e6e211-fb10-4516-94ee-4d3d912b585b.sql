-- Add missing foreign key constraints for proper pool isolation
ALTER TABLE contestants 
DROP CONSTRAINT IF EXISTS fk_contestants_pool;

ALTER TABLE contestants 
ADD CONSTRAINT fk_contestants_pool 
FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE;

ALTER TABLE pool_entries 
DROP CONSTRAINT IF EXISTS fk_entries_pool;

ALTER TABLE pool_entries 
ADD CONSTRAINT fk_entries_pool 
FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE;

ALTER TABLE weekly_results 
DROP CONSTRAINT IF EXISTS fk_weekly_results_pool;

ALTER TABLE weekly_results 
ADD CONSTRAINT fk_weekly_results_pool 
FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE;

ALTER TABLE bonus_questions 
DROP CONSTRAINT IF EXISTS fk_bonus_questions_pool;

ALTER TABLE bonus_questions 
ADD CONSTRAINT fk_bonus_questions_pool 
FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE;

ALTER TABLE contestant_groups 
DROP CONSTRAINT IF EXISTS fk_contestant_groups_pool;

ALTER TABLE contestant_groups 
ADD CONSTRAINT fk_contestant_groups_pool 
FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE;

ALTER TABLE weekly_events 
DROP CONSTRAINT IF EXISTS fk_weekly_events_pool;

ALTER TABLE weekly_events 
ADD CONSTRAINT fk_weekly_events_pool 
FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE;

ALTER TABLE special_events 
DROP CONSTRAINT IF EXISTS fk_special_events_pool;

ALTER TABLE special_events 
ADD CONSTRAINT fk_special_events_pool 
FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE;