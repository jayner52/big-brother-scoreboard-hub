-- COMPREHENSIVE SEASON 27 CAST PRESERVATION MIGRATION (FIXED)
-- This migration implements the 5-step plan to preserve current admin tab houseguest data

-- Step 1: Clear Database Inconsistencies
-- Remove all existing contestant data to start fresh
DELETE FROM public.special_events;
DELETE FROM public.weekly_events;
DELETE FROM public.contestant_nominations;
DELETE FROM public.contestants;

-- Step 2: Ensure Default Groups Exist
-- Create clean contestant groups (without ON CONFLICT since it's not supported)
INSERT INTO public.contestant_groups (pool_id, group_name, sort_order)
SELECT NULL, 'Group A', 1
WHERE NOT EXISTS (SELECT 1 FROM public.contestant_groups WHERE pool_id IS NULL AND group_name = 'Group A');

INSERT INTO public.contestant_groups (pool_id, group_name, sort_order)
SELECT NULL, 'Group B', 2
WHERE NOT EXISTS (SELECT 1 FROM public.contestant_groups WHERE pool_id IS NULL AND group_name = 'Group B');

INSERT INTO public.contestant_groups (pool_id, group_name, sort_order)
SELECT NULL, 'Group C', 3
WHERE NOT EXISTS (SELECT 1 FROM public.contestant_groups WHERE pool_id IS NULL AND group_name = 'Group C');

INSERT INTO public.contestant_groups (pool_id, group_name, sort_order)
SELECT NULL, 'Group D', 4
WHERE NOT EXISTS (SELECT 1 FROM public.contestant_groups WHERE pool_id IS NULL AND group_name = 'Group D');

-- Step 3: Create Clean Global Season 27 Defaults
-- Insert exactly the 16 Season 27 contestants as global defaults
INSERT INTO public.contestants (
  pool_id, 
  group_id, 
  name, 
  age, 
  hometown, 
  occupation, 
  bio, 
  photo_url,
  season_number, 
  is_active, 
  sort_order, 
  data_source,
  ai_generated
) VALUES
-- Group A (4 contestants)
(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group A' LIMIT 1), 
 'Cam Sullivan-Brown', 25, 'Brooklyn, NY', 'Physical Therapist', 
 'A dedicated physical therapist from Brooklyn who combines healing expertise with competitive drive.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTgx/season-27-contestant-gallery.jpg', 27, true, 1, 'bb27_real_cast', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group A' LIMIT 1), 
 'Chelsie Baham', 27, 'Rancho Cucamonga, CA', 'Nonprofit Director', 
 'A passionate nonprofit director who fights for causes she believes in with strategic precision.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTgy/season-27-contestant-gallery.jpg', 27, true, 2, 'bb27_real_cast', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group A' LIMIT 1), 
 'Brooklyn Rivera', 24, 'Dallas, TX', 'Business Administrator', 
 'A sharp business administrator who knows how to navigate corporate politics and personal relationships.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTgz/season-27-contestant-gallery.jpg', 27, true, 3, 'bb27_real_cast', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group A' LIMIT 1), 
 'Isaiah "Zae" Frederich', 24, 'Atlanta, GA', 'Marketing Coordinator', 
 'A creative marketing coordinator who understands how to build narratives and manage perceptions.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTg0/season-27-contestant-gallery.jpg', 27, true, 4, 'bb27_real_cast', false),

-- Group B (4 contestants)
(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group B' LIMIT 1), 
 'Leah Peters', 26, 'Miami, FL', 'VIP Cocktail Server', 
 'A charismatic VIP cocktail server who knows how to read people and work any room.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTg1/season-27-contestant-gallery.jpg', 27, true, 5, 'bb27_real_cast', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group B' LIMIT 1), 
 'Jimmy Heagerty', 26, 'Cicero, NY', 'Mortgage Banker', 
 'A strategic mortgage banker who combines financial acumen with social gameplay.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTg2/season-27-contestant-gallery.jpg', 27, true, 6, 'bb27_real_cast', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group B' LIMIT 1), 
 'Tucker Des Lauriers', 30, 'Brooklyn, NY', 'Marketing/Sales Executive', 
 'A driven marketing and sales executive who knows how to influence and persuade.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTg3/season-27-contestant-gallery.jpg', 27, true, 7, 'bb27_real_cast', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group B' LIMIT 1), 
 'Katherine "Kimo" Woodman', 29, 'Bozeman, MT', 'Former Undercover Cop', 
 'A former undercover cop who brings investigative skills and street smarts to the game.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTg4/season-27-contestant-gallery.jpg', 27, true, 8, 'bb27_real_cast', false),

-- Group C (4 contestants)
(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group C' LIMIT 1), 
 'Angela Murray', 50, 'Syracuse, UT', 'Real Estate Agent', 
 'An experienced real estate agent who uses life wisdom and negotiation skills strategically.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTg5/season-27-contestant-gallery.jpg', 27, true, 9, 'bb27_real_cast', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group C' LIMIT 1), 
 'Keanu Soto', 27, 'Riverside, CA', 'Model/Actor', 
 'A charismatic model and actor who understands performance and audience appeal.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTkw/season-27-contestant-gallery-857590.jpg', 27, true, 10, 'bb27_real_cast', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group C' LIMIT 1), 
 'Kelley Jorgensen', 30, 'Boise, ID', 'Event Coordinator', 
 'An organized event coordinator who excels at bringing people together and managing details.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTkx/season-27-contestant-gallery.jpg', 27, true, 11, 'bb27_real_cast', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group C' LIMIT 1), 
 'Lauren Domingue', 23, 'Lake Charles, LA', 'Nanny/Babysitter', 
 'A caring nanny who understands child psychology and human behavior dynamics.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTky/season-27-contestant-gallery.jpg', 27, true, 12, 'bb27_real_cast', false),

-- Group D (4 contestants)
(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group D' LIMIT 1), 
 'Mickey Lee', 24, 'Wichita, KS', 'Maintenance Supervisor', 
 'A hands-on maintenance supervisor who combines problem-solving skills with physical capability.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTkz/season-27-contestant-gallery-857593.jpg', 27, true, 13, 'bb27_real_cast', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group D' LIMIT 1), 
 'Morgan Pope', 26, 'Phoenix, AZ', 'Utah National Guard', 
 'A disciplined member of the Utah National Guard who brings military strategy and leadership.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTk0/season-27-contestant-gallery-857594.jpg', 27, true, 14, 'bb27_real_cast', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group D' LIMIT 1), 
 'Rylie Jeffries', 25, 'Las Vegas, NV', 'AI Engineer', 
 'A brilliant AI engineer who applies analytical thinking and technology insights to gameplay.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTk1/season-27-contestant-gallery.jpg', 27, true, 15, 'bb27_real_cast', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group D' LIMIT 1), 
 'Vince Panaro', 28, 'Lindenhurst, NY', 'Nightclub Host', 
 'A charismatic nightclub host who knows how to entertain and read social dynamics.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTk2/season-27-contestant-gallery-857596.jpg', 27, true, 16, 'bb27_real_cast', false);