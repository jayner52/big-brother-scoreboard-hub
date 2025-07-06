-- Add 10 additional Season 26 houseguests to bring total to 16
INSERT INTO public.contestants (
  pool_id, 
  name, 
  age, 
  hometown, 
  occupation, 
  bio, 
  sort_order, 
  is_active,
  season_number
) VALUES
  (NULL, 'Angela Murray', 50, 'Syracuse, UT', 'Real estate agent', 'Real estate agent from Utah', 7, true, 26),
  (NULL, 'Brooklyn Rivera', 34, 'Dallas, TX', 'Business administrator', 'Business administrator from Texas', 8, true, 26),
  (NULL, 'Cam Sullivan-Brown', 25, 'Tampa, FL', 'Physical therapist', 'Physical therapist from Florida', 9, true, 26),
  (NULL, 'Cedric Hodges', 21, 'Atlanta, GA', 'Former Marine', 'Former Marine from Georgia', 10, true, 26),
  (NULL, 'Chelsie Baham', 27, 'Baton Rouge, LA', 'Nonprofit director', 'Nonprofit director from Louisiana', 11, true, 26),
  (NULL, 'Joseph Rodriguez', 30, 'Miami, FL', 'Video store clerk', 'Video store clerk from Florida', 12, true, 26),
  (NULL, 'Kimo Apaka', 35, 'Honolulu, HI', 'Mattress salesman', 'Mattress salesman from Hawaii', 13, true, 26),
  (NULL, 'Leah Peters', 26, 'Miami, FL', 'VIP cocktail server', 'VIP cocktail server from Florida', 14, true, 26),
  (NULL, 'Lisa Weintraub', 33, 'Los Angeles, CA', 'Celebrity chef', 'Celebrity chef from California', 15, true, 26),
  (NULL, 'Makensy Manbeck', 22, 'Houston, TX', 'Construction project manager', 'Construction project manager from Texas', 16, true, 26)
ON CONFLICT (name, pool_id) DO NOTHING;