import { ContestantProfile } from './types.ts';
import { scrapeGoldDerbyGallery } from './photo-scraper.ts';
import { delay } from './utils.ts';

// Use the known Big Brother 26 cast list
export async function scrapeBB26CastList(): Promise<string[]> {
  console.log('🔍 Using known Big Brother 26 cast list...');
  
  // The actual Big Brother 26 contestants - all 16 houseguests
  const bb26Cast = [
    "Angela Murray", "Brooklyn Rivera", "Cam Sullivan-Brown", "Cedric Hodges", 
    "Chelsie Baham", "Joseph Rodriguez", "Kimo Apaka", "Leah Peters", 
    "Makensy Manbeck", "Quinn Martin", "Rubina Bernabe", "T'Kor Clottey", 
    "Tucker Des Lauriers", "Lisa Weintraub", "Kenney Kelley", "Matt Hardeman"
  ];
  
  console.log(`📊 Processing ${bb26Cast.length} Big Brother 26 contestants`);
  
  // Log each contestant for verification
  bb26Cast.forEach((name, index) => {
    console.log(`${index + 1}. ${name}`);
  });
  
  return bb26Cast;
}

// Get contestant details from known Big Brother 26 data
export function getContestantDetails(name: string): Partial<ContestantProfile> {
  console.log(`📋 Getting details for ${name}...`);
  
  // Known Big Brother 26 contestant data
  const bb26Data: Record<string, Partial<ContestantProfile>> = {
    "Angela Murray": {
      name: "Angela Murray",
      age: 50,
      hometown: "Syracuse, UT",
      occupation: "Real Estate Agent",
      bio: "Angela Murray is a 50-year-old real estate agent from Syracuse, UT. She's a mother and grandmother who brings life experience to the Big Brother house."
    },
    "Brooklyn Rivera": {
      name: "Brooklyn Rivera", 
      age: 34,
      hometown: "Dallas, TX",
      occupation: "Business Administrator",
      bio: "Brooklyn Rivera is a 34-year-old business administrator from Dallas, TX. She's strategic and competitive with a strong business background."
    },
    "Cam Sullivan-Brown": {
      name: "Cam Sullivan-Brown",
      age: 25,
      hometown: "Bowie, MD", 
      occupation: "Physical Therapist",
      bio: "Cam Sullivan-Brown is a 25-year-old physical therapist from Bowie, MD. He's athletic and brings a competitive spirit to the game."
    },
    "Cedric Hodges": {
      name: "Cedric Hodges",
      age: 21,
      hometown: "Northridge, CA",
      occupation: "Former Marine",
      bio: "Cedric Hodges is a 21-year-old former Marine from Northridge, CA. He brings military discipline and strategic thinking to the house."
    },
    "Chelsie Baham": {
      name: "Chelsie Baham",
      age: 27,
      hometown: "Rancho Cucamonga, CA",
      occupation: "Nonprofit Director",
      bio: "Chelsie Baham is a 27-year-old nonprofit director from Rancho Cucamonga, CA. She's passionate about helping others and strategic gameplay."
    },
    "Joseph Rodriguez": {
      name: "Joseph Rodriguez",
      age: 30,
      hometown: "Tampa, FL",
      occupation: "Video Store Clerk",
      bio: "Joseph Rodriguez is a 30-year-old video store clerk from Tampa, FL. He's a film enthusiast with a laid-back personality."
    },
    "Kimo Apaka": {
      name: "Kimo Apaka",
      age: 35,
      hometown: "Hilo, HI",
      occupation: "Mattress Salesman",
      bio: "Kimo Apaka is a 35-year-old mattress salesman from Hilo, HI. He brings island vibes and a relaxed approach to the game."
    },
    "Leah Peters": {
      name: "Leah Peters",
      age: 26,
      hometown: "Miami, FL",
      occupation: "VIP Cocktail Server",
      bio: "Leah Peters is a 26-year-old VIP cocktail server from Miami, FL. She's social and knows how to work a room."
    },
    "Makensy Manbeck": {
      name: "Makensy Manbeck",
      age: 22,
      hometown: "Houston, TX",
      occupation: "Construction Project Manager",
      bio: "Makensy Manbeck is a 22-year-old construction project manager from Houston, TX. She's young but brings leadership skills to the house."
    },
    "Quinn Martin": {
      name: "Quinn Martin",
      age: 25,
      hometown: "Omaha, NE",
      occupation: "Nurse Recruiter",
      bio: "Quinn Martin is a 25-year-old nurse recruiter from Omaha, NE. He understands people and knows how to build relationships."
    },
    "Rubina Bernabe": {
      name: "Rubina Bernabe",
      age: 35,
      hometown: "Los Angeles, CA",
      occupation: "Event Bartender",
      bio: "Rubina Bernabe is a 35-year-old event bartender from Los Angeles, CA. She's experienced in reading people and social dynamics."
    },
    "T'Kor Clottey": {
      name: "T'Kor Clottey",
      age: 23,
      hometown: "Chicago, IL",
      occupation: "Crochet Business Owner",
      bio: "T'Kor Clottey is a 23-year-old crochet business owner from Chicago, IL. She's creative and entrepreneurial with a unique perspective."
    },
    "Tucker Des Lauriers": {
      name: "Tucker Des Lauriers",
      age: 30,
      hometown: "Brooklyn, NY",
      occupation: "Marketing/Sales Executive",
      bio: "Tucker Des Lauriers is a 30-year-old marketing/sales executive from Brooklyn, NY. He's charismatic and knows how to sell his ideas."
    },
    "Lisa Weintraub": {
      name: "Lisa Weintraub",
      age: 33,
      hometown: "Los Angeles, CA",
      occupation: "Celebrity Chef",
      bio: "Lisa Weintraub is a 33-year-old celebrity chef from Los Angeles, CA. She's used to high-pressure environments and competitive situations."
    },
    "Kenney Kelley": {
      name: "Kenney Kelley",
      age: 52,
      hometown: "Boston, MA",
      occupation: "Former Undercover Cop",
      bio: "Kenney Kelley is a 52-year-old former undercover cop from Boston, MA. He brings investigative skills and street smarts to the game."
    },
    "Matt Hardeman": {
      name: "Matt Hardeman",
      age: 25,
      hometown: "Loganville, GA",
      occupation: "Tech Sales Rep",
      bio: "Matt Hardeman is a 25-year-old tech sales rep from Loganville, GA. He's young, ambitious, and knows how to close deals."
    }
  };
  
  const details = bb26Data[name];
  if (details) {
    console.log(`✅ Found details for ${name}: Age ${details.age}, ${details.hometown}, ${details.occupation}`);
    return details;
  }
  
  // Fallback for any missing contestants
  console.log(`⚠️  Using default details for ${name}`);
  return {
    name: name,
    age: 25,
    hometown: "Unknown",
    occupation: "Unknown",
    bio: `${name} is a contestant on Big Brother 26.`
  };
}

// Scrape Big Brother contestant data for Season 26+
export async function scrapeContestantData(seasonNumber: number): Promise<ContestantProfile[]> {
  console.log(`🔍 Starting comprehensive data processing for Big Brother Season ${seasonNumber}...`);
  
  if (seasonNumber < 26) {
    throw new Error(`Season ${seasonNumber} is not supported. Only Season 26+ contestants are processed.`);
  }
  
  // Handle Season 27 via Parade scraping
  if (seasonNumber === 27) {
    console.log('📋 Processing Season 27 via Parade website scraping...');
    return await scrapeBB27CastFromParade();
  }
  
  // For Season 26, process the complete cast list
  if (seasonNumber === 26) {
    console.log('📋 Starting comprehensive Season 26 cast processing...');
    
    // Step 1: Get the full cast list
    const contestantNames = await scrapeBB26CastList();
    console.log(`📊 Processing ${contestantNames.length} contestants...`);
    
    if (contestantNames.length === 0) {
      throw new Error('No contestants found in cast list');
    }
    
    // Step 2: Get contestant photos from GoldDerby
    console.log('🖼️  Fetching photos from GoldDerby gallery...');
    const photoMap = await scrapeGoldDerbyGallery();
    
    // Step 3: Process each contestant individually
    const scrapedCast: ContestantProfile[] = [];
    let imageSuccessCount = 0;
    let imageFailureCount = 0;
    let detailsSuccessCount = 0;
    
    for (let i = 0; i < contestantNames.length; i++) {
      const contestantName = contestantNames[i];
      console.log(`\n🔄 [${i + 1}/${contestantNames.length}] Processing ${contestantName}...`);
      
      // Get contestant details from known data
      const contestantDetails = getContestantDetails(contestantName);
      if (contestantDetails.hometown !== "Unknown") {
        detailsSuccessCount++;
      }
      
      // Use GoldDerby photo if available, otherwise fallback to placeholder
      let finalPhotoUrl = photoMap[contestantName];
      if (finalPhotoUrl) {
        console.log(`✅ Using GoldDerby photo for ${contestantName}: ${finalPhotoUrl}`);
        imageSuccessCount++;
      } else {
        finalPhotoUrl = 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=300&fit=crop&crop=face';
        console.log(`⚠️  No GoldDerby photo found for ${contestantName}, using placeholder`);
        imageFailureCount++;
      }
      
      scrapedCast.push({
        name: contestantDetails.name || contestantName,
        age: contestantDetails.age || 25,
        hometown: contestantDetails.hometown || "Unknown",
        occupation: contestantDetails.occupation || "Unknown",
        bio: contestantDetails.bio || `${contestantName} is a contestant on Big Brother 26.`,
        photo: finalPhotoUrl
      });
      
      // Small delay to be respectful
      await delay(100);
    }
    
    console.log(`\n📊 Season 26 processing complete!`);
    console.log(`📸 Images: ${imageSuccessCount} success, ${imageFailureCount} failed`);
    console.log(`📋 Details: ${detailsSuccessCount} success, ${contestantNames.length - detailsSuccessCount} used defaults`);
    console.log(`✅ Total contestants processed: ${scrapedCast.length}`);
    
    return scrapedCast;
  }
  
  throw new Error(`Season ${seasonNumber} processing not yet implemented. Only Seasons 26 and 27 are currently supported.`);
}

// Scrape Big Brother 27 cast from Parade website
async function scrapeBB27CastFromParade(): Promise<ContestantProfile[]> {
  console.log('🔍 Fetching BB27 cast from Parade via scraping function...');
  
  try {
    // Get Supabase URL for the edge function call
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    if (!supabaseUrl) {
      throw new Error('Supabase URL not configured');
    }
    
    // Call our BB27 scraping edge function
    const response = await fetch(`${supabaseUrl}/functions/v1/scrape-bb27-cast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({})
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch BB27 cast: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`BB27 scraping failed: ${data.error}`);
    }
    
    const contestants = data.contestants || [];
    console.log(`✅ Successfully loaded ${contestants.length} BB27 contestants from Parade`);
    
    // Convert to ContestantProfile format
    return contestants.map((contestant: any) => ({
      name: contestant.name,
      age: contestant.age,
      hometown: contestant.location,
      occupation: contestant.occupation,
      bio: contestant.bio,
      photo: contestant.imageUrl
    }));
    
  } catch (error) {
    console.error('❌ Error fetching BB27 cast from Parade:', error);
    throw new Error(`Failed to load Big Brother 27 cast: ${error.message}`);
  }
}