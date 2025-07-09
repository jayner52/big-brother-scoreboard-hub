-- Update Season 27 contestant names and photo URLs with real data
-- First update the names to match real Big Brother 27 contestants

UPDATE contestants 
SET 
  name = CASE name
    WHEN 'Zae Jackson' THEN 'Isaiah "Zae" Frederich'
    WHEN 'Jimmy Martinez' THEN 'Jimmy Heagerty' 
    WHEN 'Katherine Lee' THEN 'Katherine Woodman'
    WHEN 'Keanu Patel' THEN 'Keanu Soto'
    WHEN 'Lance Cooper' THEN 'Kelley Jorgensen'
    WHEN 'Madison Foster' THEN 'Lauren Domingue'
    WHEN 'Rylie Johnson' THEN 'Mickey Lee'
    WHEN 'Serenity Walsh' THEN 'Morgan Pope'
    WHEN 'Tiffany Brooks' THEN 'Rylie Jeffries'
    WHEN 'Vince Taylor' THEN 'Vince Panaro'
    WHEN 'Zach Williams' THEN 'Zach Cornell'
    ELSE name
  END,
  photo_url = CASE name
    WHEN 'Zae Jackson' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTg0/season-27-contestant-gallery.jpg'
    WHEN 'Jimmy Martinez' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTg2/season-27-contestant-gallery.jpg'
    WHEN 'Katherine Lee' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTg4/season-27-contestant-gallery.jpg'
    WHEN 'Keanu Patel' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTkw/season-27-contestant-gallery-857590.jpg'
    WHEN 'Lance Cooper' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTkx/season-27-contestant-gallery.jpg'
    WHEN 'Madison Foster' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTky/season-27-contestant-gallery.jpg'
    WHEN 'Rylie Johnson' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTkz/season-27-contestant-gallery-857593.jpg'
    WHEN 'Serenity Walsh' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTk0/season-27-contestant-gallery-857594.jpg'
    WHEN 'Tiffany Brooks' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTk1/season-27-contestant-gallery.jpg'
    WHEN 'Vince Taylor' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTk2/season-27-contestant-gallery-857596.jpg'
    WHEN 'Zach Williams' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTk3/season-27-contestant-gallery-857597.jpg'
    ELSE photo_url
  END
WHERE pool_id IS NULL 
AND season_number = 27;

-- Update pool-specific contestants with the new names and photos
UPDATE contestants AS pool_contestants
SET 
  name = global_contestants.name,
  photo_url = global_contestants.photo_url
FROM contestants AS global_contestants
WHERE pool_contestants.pool_id IS NOT NULL
AND pool_contestants.season_number = 27
AND global_contestants.pool_id IS NULL
AND global_contestants.season_number = 27
AND (
  (pool_contestants.name = 'Zae Jackson' AND global_contestants.name = 'Isaiah "Zae" Frederich') OR
  (pool_contestants.name = 'Jimmy Martinez' AND global_contestants.name = 'Jimmy Heagerty') OR
  (pool_contestants.name = 'Katherine Lee' AND global_contestants.name = 'Katherine Woodman') OR
  (pool_contestants.name = 'Keanu Patel' AND global_contestants.name = 'Keanu Soto') OR
  (pool_contestants.name = 'Lance Cooper' AND global_contestants.name = 'Kelley Jorgensen') OR
  (pool_contestants.name = 'Madison Foster' AND global_contestants.name = 'Lauren Domingue') OR
  (pool_contestants.name = 'Rylie Johnson' AND global_contestants.name = 'Mickey Lee') OR
  (pool_contestants.name = 'Serenity Walsh' AND global_contestants.name = 'Morgan Pope') OR
  (pool_contestants.name = 'Tiffany Brooks' AND global_contestants.name = 'Rylie Jeffries') OR
  (pool_contestants.name = 'Vince Taylor' AND global_contestants.name = 'Vince Panaro') OR
  (pool_contestants.name = 'Zach Williams' AND global_contestants.name = 'Zach Cornell')
);