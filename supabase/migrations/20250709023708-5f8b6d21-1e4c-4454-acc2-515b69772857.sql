-- Update ALL Season 27 contestants (both global and pool-specific) with professional placeholder photos
UPDATE public.contestants 
SET photo_url = CASE name
  WHEN 'Adrian Rocha' THEN 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face'
  WHEN 'Amy Wilson' THEN 'https://images.unsplash.com/photo-1494790108755-2616b5637aac?w=300&h=300&fit=crop&crop=face'
  WHEN 'Ava Chen' THEN 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face'
  WHEN 'Ashley Rodriguez' THEN 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face'
  WHEN 'Will Thompson' THEN 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face'
  WHEN 'Zae Jackson' THEN 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&crop=face'
  WHEN 'Jimmy Martinez' THEN 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=300&h=300&fit=crop&crop=face'
  WHEN 'Katherine Lee' THEN 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face'
  WHEN 'Keanu Patel' THEN 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face'
  WHEN 'Lance Cooper' THEN 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=300&h=300&fit=crop&crop=face'
  WHEN 'Madison Foster' THEN 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face'
  WHEN 'Rylie Johnson' THEN 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=300&h=300&fit=crop&crop=face'
  WHEN 'Serenity Walsh' THEN 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&h=300&fit=crop&crop=face'
  WHEN 'Tiffany Brooks' THEN 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop&crop=face'
  WHEN 'Vince Taylor' THEN 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face'
  WHEN 'Zach Williams' THEN 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=300&h=300&fit=crop&crop=face'
  WHEN 'Mystery Houseguest' THEN 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=300&fit=crop&crop=face'
END
WHERE season_number = 27;