-- Clean up all scoring rules and fix point values
DELETE FROM public.detailed_scoring_rules;

-- Insert clean scoring rules with correct points
INSERT INTO public.detailed_scoring_rules (category, subcategory, points, description, is_active) VALUES
-- Competition scoring
('competition', 'hoh_winner', 3, 'Head of Household winner', true),
('competition', 'pov_winner', 3, 'Power of Veto winner', true),
('weekly', 'survival', 1, 'Survived the week', true),
-- Special events (non-pink from chart)
('special_events', 'win_prize', 2, 'Won a prize/reward', true),
('special_events', 'punishment', -1, 'Received punishment', true),
('special_events', 'backdoor', 1, 'Backdoored someone', true),
('special_events', 'alliance_betrayal', 1, 'Betrayed alliance member', true),
('special_events', 'showmance', 1, 'In a showmance', true),
-- Final game outcomes (auto-calculated, not for special events dropdown)
('jury', 'jury_member', 2, 'Made it to jury', true),
('final_placement', 'winner', 10, 'Won the game', true),
('final_placement', 'runner_up', 5, 'Runner-up', true),
('final_placement', 'americas_favorite', 3, 'Americas Favorite Player', true);

-- Replace all bonus questions with the exact 14 specified
DELETE FROM public.bonus_questions;

INSERT INTO public.bonus_questions (question_text, question_type, sort_order, points_value, is_active) VALUES
('Who will be the second HoH?', 'player_select', 1, 4, true),
('Who will be the first boot?', 'player_select', 2, 4, true),
('Who will be the first juror?', 'player_select', 3, 4, true),
('Who is your winner pick?', 'player_select', 4, 6, true),
('How many times will the veto be used?', 'number', 5, 2, true),
('How many votes will the winner receive? (Jury will likely be 7 or 9 people)', 'number', 6, 2, true),
('Will there be a triple eviction?', 'yes_no', 7, 1, true),
('Will anyone quit this season?', 'yes_no', 8, 2, true),
('Choose two people who will get in a showmance with each other. (must have both correct)', 'dual_player_select', 9, 5, true),
('What kind of creature will OTEV be?', 'player_select', 10, 3, true),
('Who will be the first person to win something from America''s vote?', 'player_select', 11, 3, true),
('Who will be the first person to win HoH twice?', 'player_select', 12, 3, true),
('Who will go out second (or third) in a double/triple eviction?', 'player_select', 13, 3, true),
('Who will be America''s Favorite Player?', 'player_select', 14, 3, true);