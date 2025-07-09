
-- COMPLETE Season 27 Rebuild - Official Cast with Exact Data
-- This migration removes any existing Season 27 data and creates the definitive Season 27 global defaults

-- Step 1: Clean slate - remove any existing Season 27 contestants
DELETE FROM public.contestants WHERE season_number = 27;

-- Step 2: Ensure default groups exist
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

-- Step 3: Insert the exact Season 27 cast with your provided data
-- Distributed evenly: Group A (4), Group B (4), Group C (4), Group D (4)
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
 'Adrian Rocha', 23, 'San Antonio, TX', 'Carpenter', 
 'Adrian is a Texas carpenter whose hands-on craftsmanship and work ethic drive him.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTc5/adrian-rocha.jpg', 27, true, 1, 'bb27_official_cast', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group A' LIMIT 1), 
 'Amy Bingham', 43, 'Stockton, CA', 'Insurance agent', 
 'Amy brings 20+ years of risk-management expertise as a Stockton insurance pro.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTgw/amy-bingham.jpg', 27, true, 2, 'bb27_official_cast', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group A' LIMIT 1), 
 'Ashley Hollis', 25, 'Chicago, IL → New York, NY', 'Attorney', 
 'Chicago-born Ashley now practices law in New York, blending Midwestern grit with big-city savvy.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTgx/ashley-hollis.jpg', 27, true, 3, 'bb27_official_cast', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group A' LIMIT 1), 
 'Ava Pearl', 24, 'Long Island, NY → New York, NY', 'Aura painter', 
 'Ava is a Long Island–based aura painter who channels her spiritual artistry into every canvas.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTgy/ava-pearl.jpg', 27, true, 4, 'bb27_official_cast', false),

-- Group B (4 contestants)
(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group B' LIMIT 1), 
 'Cliffton "Will" Williams', 50, 'Wallace, SC → Charlotte, NC', 'College sports podcaster', 
 'Will is a veteran college-sports podcaster from South Carolina, now hosting from Charlotte.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTgz/cliffton-22will22-williams.jpg', 27, true, 5, 'bb27_official_cast', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group B' LIMIT 1), 
 'Isaiah "Zae" Frederich', 23, 'Paducah, KY → Provo, UT', 'Salesperson', 
 'Zae is a sales pro who traded Kentucky roots for the mountains of Provo.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTg0/season-27-contestant-gallery.jpg', 27, true, 6, 'bb27_official_cast', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group B' LIMIT 1), 
 'Jimmy Heagerty', 25, 'Sarasota, FL → Washington, DC', 'AI consultant', 
 'Jimmy is an AI consultant combining Florida laid-back style with D.C. tech chops.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTg2/season-27-contestant-gallery.jpg', 27, true, 7, 'bb27_official_cast', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group B' LIMIT 1), 
 'Katherine Woodman', 23, 'Gwinnett Co., GA → Columbia, SC', 'Fine-dining server', 
 'Katherine brings Southern hospitality from fine-dining tables to the Big Brother house.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTg4/season-27-contestant-gallery.jpg', 27, true, 8, 'bb27_official_cast', false),

-- Group C (4 contestants)
(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group C' LIMIT 1), 
 'Keanu Soto', 33, 'Miami, FL → McKinney, TX', 'Dungeon Master', 
 'Keanu is a Miami-born Dungeon Master now running epic tabletop campaigns in Texas.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTkw/season-27-contestant-gallery-857590.jpg', 27, true, 9, 'bb27_official_cast', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group C' LIMIT 1), 
 'Kelley Jorgensen', 29, 'Burbank, SD', 'Web designer', 
 'Kelley is a South Dakota–based web designer, turning small-town creativity into sleek sites.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTkx/season-27-contestant-gallery.jpg', 27, true, 10, 'bb27_official_cast', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group C' LIMIT 1), 
 'Lauren Domingue', 22, 'Lafayette, LA', 'Bridal consultant', 
 'Lauren helps create dream weddings as a bridal consultant in Louisiana.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTky/season-27-contestant-gallery.jpg', 27, true, 11, 'bb27_official_cast', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group C' LIMIT 1), 
 'Mickey Lee', 35, 'Jacksonville, FL → Atlanta, GA', 'Event curator', 
 'Mickey curates high-impact events in Atlanta, drawing on Florida roots for flair.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTkz/season-27-contestant-gallery-857593.jpg', 27, true, 12, 'bb27_official_cast', false),

-- Group D (4 contestants)
(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group D' LIMIT 1), 
 'Morgan Pope', 33, 'Palm Springs, CA → Los Angeles, CA', 'Gamer', 
 'Morgan is a competitive gamer from California, leveling up in L.A.''s streaming scene.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTk0/season-27-contestant-gallery-857594.jpg', 27, true, 13, 'bb27_official_cast', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group D' LIMIT 1), 
 'Rylie Jeffries', 27, 'Luther, OK', 'Professional bull rider', 
 'Rylie is an Oklahoma bull-riding pro, known for grit and rodeo prowess.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTk1/season-27-contestant-gallery.jpg', 27, true, 14, 'bb27_official_cast', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group D' LIMIT 1), 
 'Vince Panaro', 34, 'West Hills, CA', '(Currently unemployed)', 
 'Vince brings a laid-back California vibe as he considers his next move.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTk2/season-27-contestant-gallery-857596.jpg', 27, true, 15, 'bb27_official_cast', false),

(NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group D' LIMIT 1), 
 'Zach Cornell', 27, 'Cartersville, GA', 'Marketing manager', 
 'Zach is a Georgia marketing manager who blends strategic thinking with Southern charm.',
 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTk3/season-27-contestant-gallery-857597.jpg', 27, true, 16, 'bb27_official_cast', false);
