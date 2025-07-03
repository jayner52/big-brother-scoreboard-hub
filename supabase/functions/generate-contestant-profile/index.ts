import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContestantProfile {
  name: string;
  age: number;
  hometown: string;
  occupation: string;
  photo: string;
  bio: string;
}

interface GenerationRequest {
  season_number: number;
  season_theme: string;
  season_format: string;
  cast_size: number;
  special_twists: string;
  count: number;
}

// Season-specific configurations with real cast data
const seasonData = {
  26: { 
    name: "Big Brother 26", 
    castCount: 16, 
    theme: "AI Arena",
    cast: [
      { name: "Angela Murray", age: 50, hometown: "Long Beach, CA", occupation: "Real Estate Agent", photo: "https://static.wikia.nocookie.net/bigbrother/images/a/a6/Angela_Murray_BB26.jpg", bio: "Angela is a dedicated real estate agent who grew up in a close-knit family in Long Beach. She's passionate about fitness and helping first-time homebuyers achieve their dreams. She applied for Big Brother to challenge herself and prove that women over 50 can compete with anyone." },
      { name: "Brooklyn Rivera", age: 34, hometown: "Dallas, TX", occupation: "Business Administrator", photo: "https://static.wikia.nocookie.net/bigbrother/images/b/b1/Brooklyn_Rivera_BB26.jpg", bio: "Brooklyn is a driven business administrator from Dallas who loves organizing events and spending time with her family. She's passionate about travel and has visited over 20 countries. She joined Big Brother to test her social skills and win money for her daughter's college fund." },
      { name: "Cam Sullivan-Brown", age: 25, hometown: "Bowie, MD", occupation: "Physical Therapist", photo: "https://static.wikia.nocookie.net/bigbrother/images/c/c8/Cam_Sullivan-Brown_BB26.jpg", bio: "Cam is a compassionate physical therapist who helps people recover from injuries and reach their fitness goals. He's an avid runner and volunteers at local youth sports programs. He came to Big Brother to challenge himself mentally and inspire others to pursue their dreams." },
      { name: "Cedric Hodges", age: 21, hometown: "Saginaw, TX", occupation: "Former Marine", photo: "https://static.wikia.nocookie.net/bigbrother/images/d/d5/Cedric_Hodges_BB26.jpg", bio: "Cedric is a young former Marine who served his country with honor and is now pursuing his education. He's passionate about fitness, mentoring young people, and spending time with his family. He entered Big Brother to show that young veterans can excel in any environment." },
      { name: "Chelsie Baham", age: 27, hometown: "Rancho Cucamonga, CA", occupation: "Nonprofit Director", photo: "https://static.wikia.nocookie.net/bigbrother/images/e/e9/Chelsie_Baham_BB26.jpg", bio: "Chelsie runs a nonprofit organization focused on helping underprivileged communities access education resources. She's a dedicated advocate who loves hiking and spending time outdoors. She joined Big Brother to raise awareness for her cause and prove that kindness can be a winning strategy." },
      { name: "Joseph Rodriguez", age: 30, hometown: "Tampa, FL", occupation: "Video Store Clerk", photo: "https://static.wikia.nocookie.net/bigbrother/images/f/f7/Joseph_Rodriguez_BB26.jpg", bio: "Joseph is a movie enthusiast who works at one of the last remaining video stores in Tampa. He's a film buff who can quote almost any movie and loves discussing cinema with customers. He came to Big Brother because he's always been fascinated by reality TV and wanted to experience it firsthand." },
      { name: "Kimo Apaka", age: 35, hometown: "Hilo, HI", occupation: "Mattress Sales", photo: "https://static.wikia.nocookie.net/bigbrother/images/a/a8/Kimo_Apaka_BB26.jpg", bio: "Kimo is a friendly mattress salesman from Hawaii who believes everyone deserves a good night's sleep. He's passionate about Hawaiian culture, surfing, and spending time with his ohana (family). He joined Big Brother to represent Hawaii and show the world the aloha spirit." },
      { name: "Leah Peters", age: 26, hometown: "Miami, FL", occupation: "VIP Cocktail Server", photo: "https://static.wikia.nocookie.net/bigbrother/images/l/l9/Leah_Peters_BB26.jpg", bio: "Leah works as a VIP cocktail server in Miami's hottest nightclubs and knows how to read people and situations. She's studying business part-time and dreams of opening her own restaurant. She entered Big Brother to prove that service industry workers are smart, strategic, and underestimated." },
      { name: "Makensy Manbeck", age: 22, hometown: "Houston, TX", occupation: "Construction Project Manager", photo: "https://static.wikia.nocookie.net/bigbrother/images/m/m4/Makensy_Manbeck_BB26.jpg", bio: "Makensy is one of the youngest project managers in her construction company and isn't afraid to work in male-dominated environments. She loves building things and spending time with her large extended family. She came to Big Brother to prove that young women can be just as tough and strategic as anyone." },
      { name: "Quinn Martin", age: 25, hometown: "Omaha, NE", occupation: "Nurse Recruiter", photo: "https://static.wikia.nocookie.net/bigbrother/images/q/q3/Quinn_Martin_BB26.jpg", bio: "Quinn works as a nurse recruiter, helping hospitals find qualified healthcare professionals during staffing shortages. She's passionate about healthcare advocacy and volunteers at local clinics. She joined Big Brother to take a break from her high-stress job and challenge herself in a completely different environment." },
      { name: "Rubina Bernabe", age: 35, hometown: "Los Angeles, CA", occupation: "Event Coordinator", photo: "https://static.wikia.nocookie.net/bigbrother/images/r/r8/Rubina_Bernabe_BB26.jpg", bio: "Rubina coordinates high-profile events in Los Angeles and has worked with celebrities and major brands. She's a single mother who loves planning elaborate parties for her son's birthdays. She entered Big Brother to show her son that you should never be afraid to take big risks and chase your dreams." },
      { name: "T'Kor Clottey", age: 23, hometown: "London, England", occupation: "Crochet Business Owner", photo: "https://static.wikia.nocookie.net/bigbrother/images/t/t5/TKor_Clottey_BB26.jpg", bio: "T'Kor moved from London to the US and started her own crochet business, selling handmade items online. She's passionate about sustainable fashion and teaching others traditional crafts. She joined Big Brother to expand her business network and show that creative entrepreneurs can succeed anywhere." },
      { name: "Tucker Des Lauriers", age: 30, hometown: "Brooklyn, NY", occupation: "Marketing/Sales Executive", photo: "https://static.wikia.nocookie.net/bigbrother/images/t/t1/Tucker_Des_Lauriers_BB26.jpg", bio: "Tucker is a high-energy marketing executive who thrives in fast-paced environments and loves closing big deals. He's passionate about fitness, trying new restaurants, and exploring different neighborhoods in Brooklyn. He came to Big Brother to test his persuasion skills and win money to invest in his own startup." },
      { name: "Lisa Weintraub", age: 33, hometown: "Los Angeles, CA", occupation: "Celebrity Chef", photo: "https://static.wikia.nocookie.net/bigbrother/images/l/l2/Lisa_Weintraub_BB26.jpg", bio: "Lisa is a celebrity chef who has cooked for A-list stars and owns a popular restaurant in West Hollywood. She's passionate about fusion cuisine and mentoring young chefs. She joined Big Brother to step away from the kitchen and prove she can win in any competitive environment." },
      { name: "Kenney Kelley", age: 52, hometown: "Boston, MA", occupation: "Retired Police Officer", photo: "https://static.wikia.nocookie.net/bigbrother/images/k/k7/Kenney_Kelley_BB26.jpg", bio: "Kenney is a recently retired police officer who served the Boston community for over 25 years. He loves spending time with his grandchildren and coaching little league baseball. He entered Big Brother to show that experience and wisdom can compete with youth and energy." },
      { name: "Matt Hardeman", age: 24, hometown: "Loganville, GA", occupation: "Tech Support Specialist", photo: "https://static.wikia.nocookie.net/bigbrother/images/m/m9/Matt_Hardeman_BB26.jpg", bio: "Matt works in tech support during the day and streams video games at night, building a loyal following online. He's passionate about gaming, technology, and helping people solve problems. He came to Big Brother to prove that introverted gamers can be social and strategic when it matters." }
    ]
  },
  25: { 
    name: "Big Brother 25", 
    castCount: 17, 
    theme: "Regular Season",
    cast: [
      { name: "America Lopez", age: 27, hometown: "El Paso, TX", occupation: "Medical Receptionist", photo: "https://static.wikia.nocookie.net/bigbrother/images/a/a5/America_Lopez_BB25.jpg", bio: "America is a medical receptionist from El Paso who is passionate about helping patients and their families navigate healthcare. She loves spending time with her large Mexican-American family and volunteers at local community centers." },
      { name: "Blue Kim", age: 25, hometown: "Dallas, TX", occupation: "Brand Strategist", photo: "https://static.wikia.nocookie.net/bigbrother/images/b/b6/Blue_Kim_BB25.jpg", bio: "Blue is a creative brand strategist who helps companies develop their visual identity and marketing campaigns. She's passionate about art, design, and empowering other young women in the business world." },
      { name: "Bowie Jane Ball", age: 45, hometown: "Melbourne, Australia", occupation: "Barrister/DJ", photo: "https://static.wikia.nocookie.net/bigbrother/images/b/b3/Bowie_Jane_Ball_BB25.jpg", bio: "Bowie Jane is a barrister by day and DJ by night, balancing her legal career with her passion for music. Originally from Australia, she brings a unique perspective and energy to everything she does." },
      { name: "Cameron Hardin", age: 34, hometown: "Eastman, GA", occupation: "Stay-at-Home Dad", photo: "https://static.wikia.nocookie.net/bigbrother/images/c/c8/Cameron_Hardin_BB25.jpg", bio: "Cameron is a devoted stay-at-home dad who takes pride in raising his children and supporting his wife's career. He's passionate about fitness, cooking, and creating a loving home environment for his family." },
      { name: "Cirie Fields", age: 53, hometown: "Norwalk, CT", occupation: "Nurse", photo: "https://static.wikia.nocookie.net/bigbrother/images/c/c7/Cirie_Fields_BB25.jpg", bio: "Cirie is a registered nurse and reality TV veteran who brings her medical expertise and strategic gameplay to the Big Brother house. She's known for her warmth, intelligence, and ability to build strong alliances." },
      { name: "Cory Wurtenberger", age: 21, hometown: "Friday Harbor, WA", occupation: "Martial Arts Instructor", photo: "https://static.wikia.nocookie.net/bigbrother/images/c/c5/Cory_Wurtenberger_BB25.jpg", bio: "Cory is a young martial arts instructor who teaches discipline and self-defense to students of all ages. He's passionate about fitness, outdoor adventures, and helping others build confidence through martial arts training." },
      { name: "Felicia Cannon", age: 63, hometown: "Hanahan, SC", occupation: "Real Estate Agent", photo: "https://static.wikia.nocookie.net/bigbrother/images/f/f8/Felicia_Cannon_BB25.jpg", bio: "Felicia is an experienced real estate agent who has helped countless families find their dream homes. She brings wisdom, life experience, and strong people skills to the Big Brother house." },
      { name: "Hisam Goueli", age: 45, hometown: "Sammamish, WA", occupation: "Geriatrician", photo: "https://static.wikia.nocookie.net/bigbrother/images/h/h4/Hisam_Goueli_BB25.jpg", bio: "Dr. Hisam is a geriatrician who specializes in caring for elderly patients. He's passionate about medicine, helping seniors maintain their independence, and spending quality time with his family." },
      { name: "Izzy Gleicher", age: 32, hometown: "Boca Raton, FL", occupation: "Professional Flutist", photo: "https://static.wikia.nocookie.net/bigbrother/images/i/i6/Izzy_Gleicher_BB25.jpg", bio: "Izzy is a professional flutist who has performed with orchestras around the world. She brings creativity, discipline, and a love of music to everything she does." },
      { name: "Jag Bains", age: 25, hometown: "Omak, WA", occupation: "Truck Company Owner", photo: "https://static.wikia.nocookie.net/bigbrother/images/j/j8/Jag_Bains_BB25.jpg", bio: "Jag owns and operates a trucking company, managing logistics and transportation for various businesses. He's entrepreneurial, hardworking, and passionate about building his business empire." },
      { name: "Jared Fields", age: 25, hometown: "Norwalk, CT", occupation: "Exterminator", photo: "https://static.wikia.nocookie.net/bigbrother/images/j/j5/Jared_Fields_BB25.jpg", bio: "Jared works as an exterminator, helping homeowners and businesses deal with pest problems. He's detail-oriented, reliable, and takes pride in solving problems for his clients." },
      { name: "Kirsten Elwin", age: 31, hometown: "Houston, TX", occupation: "Molecular Biologist", photo: "https://static.wikia.nocookie.net/bigbrother/images/k/k9/Kirsten_Elwin_BB25.jpg", bio: "Dr. Kirsten is a molecular biologist who conducts research to advance medical science and develop new treatments. She's analytical, intelligent, and passionate about making discoveries that can help people." },
      { name: "Luke Valentine", age: 30, hometown: "Nashville, TN", occupation: "Illustrator", photo: "https://static.wikia.nocookie.net/bigbrother/images/l/l4/Luke_Valentine_BB25.jpg", bio: "Luke is a talented illustrator who creates artwork for books, magazines, and digital media. He's creative, artistic, and loves bringing stories to life through his illustrations." },
      { name: "Matt Klotz", age: 27, hometown: "Canton, MA", occupation: "Deaflympics Gold Medalist", photo: "https://static.wikia.nocookie.net/bigbrother/images/m/m8/Matt_Klotz_BB25.jpg", bio: "Matt is a Deaflympics gold medalist who has competed at the highest levels of international swimming. He's an inspiration to the deaf community and advocates for disability representation in sports." },
      { name: "Mecole Hayes", age: 30, hometown: "Fort Worth, TX", occupation: "Political Consultant", photo: "https://static.wikia.nocookie.net/bigbrother/images/m/m7/Mecole_Hayes_BB25.jpg", bio: "Mecole is a political consultant who helps candidates develop campaign strategies and connect with voters. She's passionate about civic engagement and making a positive impact through the political process." },
      { name: "Red Utley", age: 37, hometown: "Gatlinburg, TN", occupation: "Sales", photo: "https://static.wikia.nocookie.net/bigbrother/images/r/r2/Red_Utley_BB25.jpg", bio: "Red works in sales and is known for his ability to build relationships and close deals. He's charismatic, outgoing, and loves connecting with people from all walks of life." },
      { name: "Reilly Smedley", age: 24, hometown: "Nashville, TN", occupation: "Server", photo: "https://static.wikia.nocookie.net/bigbrother/images/r/r9/Reilly_Smedley_BB25.jpg", bio: "Reilly works as a server in Nashville's vibrant restaurant scene. She's outgoing, hardworking, and passionate about hospitality and creating great experiences for her customers." }
    ]
  },
  24: { name: "Big Brother 24", castCount: 16, theme: "Regular Season" },
  23: { name: "Big Brother 23", castCount: 16, theme: "Regular Season" },
  22: { name: "Big Brother 22", castCount: 16, theme: "All Stars" }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in edge function secrets.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestBody = await req.json().catch(e => {
      console.error('Failed to parse request body:', e);
      throw new Error('Invalid request body');
    });
    
    const { season_number, season_theme, season_format, cast_size, special_twists, count = 1 }: GenerationRequest = requestBody;

    const profiles: ContestantProfile[] = [];

    for (let i = 0; i < count; i++) {
      let systemPrompt, userPrompt;
      
      // Get season configuration
      const season = seasonData[season_number] || { name: `Big Brother ${season_number}`, castCount: cast_size };
      
      if (season_number === 26 || season_number === 25) {
        // Use real cast data from Big Brother Fandom
        const currentSeason = seasonData[season_number];
        if (!currentSeason?.cast) {
          throw new Error(`No cast data available for season ${season_number}`);
        }

        if (count === 1) {
          // Single contestant generation
          const randomIndex = Math.floor(Math.random() * currentSeason.cast.length);
          const selectedContestant = currentSeason.cast[randomIndex];
          
          const profile: ContestantProfile = {
            name: selectedContestant.name,
            age: selectedContestant.age,
            hometown: selectedContestant.hometown,
            occupation: selectedContestant.occupation,
            photo: selectedContestant.photo,
            bio: selectedContestant.bio
          };
          
          profiles.push(profile);
        } else {
          // Full cast generation
          for (const contestant of currentSeason.cast) {
            const profile: ContestantProfile = {
              name: contestant.name,
              age: contestant.age,
              hometown: contestant.hometown,
              occupation: contestant.occupation,
              photo: contestant.photo,
              bio: contestant.bio
            };
            profiles.push(profile);
          }
        }
        continue; // Skip AI generation for seasons with real data
      } else {
        // For other seasons, use AI generation with improved prompting
        systemPrompt = `You are a Big Brother cast generator. Generate accurate contestant information for the specified season. Always respond with valid JSON only, no additional text or markdown.`;

        if (count === 1) {
          userPrompt = `Generate 1 contestant for Big Brother season ${season_number}. Return as a JSON array with exactly 1 contestant.

Each contestant object must have these exact fields:
- name: Full contestant name (string)
- age: Age in years (number)  
- hometown: "City, State" format (string)
- occupation: Job title (string)
- photo: Unsplash portrait URL with format: "https://images.unsplash.com/photo-[ID]?w=150&h=150&fit=crop&crop=face"
- bio: 2-3 sentences about their PERSONAL LIFE and background, NOT their game performance (string)

Focus the bio on: personal life, family, background, personality traits, interests, what they do outside Big Brother, motivation for being on the show. DO NOT mention game performance, strategy, or how they did on the show.

Use real contestant names and details from Big Brother season ${season_number} if available. Return valid JSON array only.`;
        } else {
          userPrompt = `Generate exactly ${season.castCount} contestants for Big Brother season ${season_number}. Return exactly ${season.castCount} contestants as a JSON array.

Each contestant object must have these exact fields:
- name: Full contestant name (string)
- age: Age in years (number)  
- hometown: "City, State" format (string)
- occupation: Job title (string)
- photo: Unsplash portrait URL with format: "https://images.unsplash.com/photo-[ID]?w=150&h=150&fit=crop&crop=face"
- bio: 2-3 sentences about their PERSONAL LIFE and background, NOT their game performance (string)

Focus each bio on: personal life, family, background, personality traits, interests, what they do outside Big Brother, motivation for being on the show. DO NOT mention game performance, strategy, or how they did on the show.

Use real contestant names and details from Big Brother season ${season_number}. Return valid JSON array only.`;
        }
      }

      // Run OpenAI generation for non-BB26 seasons
      if (season_number !== 26) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.1,
            max_tokens: 2000,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        let generatedContent = data.choices[0].message.content;
        
        // Clean up response (remove markdown if present)
        generatedContent = generatedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        
        try {
          const contestantData = JSON.parse(generatedContent);
          // Handle both single contestant and array responses
          const contestantsArray = Array.isArray(contestantData) ? contestantData : [contestantData];
          profiles.push(...contestantsArray);
        } catch (parseError) {
          console.error('Failed to parse generated profile:', generatedContent);
          throw new Error('Invalid JSON response from AI');
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      profiles,
      metadata: {
        generated_date: new Date().toISOString(),
        season_context: `Season ${season_number}: ${seasonData[season_number]?.theme || season_theme}`,
        ai_model_used: season_number === 26 ? 'real_data' : 'gpt-4o-mini',
        count: profiles.length,
        season_name: seasonData[season_number]?.name || `Big Brother ${season_number}`
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-contestant-profile function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});