-- Update photo URLs for the 3 specified contestants in global defaults
UPDATE public.contestants 
SET photo_url = CASE 
  WHEN name = 'Cliffton Williams Jr.' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTgz/cliffton-22will22-williams.jpg'
  WHEN name = 'Jimmy Heagerty' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTg2/season-27-contestant-gallery.jpg'
  WHEN name = 'Keanu Soto' THEN 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTkw/season-27-contestant-gallery-857590.jpg'
  ELSE photo_url
END
WHERE pool_id IS NULL 
AND season_number = 27 
AND name IN ('Cliffton Williams Jr.', 'Jimmy Heagerty', 'Keanu Soto');