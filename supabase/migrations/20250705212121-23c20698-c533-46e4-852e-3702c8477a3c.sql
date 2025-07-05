-- Add missing database constraints and columns
ALTER TABLE pools ADD COLUMN IF NOT EXISTS allow_duplicate_picks boolean DEFAULT true;

-- Remove duplicate bonus questions using a different approach
DELETE FROM bonus_questions 
WHERE id NOT IN (
  SELECT DISTINCT ON (pool_id, question_text, sort_order) id
  FROM bonus_questions 
  ORDER BY pool_id, question_text, sort_order, created_at DESC
);