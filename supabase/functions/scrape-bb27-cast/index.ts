import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContestantData {
  name: string;
  age: number;
  location: string;
  occupation: string;
  bio: string;
  imageUrl: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🏠 Loading Big Brother 27 fixed cast data...');
    
    // Fixed Season 27 cast data - no more dynamic scraping
    const bb27FixedCast: ContestantData[] = [
      {
        name: "Adrian Rocha",
        age: 23,
        location: "San Antonio, TX",
        occupation: "Carpenter",
        bio: "A skilled carpenter from San Antonio who has been training extensively for Big Brother, building his own competition setups and studying social psychology to become the greatest player of all time.",
        imageUrl: "https://www.cbs.com/shows/big_brother/cast/adrian-rocha/"
      },
      {
        name: "Amy Bingham",
        age: 43,
        location: "Stockton, CA",
        occupation: "Insurance Agent",
        bio: "An insurance agent from California bringing maturity and life experience to the game, ready to navigate the social dynamics of the Big Brother house.",
        imageUrl: "https://www.cbs.com/shows/big_brother/cast/amy-bingham/"
      },
      {
        name: "Ava Pearl",
        age: 24,
        location: "New York, NY",
        occupation: "Aura Painter",
        bio: "A creative aura painter from New York City who brings unique perspective and artistic energy to the house, ready to read the competition in more ways than one.",
        imageUrl: "https://www.cbs.com/shows/big_brother/cast/ava-pearl/"
      },
      {
        name: "Ashley Hollis",
        age: 25,
        location: "New York, NY",
        occupation: "Attorney",
        bio: "A sharp attorney from Chicago now living in New York, bringing legal strategy and analytical thinking to the Big Brother game.",
        imageUrl: "https://www.cbs.com/shows/big_brother/cast/ashley-hollis/"
      },
      {
        name: "Cliffton \"Will\" Williams",
        age: 50,
        location: "Charlotte, NC",
        occupation: "College Sports Podcaster",
        bio: "A 22-year Army veteran and college sports podcaster who brings energy, joy, and life experience as 'Captain Will' with five kids and nine grandkids.",
        imageUrl: "https://www.cbs.com/shows/big_brother/cast/will-williams/"
      },
      {
        name: "Isaiah \"Zae\" Frederich",
        age: 23,
        location: "Provo, UT",
        occupation: "Salesperson",
        bio: "A young salesperson from Kentucky now living in Utah, ready to use his sales skills to navigate the social game of Big Brother.",
        imageUrl: "https://www.cbs.com/shows/big_brother/cast/zae-frederich/"
      },
      {
        name: "Jimmy Heagerty",
        age: 25,
        location: "Washington, DC",
        occupation: "AI Consultant",
        bio: "An AI consultant from DC who brings tech-savvy strategy to the game, ready to analyze and adapt to any situation in the Big Brother house.",
        imageUrl: "https://www.cbs.com/shows/big_brother/cast/jimmy-heagerty/"
      },
      {
        name: "Katherine Woodman",
        age: 23,
        location: "Columbia, SC",
        occupation: "Fine Dining Server",
        bio: "A fine dining server from Georgia who knows how to read people and serve up strategy, ready to play a strong social game.",
        imageUrl: "https://www.cbs.com/shows/big_brother/cast/katherine-woodman/"
      },
      {
        name: "Keanu Soto",
        age: 33,
        location: "McKinney, TX",
        occupation: "Personal Trainer/Dungeon Master",
        bio: "A personal trainer and dungeon master from Texas who brings both physical prowess and strategic gameplay from his D&D experience.",
        imageUrl: "https://www.cbs.com/shows/big_brother/cast/keanu-soto/"
      },
      {
        name: "Lance Rylie",
        age: 29,
        location: "Burbank, SD",
        occupation: "Web Designer",
        bio: "A web designer from South Dakota who brings technical skills and creative problem-solving to the Big Brother competition.",
        imageUrl: "https://www.cbs.com/shows/big_brother/cast/lance-rylie/"
      },
      {
        name: "Madison Ivy",
        age: 22,
        location: "Lafayette, LA",
        occupation: "Bridal Consultant",
        bio: "The youngest houseguest at 22, a bridal consultant from Louisiana ready to say 'I do' to winning the $750,000 grand prize.",
        imageUrl: "https://www.cbs.com/shows/big_brother/cast/madison-ivy/"
      },
      {
        name: "Rylie Jeffries",
        age: 27,
        location: "Luther, OK",
        occupation: "Professional Bull Rider",
        bio: "A professional bull rider from Oklahoma who's used to holding on for dear life and ready to ride out any storm in the Big Brother house.",
        imageUrl: "https://www.cbs.com/shows/big_brother/cast/rylie-jeffries/"
      },
      {
        name: "Serenity Mason",
        age: 27,
        location: "Cartersville, GA",
        occupation: "Marketing Manager",
        bio: "A marketing manager from Georgia who knows how to sell herself and her ideas, ready to market her way to the final two.",
        imageUrl: "https://www.cbs.com/shows/big_brother/cast/serenity-mason/"
      },
      {
        name: "Tiffany Johnson",
        age: 35,
        location: "Atlanta, GA",
        occupation: "Event Curator",
        bio: "An event curator from Atlanta who knows how to plan and execute, ready to orchestrate her way through the Big Brother game.",
        imageUrl: "https://www.cbs.com/shows/big_brother/cast/tiffany-johnson/"
      },
      {
        name: "Vince Panaro",
        age: 32,
        location: "New York, NY",
        occupation: "Gamer",
        bio: "A professional gamer from New York who brings competitive gaming strategy and quick reflexes to the Big Brother competition.",
        imageUrl: "https://www.cbs.com/shows/big_brother/cast/vince-panaro/"
      },
      {
        name: "Zach Cornell",
        age: 28,
        location: "Houston, TX",
        occupation: "Former Professional Baseball Player",
        bio: "A former professional baseball player who's ready to hit a home run in the Big Brother house with his competitive spirit and athletic prowess.",
        imageUrl: "https://www.cbs.com/shows/big_brother/cast/zach-cornell/"
      },
      {
        name: "Mystery Houseguest",
        age: 0,
        location: "Unknown",
        occupation: "To Be Revealed",
        bio: "The 17th houseguest whose identity remains a mystery. Will be revealed during the premiere episode on July 10, 2025.",
        imageUrl: "https://www.cbs.com/shows/big_brother/mystery-houseguest/"
      }
    ];

    console.log(`✅ Loaded ${bb27FixedCast.length} Big Brother 27 contestants from fixed data`);
    
    // Log each contestant for verification
    bb27FixedCast.forEach((contestant, index) => {
      console.log(`${index + 1}. ${contestant.name} (${contestant.age}) - ${contestant.occupation} from ${contestant.location}`);
    });

    return new Response(
      JSON.stringify({
        success: true,
        contestants: bb27FixedCast,
        metadata: {
          season: 27,
          source: 'fixed_xml_cast_data',
          scraped_at: new Date().toISOString(),
          total_contestants: bb27FixedCast.length,
          scraping_method: 'fixed_data_no_ai'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Error scraping BB27 cast:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        metadata: {
          error_type: 'scraping_error',
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function parseContestantsFromXML(xmlContent: string): ContestantData[] {
  const contestants: ContestantData[] = [];
  
  try {
    // Clean up the XML content
    const cleanXml = xmlContent.trim();
    
    // Extract contestants using regex patterns
    const contestantMatches = cleanXml.matchAll(/<contestant>(.*?)<\/contestant>/gs);
    
    for (const match of contestantMatches) {
      const contestantXml = match[1];
      
      const name = extractXMLValue(contestantXml, 'name');
      const ageStr = extractXMLValue(contestantXml, 'age');
      const location = extractXMLValue(contestantXml, 'location');
      const occupation = extractXMLValue(contestantXml, 'occupation');
      const bio = extractXMLValue(contestantXml, 'bio');
      const imageUrl = extractXMLValue(contestantXml, 'imageUrl');
      
      if (name && ageStr && location && occupation) {
        const age = parseInt(ageStr);
        if (!isNaN(age)) {
          contestants.push({
            name: name.trim(),
            age,
            location: location.trim(),
            occupation: occupation.trim(),
            bio: bio ? bio.trim() : `${name} is a ${age}-year-old ${occupation} from ${location} competing on Big Brother 27.`,
            imageUrl: imageUrl || 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=300&fit=crop&crop=face'
          });
        }
      }
    }
    
  } catch (error) {
    console.error('Error parsing XML:', error);
  }
  
  return contestants;
}

function extractXMLValue(xml: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}>(.*?)<\/${tagName}>`, 's');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}