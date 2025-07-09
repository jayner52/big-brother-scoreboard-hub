-- Update photo URLs for the 3 specified contestants - being very explicit
UPDATE public.contestants 
SET photo_url = 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTgz/cliffton-22will22-williams.jpg'
WHERE pool_id IS NULL 
AND season_number = 27 
AND name = 'Cliffton Williams Jr.';

UPDATE public.contestants 
SET photo_url = 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTg2/season-27-contestant-gallery.jpg'
WHERE pool_id IS NULL 
AND season_number = 27 
AND name = 'Jimmy Heagerty';

UPDATE public.contestants 
SET photo_url = 'https://parade.com/.image/w_750,q_auto:good,c_limit/ODowMDAwMDAwMDAwODU3NTkw/season-27-contestant-gallery-857590.jpg'
WHERE pool_id IS NULL 
AND season_number = 27 
AND name = 'Keanu Soto';