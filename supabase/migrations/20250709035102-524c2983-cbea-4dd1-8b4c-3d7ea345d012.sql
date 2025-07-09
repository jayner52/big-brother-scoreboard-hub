-- Update Season 27 contestant photo URLs with Parade.com links
-- Update the contestants that can be mapped definitively from the URL filenames

UPDATE contestants 
SET photo_url = CASE name
  WHEN 'Adrian Rocha' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTc5/adrian-rocha.jpg'
  WHEN 'Amy Bingham' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTgw/amy-bingham.jpg'
  WHEN 'Ashley Hollis' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTgx/ashley-hollis.jpg'
  WHEN 'Ava Pearl' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTgy/ava-pearl.jpg'
  WHEN 'Cliffton "Will" Williams' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTgz/cliffton-22will22-williams.jpg'
  ELSE photo_url
END
WHERE pool_id IS NULL 
AND season_number = 27
AND name IN ('Adrian Rocha', 'Amy Bingham', 'Ashley Hollis', 'Ava Pearl', 'Cliffton "Will" Williams');

-- Copy the updated photo URLs to existing pool-specific contestants
UPDATE contestants AS pool_contestants
SET photo_url = global_contestants.photo_url
FROM contestants AS global_contestants
WHERE pool_contestants.pool_id IS NOT NULL
AND pool_contestants.season_number = 27
AND global_contestants.pool_id IS NULL
AND global_contestants.season_number = 27
AND pool_contestants.name = global_contestants.name
AND global_contestants.name IN ('Adrian Rocha', 'Amy Bingham', 'Ashley Hollis', 'Ava Pearl', 'Cliffton "Will" Williams');