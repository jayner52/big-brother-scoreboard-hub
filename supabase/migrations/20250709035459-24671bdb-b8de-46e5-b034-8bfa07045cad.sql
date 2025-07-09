
-- Update remaining Season 27 contestant photo URLs with Parade.com links
-- Mapping alphabetically by first name to remaining generic URLs

UPDATE contestants 
SET photo_url = CASE name
  -- Remaining contestants in alphabetical order by first name
  WHEN 'Zae Jackson' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTg0/season-27-contestant-gallery.jpg'  -- Isaiah "Zae" 
  WHEN 'Jimmy Martinez' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTg2/season-27-contestant-gallery.jpg'  -- Jimmy
  WHEN 'Katherine Lee' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTg4/season-27-contestant-gallery.jpg'  -- Katherine
  WHEN 'Keanu Patel' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTkw/season-27-contestant-gallery-857590.jpg'  -- Keanu
  WHEN 'Lance Cooper' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTkx/season-27-contestant-gallery.jpg'  -- Kelley (placeholder name)
  WHEN 'Madison Foster' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTky/season-27-contestant-gallery.jpg'  -- Lauren (placeholder name)
  WHEN 'Rylie Johnson' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTkz/season-27-contestant-gallery-857593.jpg'  -- Mickey (placeholder name) 
  WHEN 'Serenity Walsh' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTk0/season-27-contestant-gallery-857594.jpg'  -- Morgan (placeholder name)
  WHEN 'Tiffany Brooks' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTk1/season-27-contestant-gallery.jpg'  -- Rylie (placeholder name)
  WHEN 'Vince Taylor' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTk2/season-27-contestant-gallery-857596.jpg'  -- Vince
  WHEN 'Zach Williams' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTk3/season-27-contestant-gallery-857597.jpg'  -- Zach
  ELSE photo_url
END
WHERE pool_id IS NULL 
AND season_number = 27
AND name IN ('Zae Jackson', 'Jimmy Martinez', 'Katherine Lee', 'Keanu Patel', 'Lance Cooper', 'Madison Foster', 'Rylie Johnson', 'Serenity Walsh', 'Tiffany Brooks', 'Vince Taylor', 'Zach Williams');

-- Copy the updated photo URLs to existing pool-specific contestants
UPDATE contestants AS pool_contestants
SET photo_url = global_contestants.photo_url
FROM contestants AS global_contestants
WHERE pool_contestants.pool_id IS NOT NULL
AND pool_contestants.season_number = 27
AND global_contestants.pool_id IS NULL
AND global_contestants.season_number = 27
AND pool_contestants.name = global_contestants.name
AND global_contestants.name IN ('Zae Jackson', 'Jimmy Martinez', 'Katherine Lee', 'Keanu Patel', 'Lance Cooper', 'Madison Foster', 'Rylie Johnson', 'Serenity Walsh', 'Tiffany Brooks', 'Vince Taylor', 'Zach Williams');
