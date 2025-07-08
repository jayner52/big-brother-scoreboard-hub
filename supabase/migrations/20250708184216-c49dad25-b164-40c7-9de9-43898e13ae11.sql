-- Add emoji column to detailed_scoring_rules table to store custom event emojis
ALTER TABLE public.detailed_scoring_rules 
ADD COLUMN emoji text;