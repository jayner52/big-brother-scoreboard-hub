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
  bio: string;
  relationship_status: string;
  family_info: string;
  physical_description: {
    height: string;
    build: string;
    hair_color: string;
    eye_color: string;
    distinguishing_features: string;
  };
  personality_traits: {
    archetype: string;
    strengths: string[];
    weaknesses: string[];
    catchphrase: string;
    motivation: string;
  };
  gameplay_strategy: {
    alliance_tendency: string;
    competition_strength: string;
    threat_level: number;
    predicted_placement: string;
    strategy_description: string;
  };
  backstory: {
    life_story: string;
    fun_facts: string[];
    hobbies: string[];
    fears: string;
    guilty_pleasure: string;
  };
}

interface GenerationRequest {
  season_number: number;
  season_theme: string;
  season_format: string;
  cast_size: number;
  special_twists: string;
  count: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { season_number, season_theme, season_format, cast_size, special_twists, count = 1 }: GenerationRequest = await req.json();

    const profiles: ContestantProfile[] = [];

    for (let i = 0; i < count; i++) {
      const systemPrompt = `You are an expert Big Brother casting director and reality TV producer. Generate realistic, diverse, and entertaining contestant profiles that would create compelling television. Consider the specified season theme, format, and casting requirements. Ensure each contestant has a unique personality and backstory that would create interesting dynamics in the house.

Return ONLY a valid JSON object with the exact structure requested. Do not include any additional text, explanations, or markdown formatting.`;

      const userPrompt = `Generate a Big Brother contestant profile for Season ${season_number}.

Season Details:
- Season Number: ${season_number}
- Theme: ${season_theme}
- Format: ${season_format}
- Cast Size: ${cast_size}
- Special Twists: ${special_twists}

Create a contestant that would fit this season's theme while being unique and memorable. The contestant should feel like a real person with authentic motivations and flaws.

Return a JSON object with this exact structure:
{
  "name": "Full name",
  "age": 25,
  "hometown": "City, State",
  "occupation": "Job title",
  "bio": "Brief compelling bio (2-3 sentences)",
  "relationship_status": "Single/Married/Dating/etc",
  "family_info": "Brief family background",
  "physical_description": {
    "height": "5'8\"",
    "build": "Athletic/Slim/Average/etc",
    "hair_color": "Brown",
    "eye_color": "Blue",
    "distinguishing_features": "Tattoos, scars, unique features"
  },
  "personality_traits": {
    "archetype": "Villain/Hero/Strategist/etc",
    "strengths": ["trait1", "trait2", "trait3"],
    "weaknesses": ["flaw1", "flaw2", "flaw3"],
    "catchphrase": "Memorable quote",
    "motivation": "Why they want to win"
  },
  "gameplay_strategy": {
    "alliance_tendency": "Loyal/Backstabber/Floater/etc",
    "competition_strength": "Physical/Mental/Social/Balanced",
    "threat_level": 7,
    "predicted_placement": "Early/Mid/Late game",
    "strategy_description": "Detailed gameplay approach"
  },
  "backstory": {
    "life_story": "Brief personal history",
    "fun_facts": ["fact1", "fact2", "fact3"],
    "hobbies": ["hobby1", "hobby2", "hobby3"],
    "fears": "What they're afraid of",
    "guilty_pleasure": "Something they enjoy secretly"
  }
}`;

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
          temperature: 0.8,
          max_tokens: 1500,
          top_p: 0.9,
          frequency_penalty: 0.3,
          presence_penalty: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;
      
      try {
        const profile = JSON.parse(generatedContent);
        profiles.push(profile);
      } catch (parseError) {
        console.error('Failed to parse generated profile:', generatedContent);
        throw new Error('Invalid JSON response from AI');
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      profiles,
      metadata: {
        generated_date: new Date().toISOString(),
        season_context: `Season ${season_number}: ${season_theme}`,
        ai_model_used: 'gpt-4o-mini',
        count: profiles.length
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