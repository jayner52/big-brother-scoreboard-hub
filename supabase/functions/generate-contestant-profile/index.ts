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

// Season-specific configurations
const seasonData = {
  26: { name: "Big Brother 26", castCount: 16, theme: "AI Arena" },
  25: { name: "Big Brother 25", castCount: 17, theme: "Regular Season" },
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
      
      if (season_number === 26) {
        // For BB26, use hardcoded real cast data for full cast generation (exactly 16 contestants)
        const realBB26Cast = [
          { name: "Angela Murray", age: 50, hometown: "Long Beach, CA", occupation: "Real Estate Agent", bio: "Angela is a dedicated real estate agent who grew up in a close-knit family in Long Beach. She's passionate about fitness and helping first-time homebuyers achieve their dreams. She applied for Big Brother to challenge herself and prove that women over 50 can compete with anyone." },
          { name: "Brooklyn Rivera", age: 34, hometown: "Dallas, TX", occupation: "Business Administrator", bio: "Brooklyn is a driven business administrator from Dallas who loves organizing events and spending time with her family. She's passionate about travel and has visited over 20 countries. She joined Big Brother to test her social skills and win money for her daughter's college fund." },
          { name: "Cam Sullivan-Brown", age: 25, hometown: "Bowie, MD", occupation: "Physical Therapist", bio: "Cam is a compassionate physical therapist who helps people recover from injuries and reach their fitness goals. He's an avid runner and volunteers at local youth sports programs. He came to Big Brother to challenge himself mentally and inspire others to pursue their dreams." },
          { name: "Cedric Hodges", age: 21, hometown: "Saginaw, TX", occupation: "Former Marine", bio: "Cedric is a young former Marine who served his country with honor and is now pursuing his education. He's passionate about fitness, mentoring young people, and spending time with his family. He entered Big Brother to show that young veterans can excel in any environment." },
          { name: "Chelsie Baham", age: 27, hometown: "Rancho Cucamonga, CA", occupation: "Nonprofit Director", bio: "Chelsie runs a nonprofit organization focused on helping underprivileged communities access education resources. She's a dedicated advocate who loves hiking and spending time outdoors. She joined Big Brother to raise awareness for her cause and prove that kindness can be a winning strategy." },
          { name: "Joseph Rodriguez", age: 30, hometown: "Tampa, FL", occupation: "Video Store Clerk", bio: "Joseph is a movie enthusiast who works at one of the last remaining video stores in Tampa. He's a film buff who can quote almost any movie and loves discussing cinema with customers. He came to Big Brother because he's always been fascinated by reality TV and wanted to experience it firsthand." },
          { name: "Kimo Apaka", age: 35, hometown: "Hilo, HI", occupation: "Mattress Sales", bio: "Kimo is a friendly mattress salesman from Hawaii who believes everyone deserves a good night's sleep. He's passionate about Hawaiian culture, surfing, and spending time with his ohana (family). He joined Big Brother to represent Hawaii and show the world the aloha spirit." },
          { name: "Leah Peters", age: 26, hometown: "Miami, FL", occupation: "VIP Cocktail Server", bio: "Leah works as a VIP cocktail server in Miami's hottest nightclubs and knows how to read people and situations. She's studying business part-time and dreams of opening her own restaurant. She entered Big Brother to prove that service industry workers are smart, strategic, and underestimated." },
          { name: "Makensy Manbeck", age: 22, hometown: "Houston, TX", occupation: "Construction Project Manager", bio: "Makensy is one of the youngest project managers in her construction company and isn't afraid to work in male-dominated environments. She loves building things and spending time with her large extended family. She came to Big Brother to prove that young women can be just as tough and strategic as anyone." },
          { name: "Quinn Martin", age: 25, hometown: "Omaha, NE", occupation: "Nurse Recruiter", bio: "Quinn works as a nurse recruiter, helping hospitals find qualified healthcare professionals during staffing shortages. She's passionate about healthcare advocacy and volunteers at local clinics. She joined Big Brother to take a break from her high-stress job and challenge herself in a completely different environment." },
          { name: "Rubina Bernabe", age: 35, hometown: "Los Angeles, CA", occupation: "Event Coordinator", bio: "Rubina coordinates high-profile events in Los Angeles and has worked with celebrities and major brands. She's a single mother who loves planning elaborate parties for her son's birthdays. She entered Big Brother to show her son that you should never be afraid to take big risks and chase your dreams." },
          { name: "T'Kor Clottey", age: 23, hometown: "London, England", occupation: "Crochet Business Owner", bio: "T'Kor moved from London to the US and started her own crochet business, selling handmade items online. She's passionate about sustainable fashion and teaching others traditional crafts. She joined Big Brother to expand her business network and show that creative entrepreneurs can succeed anywhere." },
          { name: "Tucker Des Lauriers", age: 30, hometown: "Brooklyn, NY", occupation: "Marketing/Sales Executive", bio: "Tucker is a high-energy marketing executive who thrives in fast-paced environments and loves closing big deals. He's passionate about fitness, trying new restaurants, and exploring different neighborhoods in Brooklyn. He came to Big Brother to test his persuasion skills and win money to invest in his own startup." },
          { name: "Lisa Weintraub", age: 33, hometown: "Los Angeles, CA", occupation: "Celebrity Chef", bio: "Lisa is a celebrity chef who has cooked for A-list stars and owns a popular restaurant in West Hollywood. She's passionate about fusion cuisine and mentoring young chefs. She joined Big Brother to step away from the kitchen and prove she can win in any competitive environment." },
          { name: "Kenney Kelley", age: 52, hometown: "Boston, MA", occupation: "Retired Police Officer", bio: "Kenney is a recently retired police officer who served the Boston community for over 25 years. He loves spending time with his grandchildren and coaching little league baseball. He entered Big Brother to show that experience and wisdom can compete with youth and energy." },
          { name: "Matt Hardeman", age: 24, hometown: "Loganville, GA", occupation: "Tech Support Specialist", bio: "Matt works in tech support during the day and streams video games at night, building a loyal following online. He's passionate about gaming, technology, and helping people solve problems. He came to Big Brother to prove that introverted gamers can be social and strategic when it matters." }
        ];

        if (count === 1) {
          // Single contestant generation
          const randomIndex = Math.floor(Math.random() * realBB26Cast.length);
          const selectedContestant = realBB26Cast[randomIndex];
          
          const profile: ContestantProfile = {
            name: selectedContestant.name,
            age: selectedContestant.age,
            hometown: selectedContestant.hometown,
            occupation: selectedContestant.occupation,
            photo: `https://images.unsplash.com/photo-${Math.random().toString(36).substr(2, 9)}?w=150&h=150&fit=crop&crop=face`,
            bio: selectedContestant.bio
          };
          
          profiles.push(profile);
        } else {
          // Full cast generation
          for (const contestant of realBB26Cast) {
            const profile: ContestantProfile = {
              name: contestant.name,
              age: contestant.age,
              hometown: contestant.hometown,
              occupation: contestant.occupation,
              photo: `https://images.unsplash.com/photo-${Math.random().toString(36).substr(2, 9)}?w=150&h=150&fit=crop&crop=face`,
              bio: contestant.bio
            };
            profiles.push(profile);
          }
        }
        continue; // Skip AI generation for BB26
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