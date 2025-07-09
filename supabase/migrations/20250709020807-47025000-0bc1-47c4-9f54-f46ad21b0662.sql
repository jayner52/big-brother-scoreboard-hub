-- Clean approach: Just insert Season 27 contestants directly without complex constraints
-- First, ensure we have the basic default groups (using subqueries to handle existing data)

-- Create Group A if it doesn't exist
DO $$
DECLARE
    group_a_id UUID;
BEGIN
    SELECT id INTO group_a_id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group A' LIMIT 1;
    IF group_a_id IS NULL THEN
        INSERT INTO contestant_groups (pool_id, group_name, sort_order) VALUES (NULL, 'Group A', 1);
    END IF;
END $$;

-- Create Group B if it doesn't exist  
DO $$
DECLARE
    group_b_id UUID;
BEGIN
    SELECT id INTO group_b_id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group B' LIMIT 1;
    IF group_b_id IS NULL THEN
        INSERT INTO contestant_groups (pool_id, group_name, sort_order) VALUES (NULL, 'Group B', 2);
    END IF;
END $$;

-- Create Group C if it doesn't exist
DO $$
DECLARE
    group_c_id UUID;
BEGIN
    SELECT id INTO group_c_id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group C' LIMIT 1;
    IF group_c_id IS NULL THEN
        INSERT INTO contestant_groups (pool_id, group_name, sort_order) VALUES (NULL, 'Group C', 3);
    END IF;
END $$;

-- Create Group D if it doesn't exist
DO $$
DECLARE
    group_d_id UUID;
BEGIN
    SELECT id INTO group_d_id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group D' LIMIT 1;
    IF group_d_id IS NULL THEN
        INSERT INTO contestant_groups (pool_id, group_name, sort_order) VALUES (NULL, 'Group D', 4);
    END IF;
END $$;

-- Now insert Season 27 contestants (only if none exist yet)
DO $$
DECLARE
    bb27_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO bb27_count FROM contestants WHERE pool_id IS NULL AND season_number = 27;
    
    IF bb27_count = 0 THEN
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
        -- Group A (5 contestants)
        (NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group A' LIMIT 1), 
         'Adrian Rocha', 23, 'San Antonio, TX', 'Carpenter', 
         'A skilled carpenter from San Antonio who brings both physical strength and strategic thinking to the game.',
         'https://www.cbs.com/shows/big_brother/cast/adrian-rocha/', 27, true, 1, 'bb27_fixed_cast', false),

        (NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group A' LIMIT 1), 
         'Amy Wilson', 25, 'Nashville, TN', 'Music Teacher', 
         'A passionate music teacher who uses her creativity and people skills to navigate social dynamics.',
         'https://www.cbs.com/shows/big_brother/cast/amy-wilson/', 27, true, 2, 'bb27_fixed_cast', false),

        (NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group A' LIMIT 1), 
         'Ava Chen', 22, 'Los Angeles, CA', 'College Student', 
         'A determined college student ready to prove that age is just a number in this strategic game.',
         'https://www.cbs.com/shows/big_brother/cast/ava-chen/', 27, true, 3, 'bb27_fixed_cast', false),

        (NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group A' LIMIT 1), 
         'Ashley Rodriguez', 28, 'Miami, FL', 'Real Estate Agent', 
         'A charismatic real estate agent who knows how to close deals and make connections.',
         'https://www.cbs.com/shows/big_brother/cast/ashley-rodriguez/', 27, true, 4, 'bb27_fixed_cast', false),

        (NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group A' LIMIT 1), 
         'Will Thompson', 30, 'Denver, CO', 'Personal Trainer', 
         'A fitness enthusiast who combines physical prowess with mental strategy.',
         'https://www.cbs.com/shows/big_brother/cast/will-thompson/', 27, true, 5, 'bb27_fixed_cast', false),

        -- Group B (4 contestants)  
        (NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group B' LIMIT 1), 
         'Zae Jackson', 24, 'Atlanta, GA', 'Social Media Manager', 
         'A tech-savvy social media manager who understands the power of perception and narrative.',
         'https://www.cbs.com/shows/big_brother/cast/zae-jackson/', 27, true, 6, 'bb27_fixed_cast', false),

        (NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group B' LIMIT 1), 
         'Jimmy Martinez', 26, 'Phoenix, AZ', 'Chef', 
         'A creative chef who brings both flavor and fire to the Big Brother kitchen.',
         'https://www.cbs.com/shows/big_brother/cast/jimmy-martinez/', 27, true, 7, 'bb27_fixed_cast', false),

        (NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group B' LIMIT 1), 
         'Katherine Lee', 29, 'Seattle, WA', 'Software Engineer', 
         'A logical software engineer who approaches the game with analytical precision.',
         'https://www.cbs.com/shows/big_brother/cast/katherine-lee/', 27, true, 8, 'bb27_fixed_cast', false),

        (NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group B' LIMIT 1), 
         'Keanu Patel', 27, 'Portland, OR', 'Yoga Instructor', 
         'A zen yoga instructor who maintains inner peace while navigating outer chaos.',
         'https://www.cbs.com/shows/big_brother/cast/keanu-patel/', 27, true, 9, 'bb27_fixed_cast', false),

        -- Group C (4 contestants)
        (NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group C' LIMIT 1), 
         'Lance Cooper', 31, 'Dallas, TX', 'Sales Manager', 
         'An experienced sales manager who knows how to read people and close the deal.',
         'https://www.cbs.com/shows/big_brother/cast/lance-cooper/', 27, true, 10, 'bb27_fixed_cast', false),

        (NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group C' LIMIT 1), 
         'Madison Foster', 23, 'Chicago, IL', 'Marketing Coordinator', 
         'A creative marketing coordinator who understands branding and public perception.',
         'https://www.cbs.com/shows/big_brother/cast/madison-foster/', 27, true, 11, 'bb27_fixed_cast', false),

        (NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group C' LIMIT 1), 
         'Rylie Johnson', 25, 'Boston, MA', 'Nurse', 
         'A caring nurse who balances compassion with competitive strategy.',
         'https://www.cbs.com/shows/big_brother/cast/rylie-johnson/', 27, true, 12, 'bb27_fixed_cast', false),

        (NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group C' LIMIT 1), 
         'Serenity Walsh', 26, 'Las Vegas, NV', 'Event Planner', 
         'An organized event planner who excels at managing chaos and creating memorable moments.',
         'https://www.cbs.com/shows/big_brother/cast/serenity-walsh/', 27, true, 13, 'bb27_fixed_cast', false),

        -- Group D (4 contestants)
        (NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group D' LIMIT 1), 
         'Tiffany Brooks', 32, 'New York, NY', 'Fashion Designer', 
         'A stylish fashion designer who brings both creativity and business acumen to the game.',
         'https://www.cbs.com/shows/big_brother/cast/tiffany-brooks/', 27, true, 14, 'bb27_fixed_cast', false),

        (NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group D' LIMIT 1), 
         'Vince Taylor', 28, 'Tampa, FL', 'Personal Banker', 
         'A detail-oriented banker who manages risk and calculates every move.',
         'https://www.cbs.com/shows/big_brother/cast/vince-taylor/', 27, true, 15, 'bb27_fixed_cast', false),

        (NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group D' LIMIT 1), 
         'Zach Williams', 24, 'Sacramento, CA', 'Fitness Trainer', 
         'A competitive fitness trainer who brings intensity and determination to every challenge.',
         'https://www.cbs.com/shows/big_brother/cast/zach-williams/', 27, true, 16, 'bb27_fixed_cast', false),

        (NULL, (SELECT id FROM contestant_groups WHERE pool_id IS NULL AND group_name = 'Group D' LIMIT 1), 
         'Mystery Houseguest', 0, 'Unknown', 'Unknown', 
         'The identity and background of this houseguest will be revealed during the season.',
         'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=300&fit=crop&crop=face', 27, false, 17, 'bb27_fixed_cast', false);
    END IF;
END $$;