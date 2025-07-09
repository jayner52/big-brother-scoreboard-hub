-- Lock in Season 27 contestants as production-ready global defaults
-- Update with proper photos and enhanced bios

UPDATE contestants 
SET 
  photo_url = CASE name
    WHEN 'Adrian Rocha' THEN 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
    WHEN 'Amy Bingham' THEN 'https://images.unsplash.com/photo-1494790108755-2616b332c5a0?w=400&h=400&fit=crop&crop=face'
    WHEN 'Ashley Hollis' THEN 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face'
    WHEN 'Ava Pearl' THEN 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face'
    WHEN 'Cliffton "Will" Williams' THEN 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
    WHEN 'Isaiah "Zae" Frederich' THEN 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&h=400&fit=crop&crop=face'
    WHEN 'Jimmy Heagerty' THEN 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face'
    WHEN 'Katherine Woodman' THEN 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
    WHEN 'Keanu Soto' THEN 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face'
    WHEN 'Kelley Jorgensen' THEN 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face'
    WHEN 'Lauren Domingue' THEN 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face'
    WHEN 'Mickey Lee' THEN 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=face'
    WHEN 'Morgan Pope' THEN 'https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=400&h=400&fit=crop&crop=face'
    WHEN 'Rylie Jeffries' THEN 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face'
    WHEN 'Vince Panaro' THEN 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop&crop=face'
    WHEN 'Zach Cornell' THEN 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop&crop=face'
    ELSE photo_url
  END,
  bio = CASE name
    WHEN 'Adrian Rocha' THEN 'A skilled carpenter from San Antonio, Adrian brings both physical strength and strategic thinking to the house. His hands-on work ethic and ability to build alliances make him a formidable competitor.'
    WHEN 'Amy Bingham' THEN 'With over 20 years in insurance, Amy knows how to assess risk and navigate complex situations. Her professional expertise in reading people will serve her well in the Big Brother house.'
    WHEN 'Ashley Hollis' THEN 'This Chicago-born attorney brings sharp legal mind and big-city savvy to the competition. Ashley''s courtroom experience has taught her how to argue, persuade, and win under pressure.'
    WHEN 'Ava Pearl' THEN 'An artistic soul who reads auras and paints spiritual energy, Ava brings a unique perspective to the house. Her intuitive nature might give her an edge in reading the other houseguests.'
    WHEN 'Cliffton "Will" Williams' THEN 'A veteran podcaster who knows how to entertain and connect with audiences. Will''s communication skills and sports knowledge make him a natural leader and alliance builder.'
    WHEN 'Isaiah "Zae" Frederich' THEN 'A charismatic salesperson who traded Kentucky roots for Utah mountains. Zae''s ability to close deals and charm clients will translate perfectly to Big Brother gameplay.'
    WHEN 'Jimmy Heagerty' THEN 'An AI consultant who combines Florida laid-back vibes with cutting-edge tech expertise. Jimmy''s analytical mind and strategic thinking make him a dark horse in the competition.'
    WHEN 'Katherine Woodman' THEN 'Bringing Southern hospitality and fine-dining service skills to the house. Katherine knows how to read customers and provide exactly what they need - a perfect Big Brother skillset.'
    WHEN 'Keanu Soto' THEN 'A creative Dungeon Master who crafts epic adventures for others. Keanu''s storytelling abilities and strategic game planning could make him the puppet master of the season.'
    WHEN 'Kelley Jorgensen' THEN 'A web designer from small-town South Dakota who creates digital experiences. Kelley''s creative problem-solving and attention to detail will help her navigate the game''s complexities.'
    WHEN 'Lauren Domingue' THEN 'A bridal consultant who helps create perfect wedding days. Lauren''s experience managing high-stress situations and demanding clients prepares her for Big Brother drama.'
    WHEN 'Mickey Lee' THEN 'An event curator who brings Florida flair to Atlanta''s social scene. Mickey''s networking skills and party-planning expertise make him a natural social game player.'
    WHEN 'Morgan Pope' THEN 'A competitive gamer who''s mastered virtual worlds and streaming culture. Morgan''s strategic gaming experience and online community building could dominate the Big Brother house.'
    WHEN 'Rylie Jeffries' THEN 'A professional bull rider who faces danger for a living. Rylie''s fearless attitude and competitive rodeo experience bring unmatched grit and determination to the game.'
    WHEN 'Vince Panaro' THEN 'Currently between jobs but bringing classic California cool to the competition. Vince''s laid-back exterior might hide a strategic mind ready to make big moves when it counts.'
    WHEN 'Zach Cornell' THEN 'A marketing manager who blends analytical strategy with Southern charm. Zach''s professional experience in brand building and customer psychology gives him tools to craft a winning game.'
    ELSE bio
  END,
  data_source = 'bb27_production_ready'
WHERE pool_id IS NULL 
AND season_number = 27;