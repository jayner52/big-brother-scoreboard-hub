-- Add Season 26 contestants to default pool for seeding
INSERT INTO public.contestants (
  pool_id, -- NULL for templates
  name,
  age,
  hometown, 
  occupation,
  bio,
  season_number,
  is_active,
  sort_order
) VALUES
  (NULL, 'Ainsley Earhardt', 47, 'Spartanburg, SC', 'TV Host', 'Ainsley is a 47-year-old TV Host from Spartanburg, SC.', 26, true, 1),
  (NULL, 'Angela Murray', 50, 'Syracuse, UT', 'Real Estate Agent', 'Angela is a 50-year-old Real Estate Agent from Syracuse, UT.', 26, true, 2),
  (NULL, 'Brooklyn Rivera', 34, 'Dallas, TX', 'Business Admin', 'Brooklyn is a 34-year-old Business Admin from Dallas, TX.', 26, true, 3),
  (NULL, 'Cam Sullivan-Brown', 25, 'Bowie, MD', 'Physical Therapist', 'Cam is a 25-year-old Physical Therapist from Bowie, MD.', 26, true, 4),
  (NULL, 'Cedric Hodges', 21, 'Bismarck, ND', 'Former Marine', 'Cedric is a 21-year-old Former Marine from Bismarck, ND.', 26, true, 5),
  (NULL, 'Chelsea Burd', 37, 'Rancho Cucamonga, CA', 'Daycare Owner', 'Chelsea is a 37-year-old Daycare Owner from Rancho Cucamonga, CA.', 26, true, 6),
  (NULL, 'Chelsie Baham', 27, 'Rancho Cucamonga, CA', 'Nonprofit Director', 'Chelsie is a 27-year-old Nonprofit Director from Rancho Cucamonga, CA.', 26, true, 7),
  (NULL, 'Joseph Rodriguez', 30, 'Tampa, FL', 'Video Store Clerk', 'Joseph is a 30-year-old Video Store Clerk from Tampa, FL.', 26, true, 8),
  (NULL, 'Kimo Apaka', 35, 'Hilo, HI', 'Mattress Firm Manager', 'Kimo is a 35-year-old Mattress Firm Manager from Hilo, HI.', 26, true, 9),
  (NULL, 'Leah Peters', 26, 'Miami, FL', 'VIP Cocktail Server', 'Leah is a 26-year-old VIP Cocktail Server from Miami, FL.', 26, true, 10),
  (NULL, 'Lisa Weintraub', 33, 'Los Angeles, CA', 'Celebrity Chef', 'Lisa is a 33-year-old Celebrity Chef from Los Angeles, CA.', 26, true, 11),
  (NULL, 'Makensy Manbeck', 22, 'Houston, TX', 'Construction Worker', 'Makensy is a 22-year-old Construction Worker from Houston, TX.', 26, true, 12),
  (NULL, 'Matt Hardeman', 25, 'Loganville, GA', 'Tech Sales Rep', 'Matt is a 25-year-old Tech Sales Rep from Loganville, GA.', 26, true, 13),
  (NULL, 'Quinn Martin', 25, 'Omaha, NE', 'Nurse Recruiter', 'Quinn is a 25-year-old Nurse Recruiter from Omaha, NE.', 26, true, 14),
  (NULL, 'T''kor Clottey', 23, 'Chicago, IL', 'Crochet Business Owner', 'T''kor is a 23-year-old Crochet Business Owner from Chicago, IL.', 26, true, 15),
  (NULL, 'Tucker Des Lauriers', 30, 'Boston, MA', 'Marketing/Sales Executive', 'Tucker is a 30-year-old Marketing/Sales Executive from Boston, MA.', 26, true, 16)
ON CONFLICT (pool_id, name) DO NOTHING;