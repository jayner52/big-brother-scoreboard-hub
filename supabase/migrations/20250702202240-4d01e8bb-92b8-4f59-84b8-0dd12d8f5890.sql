-- Add creature_select to the question_type check constraint
ALTER TABLE bonus_questions 
DROP CONSTRAINT IF EXISTS bonus_questions_question_type_check;

ALTER TABLE bonus_questions 
ADD CONSTRAINT bonus_questions_question_type_check 
CHECK (question_type IN ('player_select', 'dual_player_select', 'yes_no', 'number', 'text', 'creature_select'));

-- Update OTEV question to use creature_select question type
UPDATE bonus_questions 
SET question_type = 'creature_select'
WHERE question_text = 'What kind of creature will OTEV be?';