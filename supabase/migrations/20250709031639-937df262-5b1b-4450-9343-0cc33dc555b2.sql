
-- CLEAR ALL SEASON 27 DATA AND INSERT REAL BB27 CAST AS GLOBAL DEFAULTS

-- Step 1: Delete ALL Season 27 data
DELETE FROM contestants WHERE season_number = 27;
DELETE FROM contestant_groups WHERE pool_id IS NULL;

-- Step 2: Create global default groups (pool_id = NULL)
INSERT INTO contestant_groups (pool_id, group_name, sort_order) VALUES
(NULL, 'Group A', 1),
(NULL, 'Group B', 2),
(NULL, 'Group C', 3),
(NULL, 'Group D', 4);

-- Step 3: Insert the REAL BB27 cast as global defaults (pool_id = NULL)
INSERT INTO contestants (
    pool_id, group_id, name, age, hometown, occupation, bio, photo_url, 
    season_number, is_active, sort_order, data_source
) VALUES
-- GROUP A (4 houseguests)
(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group A'), 'Adrian Rocha', 23, 'San Antonio, TX', 'Carpenter', 'Adrian is a Texas carpenter whose hands-on craftsmanship and work ethic drive him.', 'https://ui-avatars.com/api/?name=Adrian+Rocha&size=400&background=FF6B6B&color=fff', 27, true, 1, 'bb27_real_cast'),
(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group A'), 'Amy Bingham', 43, 'Stockton, CA', 'Insurance agent', 'Amy brings 20+ years of risk-management expertise as a Stockton insurance pro.', 'https://ui-avatars.com/api/?name=Amy+Bingham&size=400&background=4ECDC4&color=fff', 27, true, 2, 'bb27_real_cast'),
(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group A'), 'Ashley Hollis', 25, 'Chicago, IL → New York, NY', 'Attorney', 'Chicago-born Ashley now practices law in New York, blending Midwestern grit with big-city savvy.', 'https://ui-avatars.com/api/?name=Ashley+Hollis&size=400&background=45B7D1&color=fff', 27, true, 3, 'bb27_real_cast'),
(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group A'), 'Ava Pearl', 24, 'Long Island, NY → New York, NY', 'Aura painter', 'Ava is a Long Island–based aura painter who channels her spiritual artistry into every canvas.', 'https://ui-avatars.com/api/?name=Ava+Pearl&size=400&background=96CEB4&color=fff', 27, true, 4, 'bb27_real_cast'),

-- GROUP B (4 houseguests)
(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group B'), 'Cliffton "Will" Williams', 50, 'Wallace, SC → Charlotte, NC', 'College sports podcaster', 'Will is a veteran college-sports podcaster from South Carolina, now hosting from Charlotte.', 'https://ui-avatars.com/api/?name=Will+Williams&size=400&background=FECA57&color=fff', 27, true, 5, 'bb27_real_cast'),
(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group B'), 'Isaiah "Zae" Frederich', 23, 'Paducah, KY → Provo, UT', 'Salesperson', 'Zae is a sales pro who traded Kentucky roots for the mountains of Provo.', 'https://ui-avatars.com/api/?name=Zae+Frederich&size=400&background=FF6348&color=fff', 27, true, 6, 'bb27_real_cast'),
(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group B'), 'Jimmy Heagerty', 25, 'Sarasota, FL → Washington, DC', 'AI consultant', 'Jimmy is an AI consultant combining Florida laid-back style with D.C. tech chops.', 'https://ui-avatars.com/api/?name=Jimmy+Heagerty&size=400&background=6C5CE7&color=fff', 27, true, 7, 'bb27_real_cast'),
(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group B'), 'Katherine Woodman', 23, 'Gwinnett Co., GA → Columbia, SC', 'Fine-dining server', 'Katherine brings Southern hospitality from fine-dining tables to the Big Brother house.', 'https://ui-avatars.com/api/?name=Katherine+Woodman&size=400&background=A29BFE&color=fff', 27, true, 8, 'bb27_real_cast'),

-- GROUP C (4 houseguests)
(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group C'), 'Keanu Soto', 33, 'Miami, FL → McKinney, TX', 'Dungeon Master', 'Keanu is a Miami-born Dungeon Master now running epic tabletop campaigns in Texas.', 'https://ui-avatars.com/api/?name=Keanu+Soto&size=400&background=FD79A8&color=fff', 27, true, 9, 'bb27_real_cast'),
(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group C'), 'Kelley Jorgensen', 29, 'Burbank, SD', 'Web designer', 'Kelley is a South Dakota–based web designer, turning small-town creativity into sleek sites.', 'https://ui-avatars.com/api/?name=Kelley+Jorgensen&size=400&background=FDCB6E&color=fff', 27, true, 10, 'bb27_real_cast'),
(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group C'), 'Lauren Domingue', 22, 'Lafayette, LA', 'Bridal consultant', 'Lauren helps create dream weddings as a bridal consultant in Louisiana.', 'https://ui-avatars.com/api/?name=Lauren+Domingue&size=400&background=6C5CE7&color=fff', 27, true, 11, 'bb27_real_cast'),
(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group C'), 'Mickey Lee', 35, 'Jacksonville, FL → Atlanta, GA', 'Event curator', 'Mickey curates high-impact events in Atlanta, drawing on Florida roots for flair.', 'https://ui-avatars.com/api/?name=Mickey+Lee&size=400&background=00B894&color=fff', 27, true, 12, 'bb27_real_cast'),

-- GROUP D (4 houseguests)
(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group D'), 'Morgan Pope', 33, 'Palm Springs, CA → Los Angeles, CA', 'Gamer', 'Morgan is a competitive gamer from California, leveling up in L.A.''s streaming scene.', 'https://ui-avatars.com/api/?name=Morgan+Pope&size=400&background=00CEC9&color=fff', 27, true, 13, 'bb27_real_cast'),
(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group D'), 'Rylie Jeffries', 27, 'Luther, OK', 'Professional bull rider', 'Rylie is an Oklahoma bull-riding pro, known for grit and rodeo prowess.', 'https://ui-avatars.com/api/?name=Rylie+Jeffries&size=400&background=E17055&color=fff', 27, true, 14, 'bb27_real_cast'),
(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group D'), 'Vince Panaro', 34, 'West Hills, CA', 'Currently unemployed', 'Vince brings a laid-back California vibe as he considers his next move.', 'https://ui-avatars.com/api/?name=Vince+Panaro&size=400&background=74B9FF&color=fff', 27, true, 15, 'bb27_real_cast'),
(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group D'), 'Zach Cornell', 27, 'Cartersville, GA', 'Marketing manager', 'Zach is a Georgia marketing manager who blends strategic thinking with Southern charm.', 'https://ui-avatars.com/api/?name=Zach+Cornell&size=400&background=A29BFE&color=fff', 27, true, 16, 'bb27_real_cast');
