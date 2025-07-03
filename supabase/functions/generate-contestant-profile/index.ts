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
        // For BB26, use hardcoded real cast data for full cast generation
        const realBB26Cast = [
          { name: "Angela Murray", age: 50, hometown: "Long Beach, CA", occupation: "Real Estate Agent" },
          { name: "Brooklyn Rivera", age: 34, hometown: "Dallas, TX", occupation: "Business Administrator" },
          { name: "Cam Sullivan-Brown", age: 25, hometown: "Bowie, MD", occupation: "Physical Therapist" },
          { name: "Cedric Hodges", age: 21, hometown: "Saginaw, TX", occupation: "Former Marine" },
          { name: "Chelsie Baham", age: 27, hometown: "Rancho Cucamonga, CA", occupation: "Nonprofit Director" },
          { name: "Joseph Rodriguez", age: 30, hometown: "Tampa, FL", occupation: "Video Store Clerk" },
          { name: "Kimo Apaka", age: 35, hometown: "Hilo, HI", occupation: "Mattress Sales" },
          { name: "Leah Peters", age: 26, hometown: "Miami, FL", occupation: "VIP Cocktail Server" },
          { name: "Makensy Manbeck", age: 22, hometown: "Houston, TX", occupation: "Construction Project Manager" },
          { name: "Quinn Martin", age: 25, hometown: "Omaha, NE", occupation: "Nurse Recruiter" },
          { name: "Rubina Bernabe", age: 35, hometown: "Los Angeles, CA", occupation: "Event Coordinator" },
          { name: "T'Kor Clottey", age: 23, hometown: "London, England", occupation: "Crochet Business Owner" },
          { name: "Tucker Des Lauriers", age: 30, hometown: "Brooklyn, NY", occupation: "Marketing/Sales Executive" }
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
            bio: `${selectedContestant.name} brought strategic gameplay and strong social connections to Big Brother 26.`
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
              bio: `${contestant.name} brought their unique perspective and strategic gameplay to Big Brother 26.`
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
- bio: 2-3 sentences about their personality and game strategy (string)

Use real contestant names and details from Big Brother season ${season_number} if available. Return valid JSON array only.`;
        } else {
          userPrompt = `Generate the complete cast for Big Brother season ${season_number}. Return exactly ${season.castCount} contestants as a JSON array.

Each contestant object must have these exact fields:
- name: Full contestant name (string)
- age: Age in years (number)  
- hometown: "City, State" format (string)
- occupation: Job title (string)
- photo: Unsplash portrait URL with format: "https://images.unsplash.com/photo-[ID]?w=150&h=150&fit=crop&crop=face"
- bio: 2-3 sentences about their personality and game strategy (string)

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