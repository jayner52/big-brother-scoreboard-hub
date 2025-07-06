// Season 26 Houseguests - Hardcoded List for Instant Population
// This removes dependency on AI generation for Season 26

import { supabase } from '@/integrations/supabase/client';

export const SEASON_26_HOUSEGUESTS = [
  {
    name: "Angela Murray",
    age: 50,
    hometown: "Syracuse, Utah",
    occupation: "Real Estate Agent",
    bio: "Angela is a successful real estate agent and mother who brings strong business acumen to the game. Known for her strategic thinking and social skills.",
    photo_url: "https://www.goldderby.com/wp-content/uploads/2024/07/big-brother-26-angela-murray.jpg",
    relationship_status: "Married",
    family_info: "Mother of three children",
    personality_traits: ["Strategic", "Social", "Competitive", "Leader"],
    gameplay_strategy: "Build strong alliances early and use social connections to advance",
    backstory: "Angela has always been competitive and strategic in both her personal and professional life."
  },
  {
    name: "Brooklyn Rivera",
    age: 34,
    hometown: "Dallas, Texas", 
    occupation: "Business Administrator",
    bio: "Brooklyn is a driven business professional with a competitive spirit. She's determined to outwit and outplay her competition.",
    photo_url: "https://www.goldderby.com/wp-content/uploads/2024/07/big-brother-26-brooklyn-rivera.jpg",
    relationship_status: "Single",
    family_info: "Close with her family",
    personality_traits: ["Ambitious", "Analytical", "Direct", "Competitive"],
    gameplay_strategy: "Stay under the radar initially while building key relationships",
    backstory: "Brooklyn has worked her way up in the business world through determination and strategic thinking."
  },
  {
    name: "Cam Sullivan-Brown",
    age: 25,
    hometown: "Bowie, Maryland",
    occupation: "Physical Therapist",
    bio: "Cam is a physical therapist and former college football player who brings both physical and mental strength to the game.",
    photo_url: "https://www.goldderby.com/wp-content/uploads/2024/07/big-brother-26-cam-sullivan-brown.jpg",
    relationship_status: "Single",
    family_info: "Supported by loving family",
    personality_traits: ["Athletic", "Caring", "Strategic", "Loyal"],
    gameplay_strategy: "Use physical competitions to stay safe while building trust",
    backstory: "Former football player who transitioned to helping others through physical therapy."
  },
  {
    name: "Cedric Hodges",
    age: 21,
    hometown: "Douglasville, Georgia",
    occupation: "Former Marine",
    bio: "Cedric is a young former Marine with discipline, strategy, and leadership skills. He's ready to battle for the crown.",
    photo_url: "https://www.goldderby.com/wp-content/uploads/2024/07/big-brother-26-cedric-hodges.jpg",
    relationship_status: "Single", 
    family_info: "Military family background",
    personality_traits: ["Disciplined", "Strategic", "Leader", "Loyal"],
    gameplay_strategy: "Apply military strategy and discipline to game play",
    backstory: "Served in the Marines and learned valuable leadership and strategic skills."
  },
  {
    name: "Chelsie Baham",
    age: 27,
    hometown: "Rancho Cucamonga, California",
    occupation: "Nonprofit Director",
    bio: "Chelsie runs a nonprofit organization and brings strong leadership and social skills to the Big Brother house.",
    photo_url: "https://www.goldderby.com/wp-content/uploads/2024/07/big-brother-26-chelsie-baham.jpg",
    relationship_status: "Single",
    family_info: "Family-oriented",
    personality_traits: ["Compassionate", "Leader", "Strategic", "Social"],
    gameplay_strategy: "Build genuine connections while making strategic moves",
    backstory: "Dedicated her career to helping others through nonprofit work."
  },
  {
    name: "Joseph Rodriguez",
    age: 30,
    hometown: "Tampa, Florida",
    occupation: "Video Store Clerk",
    bio: "Joseph is a charismatic video store clerk with a passion for entertainment and strategy. He's ready to make big moves.",
    photo_url: "https://media.cbs.com/2024/07/10/bb26-cast-photos-joseph.jpg",
    relationship_status: "Single",
    family_info: "Close-knit family",
    personality_traits: ["Charismatic", "Entertaining", "Strategic", "Friendly"],
    gameplay_strategy: "Use charm and entertainment value to build alliances",
    backstory: "Works at a video store and has studied countless stories and strategies."
  },
  {
    name: "Kimo Apaka",
    age: 35,
    hometown: "Hilo, Hawaii",
    occupation: "Mattress Salesman",
    bio: "Kimo brings island vibes and sales expertise to the game. His laid-back personality masks a competitive spirit.",
    photo_url: "https://media.cbs.com/2024/07/10/bb26-cast-photos-kimo.jpg",
    relationship_status: "Married",
    family_info: "Married with children",
    personality_traits: ["Laid-back", "Sales-savvy", "Competitive", "Family-oriented"],
    gameplay_strategy: "Use sales skills to negotiate and persuade houseguests",
    backstory: "Hawaiian native who uses his sales background to connect with people."
  },
  {
    name: "Leah Peters",
    age: 26,
    hometown: "Miami, Florida",
    occupation: "VIP Cocktail Server",
    bio: "Leah is a VIP cocktail server who knows how to read people and work a room. She's ready to serve up strategy.",
    photo_url: "https://media.cbs.com/2024/07/10/bb26-cast-photos-leah.jpg",
    relationship_status: "Single",
    family_info: "Independent and driven",
    personality_traits: ["Social", "Observant", "Hardworking", "Strategic"],
    gameplay_strategy: "Use people-reading skills to navigate social dynamics",
    backstory: "Works in high-end hospitality and has learned to read people quickly."
  },
  {
    name: "Lisa Weintraub",
    age: 33,
    hometown: "Los Angeles, California", 
    occupation: "Celebrity Chef",
    bio: "Lisa is a celebrity chef who brings creativity, leadership, and competitive fire to the Big Brother kitchen and beyond.",
    photo_url: "https://media.cbs.com/2024/07/10/bb26-cast-photos-lisa.jpg",
    relationship_status: "Married",
    family_info: "Married to supportive spouse",
    personality_traits: ["Creative", "Leader", "Competitive", "Perfectionist"],
    gameplay_strategy: "Take care of houseguests while building strategic relationships",
    backstory: "Built a successful culinary career through hard work and creativity."
  },
  {
    name: "Makensy Manbeck",
    age: 22,
    hometown: "Houston, Texas",
    occupation: "Construction Project Manager",
    bio: "Makensy is a young construction project manager who brings organization, leadership, and determination to the game.",
    photo_url: "https://media.cbs.com/2024/07/10/bb26-cast-photos-makensy.jpg",
    relationship_status: "Single",
    family_info: "Family of hard workers",
    personality_traits: ["Organized", "Leader", "Determined", "Hardworking"],
    gameplay_strategy: "Manage the house dynamics like construction projects",
    backstory: "Young professional who has proven herself in a male-dominated industry."
  },
  {
    name: "Matt Hardeman",
    age: 25,
    hometown: "Roswell, Georgia",
    occupation: "Tech Sales",
    bio: "Matt works in tech sales and brings analytical thinking and persuasion skills to his Big Brother strategy.",
    photo_url: "https://media.cbs.com/2024/07/10/bb26-cast-photos-matt.jpg",
    relationship_status: "Single",
    family_info: "Supportive family",
    personality_traits: ["Analytical", "Persuasive", "Tech-savvy", "Competitive"],
    gameplay_strategy: "Analyze the game like data and make calculated moves",
    backstory: "Works in competitive tech sales environment and understands strategy."
  },
  {
    name: "Quinn Martin",
    age: 25,
    hometown: "Omaha, Nebraska",
    occupation: "Nurse",
    bio: "Quinn is a dedicated nurse who brings caring, analytical thinking, and strategic gameplay to the Big Brother house.",
    photo_url: "https://media.cbs.com/2024/07/10/bb26-cast-photos-quinn.jpg",
    relationship_status: "Single",
    family_info: "Family in healthcare",
    personality_traits: ["Caring", "Analytical", "Strategic", "Hardworking"],
    gameplay_strategy: "Take care of allies while making strategic healthcare decisions",
    backstory: "Dedicated nurse who has learned to make quick, strategic decisions under pressure."
  },
  {
    name: "Rubina Bernabe",
    age: 35,
    hometown: "Los Angeles, California",
    occupation: "Event Planner",
    bio: "Rubina is an event planner who knows how to organize, coordinate, and manage complex social situations.",
    photo_url: "https://media.cbs.com/2024/07/10/bb26-cast-photos-rubina.jpg",
    relationship_status: "Married",
    family_info: "Married with family",
    personality_traits: ["Organized", "Social", "Strategic", "Detail-oriented"],
    gameplay_strategy: "Orchestrate house events and alliances like professional events",
    backstory: "Event planning career has taught her to manage complex social dynamics."
  },
  {
    name: "T'kor Clottey",
    age: 23,
    hometown: "Chicago, Illinois",
    occupation: "Crochet Business Owner",
    bio: "T'kor owns a crochet business and brings creativity, patience, and entrepreneurial spirit to the game.",
    photo_url: "https://media.cbs.com/2024/07/10/bb26-cast-photos-tkor.jpg",
    relationship_status: "Single",
    family_info: "Creative family background",
    personality_traits: ["Creative", "Patient", "Entrepreneurial", "Artistic"],
    gameplay_strategy: "Weave together alliances carefully like crochet work",
    backstory: "Young entrepreneur who built a creative business from scratch."
  },
  {
    name: "Tucker Des Lauriers",
    age: 30,
    hometown: "Boston, Massachusetts",
    occupation: "Marketing Consultant", 
    bio: "Tucker is a marketing consultant who understands branding, strategy, and how to influence people's decisions.",
    photo_url: "https://media.cbs.com/2024/07/10/bb26-cast-photos-tucker.jpg",
    relationship_status: "Single",
    family_info: "Boston-area family",
    personality_traits: ["Strategic", "Influential", "Analytical", "Competitive"],
    gameplay_strategy: "Market himself to different houseguests and build his brand",
    backstory: "Marketing background has taught him how to influence and persuade effectively."
  },
  {
    name: "Kenney Kelley",
    age: 52,
    hometown: "Boston, Massachusetts",
    occupation: "Former Undercover Cop",
    bio: "Kenney is a former undercover cop who brings investigation skills, strategy, and life experience to the game.",
    photo_url: "https://media.cbs.com/2024/07/10/bb26-cast-photos-kenney.jpg",
    relationship_status: "Married",
    family_info: "Law enforcement family",
    personality_traits: ["Investigative", "Strategic", "Experienced", "Observant"],
    gameplay_strategy: "Use investigation and undercover skills to gather information",
    backstory: "Former undercover cop with extensive experience reading people and situations."
  }
];

export const populateSeason26Houseguests = async (poolId: string): Promise<{ success: boolean; count: number; error?: string }> => {
  console.log('🏠 Populating Season 26 houseguests for pool:', poolId);
  
  try {
    // First check if houseguests already exist for this pool
    const { data: existingContestants, error: checkError } = await supabase
      .from('contestants')
      .select('id')
      .eq('pool_id', poolId)
      .limit(1);
    
    if (checkError) throw checkError;
    
    if (existingContestants && existingContestants.length > 0) {
      console.log('🏠 Houseguests already exist for this pool');
      return { success: true, count: 0, error: 'Houseguests already exist for this pool' };
    }
    
    // Get groups for this pool to assign houseguests
    const { data: groups, error: groupsError } = await supabase
      .from('contestant_groups')
      .select('id, group_name, sort_order')
      .eq('pool_id', poolId)
      .order('sort_order', { ascending: true });
    
    if (groupsError) throw groupsError;
    
    if (!groups || groups.length === 0) {
      console.log('🏠 No groups found, creating default groups');
      // Create default groups first
      const defaultGroups = ['Group A', 'Group B', 'Group C', 'Group D'];
      const groupInserts = defaultGroups.map((name, index) => ({
        pool_id: poolId,
        group_name: name,
        sort_order: index + 1
      }));
      
      const { data: newGroups, error: createGroupsError } = await supabase
        .from('contestant_groups')
        .insert(groupInserts)
        .select('id, group_name, sort_order');
      
      if (createGroupsError) throw createGroupsError;
      groups.push(...(newGroups || []));
    }
    
    console.log('🏠 Found groups:', groups.map(g => g.group_name));
    
    // Distribute houseguests across groups
    const houseguestsToInsert = SEASON_26_HOUSEGUESTS.map((hg, index) => {
      const groupIndex = index % groups.length;
      const assignedGroup = groups[groupIndex];
      
      return {
        pool_id: poolId,
        group_id: assignedGroup.id,
        name: hg.name,
        age: hg.age,
        hometown: hg.hometown,
        occupation: hg.occupation,
        bio: hg.bio,
        photo_url: hg.photo_url,
        relationship_status: hg.relationship_status,
        family_info: hg.family_info,
        personality_traits: hg.personality_traits,
        gameplay_strategy: hg.gameplay_strategy,
        backstory: hg.backstory,
        is_active: true,
        season_number: 26,
        sort_order: index + 1,
        ai_generated: false,
        data_source: 'season_26_preset'
      };
    });
    
    console.log('🏠 Inserting', houseguestsToInsert.length, 'houseguests');
    
    const { data: insertedContestants, error: insertError } = await supabase
      .from('contestants')
      .insert(houseguestsToInsert)
      .select('id, name');
    
    if (insertError) throw insertError;
    
    console.log('🏠 Successfully inserted Season 26 houseguests:', insertedContestants?.length || 0);
    
    return { 
      success: true, 
      count: insertedContestants?.length || 0 
    };
    
  } catch (error) {
    console.error('🏠 Error populating Season 26 houseguests:', error);
    return { 
      success: false, 
      count: 0, 
      error: error.message || 'Failed to populate houseguests' 
    };
  }
};