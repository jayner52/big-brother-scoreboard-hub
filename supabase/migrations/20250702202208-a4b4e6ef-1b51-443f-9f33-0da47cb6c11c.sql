-- Update OTEV question to use creature_select question type
UPDATE bonus_questions 
SET question_type = 'creature_select'
WHERE question_text = 'What kind of creature will OTEV be?';