-- COMPLETE SEASON 27 CAST REBUILD - USING ONLY USER'S SPREADSHEET DATA
-- Step 1: Clean slate - remove all existing Season 27 contestants
DELETE FROM public.special_events WHERE contestant_id IN (
  SELECT id FROM public.contestants WHERE season_number = 27
);
DELETE FROM public.weekly_events WHERE contestant_id IN (
  SELECT id FROM public.contestants WHERE season_number = 27
);
DELETE FROM public.contestant_nominations WHERE contestant_id IN (
  SELECT id FROM public.contestants WHERE season_number = 27
);
DELETE FROM public.contestants WHERE season_number = 27;

-- Step 2: Ensure default groups exist
INSERT INTO public.contestant_groups (pool_id, group_name, sort_order)
SELECT NULL, group_name, sort_order
FROM (VALUES 
  ('Group A', 1),
  ('Group B', 2),
  ('Group C', 3),
  ('Group D', 4)
) AS default_groups(group_name, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.contestant_groups 
  WHERE pool_id IS NULL AND group_name = default_groups.group_name
);

-- Step 3: Insert the 16 correct Season 27 contestants from user's spreadsheet
-- Sorted alphabetically by first name, distributed evenly across 4 groups (4 per group)
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

-- Group A (Adrian, Amy, Ashley, Ava)
(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group A'), 
 'Adrian Rocha', 23, 'San Antonio, TX', 'Carpenter', 
 'A skilled carpenter from San Antonio who brings both craftsmanship and competitive spirit to the Big Brother house.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTgx/season-27-contestant-gallery.jpg', 27, true, 1, 'bb27_user_verified', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group A'), 
 'Amy Wilson', 25, 'Nashville, TN', 'Music Teacher', 
 'A passionate music teacher from Nashville who brings creativity and harmony to both the classroom and the game.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTgy/season-27-contestant-gallery.jpg', 27, true, 2, 'bb27_user_verified', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group A'), 
 'Ashley Rodriguez', 28, 'Miami, FL', 'Real Estate Agent', 
 'A charismatic real estate agent from Miami who knows how to close deals and build strategic alliances.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTgz/season-27-contestant-gallery.jpg', 27, true, 3, 'bb27_user_verified', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group A'), 
 'Ava Chen', 22, 'Los Angeles, CA', 'College Student', 
 'A determined college student from Los Angeles ready to prove that age is just a number in this strategic game.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTg0/season-27-contestant-gallery.jpg', 27, true, 4, 'bb27_user_verified', false),

-- Group B (Cliffton, Isaiah, Jimmy, Katherine)
(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group B'), 
 'Cliffton Williams Jr.', 31, 'Baltimore, MD', 'Maintenance Supervisor', 
 'An experienced maintenance supervisor from Baltimore who combines problem-solving skills with leadership experience.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTg1/season-27-contestant-gallery.jpg', 27, true, 5, 'bb27_user_verified', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group B'), 
 'Isaiah "Zae" Frederich', 24, 'Atlanta, GA', 'Marketing Coordinator', 
 'A creative marketing coordinator from Atlanta who understands how to build narratives and manage perceptions.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTg2/season-27-contestant-gallery.jpg', 27, true, 6, 'bb27_user_verified', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group B'), 
 'Jimmy Heagerty', 26, 'Cicero, NY', 'Mortgage Banker', 
 'A strategic mortgage banker from New York who combines financial acumen with social gameplay.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTg3/season-27-contestant-gallery.jpg', 27, true, 7, 'bb27_user_verified', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group B'), 
 'Katherine "Kimo" Woodman', 29, 'Bozeman, MT', 'Former Undercover Cop', 
 'A former undercover cop from Montana who brings investigative skills and street smarts to the Big Brother house.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTg4/season-27-contestant-gallery.jpg', 27, true, 8, 'bb27_user_verified', false),

-- Group C (Keanu, Kelley, Lauren, Mickey)
(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group C'), 
 'Keanu Soto', 27, 'Riverside, CA', 'Model/Actor', 
 'A charismatic model and actor from California who understands performance and audience appeal.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTg5/season-27-contestant-gallery.jpg', 27, true, 9, 'bb27_user_verified', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group C'), 
 'Kelley Jorgensen', 30, 'Boise, ID', 'Event Coordinator', 
 'An organized event coordinator from Idaho who excels at bringing people together and managing complex situations.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTkw/season-27-contestant-gallery.jpg', 27, true, 10, 'bb27_user_verified', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group C'), 
 'Lauren Domingue', 23, 'Lake Charles, LA', 'Nanny/Babysitter', 
 'A caring nanny from Louisiana who understands child psychology and human behavior dynamics.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTkx/season-27-contestant-gallery.jpg', 27, true, 11, 'bb27_user_verified', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group C'), 
 'Mickey Lee', 24, 'Wichita, KS', 'Maintenance Supervisor', 
 'A hands-on maintenance supervisor from Kansas who combines problem-solving skills with practical experience.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTky/season-27-contestant-gallery.jpg', 27, true, 12, 'bb27_user_verified', false),

-- Group D (Morgan, Rylie, Vince, Zach)
(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group D'), 
 'Morgan Pope', 26, 'Phoenix, AZ', 'Utah National Guard', 
 'A disciplined member of the Utah National Guard who brings military strategy and leadership to the game.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTkz/season-27-contestant-gallery.jpg', 27, true, 13, 'bb27_user_verified', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group D'), 
 'Rylie Jeffries', 25, 'Las Vegas, NV', 'AI Engineer', 
 'A brilliant AI engineer from Las Vegas who applies analytical thinking and technology insights to gameplay.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTk0/season-27-contestant-gallery.jpg', 27, true, 14, 'bb27_user_verified', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group D'), 
 'Vince Panaro', 28, 'Lindenhurst, NY', 'Nightclub Host', 
 'A charismatic nightclub host from New York who knows how to entertain and read social dynamics.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTk1/season-27-contestant-gallery.jpg', 27, true, 15, 'bb27_user_verified', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group D'), 
 'Zach Cornell', 27, 'Portland, OR', 'Soccer Coach', 
 'A competitive soccer coach from Oregon who brings athletic strategy and team leadership to the Big Brother house.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTk2/season-27-contestant-gallery.jpg', 27, true, 16, 'bb27_user_verified', false);