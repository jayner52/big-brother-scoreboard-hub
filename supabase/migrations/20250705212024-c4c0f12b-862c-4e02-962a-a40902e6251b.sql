-- Add missing database constraints and columns
ALTER TABLE pools ADD COLUMN IF NOT EXISTS allow_duplicate_picks boolean DEFAULT true;

-- Remove duplicate bonus questions
DELETE FROM bonus_questions 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM bonus_questions 
  GROUP BY pool_id, question_text, sort_order
);