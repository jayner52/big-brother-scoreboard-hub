-- Add database indexes to optimize team consistency queries

-- Index for filtering out deleted teams (most important for performance)
CREATE INDEX IF NOT EXISTS idx_pool_entries_deleted_at_pool_id 
ON pool_entries (pool_id, deleted_at) 
WHERE deleted_at IS NULL;

-- Composite index for leaderboard queries with deleted filter
CREATE INDEX IF NOT EXISTS idx_pool_entries_leaderboard_optimized 
ON pool_entries (pool_id, deleted_at, total_points DESC, weekly_points DESC, bonus_points DESC, created_at ASC)
WHERE deleted_at IS NULL;

-- Index for user team queries with deleted filter
CREATE INDEX IF NOT EXISTS idx_pool_entries_user_teams 
ON pool_entries (pool_id, user_id, deleted_at) 
WHERE deleted_at IS NULL;

-- Ensure RLS policies use the most efficient query plans
ANALYZE pool_entries;