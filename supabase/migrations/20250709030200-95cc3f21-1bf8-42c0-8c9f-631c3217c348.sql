-- DELETE ALL EXISTING JUNK
DELETE FROM contestants WHERE season_number = 27;
DELETE FROM contestants WHERE season_number = 26 AND pool_id = '1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9';

-- CREATE GROUPS IF THEY DON'T EXIST
INSERT INTO contestant_groups (pool_id, group_name, sort_order) VALUES
('1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9', 'Group A', 1),
('1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9', 'Group B', 2),
('1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9', 'Group C', 3),
('1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9', 'Group D', 4)
ON CONFLICT (pool_id, group_name) DO NOTHING;

-- INSERT THE REAL BIG BROTHER 27 CAST
INSERT INTO contestants (pool_id, group_id, name, age, hometown, occupation, bio, photo_url, season_number, is_active) VALUES
-- GROUP A
('1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9', (SELECT id FROM contestant_groups WHERE pool_id = '1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9' AND group_name = 'Group A'), 'Angela Murray', 50, 'Syracuse, Utah', 'Real Estate Agent', 'Former BB26 contestant returning as the mystery houseguest', 'https://parade.com/.image/c_limit%2Ccs_srgb%2Cq_auto:good%2Cw_700/MTk3NzM4NzE4MzE3MzU0MzAw/angela-bb26.webp', 27, true),
('1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9', (SELECT id FROM contestant_groups WHERE pool_id = '1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9' AND group_name = 'Group A'), 'Brooklyn Rivera', 34, 'Dallas, Texas', 'Business Administrator', 'A single mom and former pageant queen ready to compete', 'https://static.parade.com/wp-content/uploads/2024/06/brooklyn-rivera-bb27.jpg', 27, true),
('1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9', (SELECT id FROM contestant_groups WHERE pool_id = '1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9' AND group_name = 'Group A'), 'Cam Sullivan-Brown', 25, 'Bowie, Maryland', 'Physical Therapist', 'Former college football player bringing athletic prowess', 'https://static.parade.com/wp-content/uploads/2024/06/cam-sullivan-brown-bb27.jpg', 27, true),
('1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9', (SELECT id FROM contestant_groups WHERE pool_id = '1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9' AND group_name = 'Group A'), 'Cedric Hodges', 21, 'Running Springs, California', 'Marine', 'Young Marine ready to apply military strategy to the game', 'https://static.parade.com/wp-content/uploads/2024/06/cedric-hodges-bb27.jpg', 27, true),

-- GROUP B
('1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9', (SELECT id FROM contestant_groups WHERE pool_id = '1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9' AND group_name = 'Group B'), 'Chelsie Baham', 27, 'Rancho Cucamonga, California', 'Nonprofit Director', 'Strategic player focused on building strong alliances', 'https://static.parade.com/wp-content/uploads/2024/06/chelsie-baham-bb27.jpg', 27, true),
('1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9', (SELECT id FROM contestant_groups WHERE pool_id = '1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9' AND group_name = 'Group B'), 'Joseph Rodriguez', 30, 'Tampa, Florida', 'Video Store Clerk', 'Old-school video store employee with modern game strategy', 'https://static.parade.com/wp-content/uploads/2024/06/joseph-rodriguez-bb27.jpg', 27, true),
('1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9', (SELECT id FROM contestant_groups WHERE pool_id = '1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9' AND group_name = 'Group B'), 'Kimo Apaka', 35, 'Hilo, Hawaii', 'Mattress Sales Rep', 'Hawaiian native bringing island vibes and sales skills', 'https://static.parade.com/wp-content/uploads/2024/06/kimo-apaka-bb27.jpg', 27, true),
('1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9', (SELECT id FROM contestant_groups WHERE pool_id = '1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9' AND group_name = 'Group B'), 'Leah Peters', 26, 'Pittsburgh, Pennsylvania', 'VIP Cocktail Server', 'Social butterfly ready to mix drinks and strategies', 'https://static.parade.com/wp-content/uploads/2024/06/leah-peters-bb27.jpg', 27, true),

-- GROUP C
('1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9', (SELECT id FROM contestant_groups WHERE pool_id = '1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9' AND group_name = 'Group C'), 'Lisa Weintraub', 33, 'Los Angeles, California', 'Celebrity Chef', 'Cooking up strategies in and out of the kitchen', 'https://static.parade.com/wp-content/uploads/2024/06/lisa-weintraub-bb27.jpg', 27, true),
('1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9', (SELECT id FROM contestant_groups WHERE pool_id = '1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9' AND group_name = 'Group C'), 'Makensy Manbeck', 22, 'Houston, Texas', 'Construction Project Manager', 'Building her way to the $750,000 prize', 'https://static.parade.com/wp-content/uploads/2024/06/makensy-manbeck-bb27.jpg', 27, true),
('1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9', (SELECT id FROM contestant_groups WHERE pool_id = '1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9' AND group_name = 'Group C'), 'Matt Hardeman', 25, 'Loganville, Georgia', 'Tech Sales Rep', 'Tech-savvy competitor ready to debug the competition', 'https://static.parade.com/wp-content/uploads/2024/06/matt-hardeman-bb27.jpg', 27, true),
('1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9', (SELECT id FROM contestant_groups WHERE pool_id = '1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9' AND group_name = 'Group C'), 'Quinn Martin', 36, 'Omaha, Nebraska', 'Nurse Practitioner', 'Healthcare hero ready to diagnose the best game moves', 'https://static.parade.com/wp-content/uploads/2024/06/quinn-martin-bb27.jpg', 27, true),

-- GROUP D
('1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9', (SELECT id FROM contestant_groups WHERE pool_id = '1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9' AND group_name = 'Group D'), 'Rubina Bernabe', 35, 'Los Angeles, California', 'Event Bartender', 'Mixing up trouble and serving looks', 'https://static.parade.com/wp-content/uploads/2024/06/rubina-bernabe-bb27.jpg', 27, true),
('1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9', (SELECT id FROM contestant_groups WHERE pool_id = '1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9' AND group_name = 'Group D'), 'T''Kor Clottey', 23, 'Chicago, Illinois', 'Crochet Business Owner', 'Weaving her way through the game one stitch at a time', 'https://static.parade.com/wp-content/uploads/2024/06/tkor-clottey-bb27.jpg', 27, true),
('1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9', (SELECT id FROM contestant_groups WHERE pool_id = '1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9' AND group_name = 'Group D'), 'Tucker Des Lauriers', 30, 'Brooklyn, New York', 'Marketing & Sales Executive', 'Fan favorite ready to market himself to victory', 'https://static.parade.com/wp-content/uploads/2024/06/tucker-des-lauriers-bb27.jpg', 27, true),
('1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9', (SELECT id FROM contestant_groups WHERE pool_id = '1d0e6867-2522-4ad9-a8f1-4b5e7eed67e9' AND group_name = 'Group D'), 'Kenney Kelley', 52, 'Boston, Massachusetts', 'Former Undercover Cop', 'Using detective skills to investigate the competition', 'https://static.parade.com/wp-content/uploads/2024/06/kenney-kelley-bb27.jpg', 27, true);