import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { week, season, confidence_threshold } = await req.json();
    console.log(`AI Populate request for week ${week}, season ${season}`);

    // Get current contestants from database
    const { data: contestants, error: contestantsError } = await supabase
      .from('contestants')
      .select('name, is_active')
      .eq('is_active', true);

    if (contestantsError) {
      throw new Error(`Failed to fetch contestants: ${contestantsError.message}`);
    }

    const contestantNames = contestants?.map(c => c.name) || [];
    console.log(`Found ${contestantNames.length} active contestants`);

    // Scrape Big Brother data from multiple sources
    const bbData = await scrapeAndAnalyzeBBData(week, season, contestantNames);
    console.log(`Scraped data from ${bbData.length} sources`);

    // AI analysis with confidence scoring
    const aiAnalysis = await analyzeWithAI(bbData, confidence_threshold, contestantNames);
    console.log('AI analysis completed');

    return new Response(JSON.stringify({
      success: true,
      populated_fields: {
        hoh_winner: aiAnalysis.hoh_winner?.name || null,
        pov_winner: aiAnalysis.pov_winner?.name || null,
        evicted: aiAnalysis.evicted?.name || null,
        nominees: aiAnalysis.nominees || [],
        special_events: aiAnalysis.special_events || []
      },
      confidence_scores: {
        hoh_winner: aiAnalysis.hoh_winner?.confidence || 0,
        pov_winner: aiAnalysis.pov_winner?.confidence || 0,
        evicted: aiAnalysis.evicted?.confidence || 0,
        nominees: aiAnalysis.nominees_confidence || 0
      },
      sources_used: aiAnalysis.sources || [],
      message: `Successfully analyzed data from ${bbData.length} sources`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in bb-ai-populate function:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to populate Big Brother data',
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Data Scraping Function
async function scrapeAndAnalyzeBBData(week: number, season: string, contestantNames: string[]) {
  const sources = [];
  
  try {
    // Reddit Big Brother scraping
    console.log('Scraping Reddit Big Brother data...');
    const redditData = await scrapeRedditBB(week, season);
    sources.push(...redditData);
  } catch (error) {
    console.error('Reddit scraping failed:', error);
  }

  try {
    // Big Brother Fandom wiki
    console.log('Scraping BB Fandom data...');
    const fandomData = await scrapeBBFandom(week, season);
    sources.push(...fandomData);
  } catch (error) {
    console.error('Fandom scraping failed:', error);
  }

  try {
    // Live feed updates (Hamsterwatch style sites)
    console.log('Scraping live feed updates...');
    const liveFeedData = await scrapeLiveFeedUpdates(week, season);
    sources.push(...liveFeedData);
  } catch (error) {
    console.error('Live feed scraping failed:', error);
  }

  return sources;
}

// Reddit scraping function
async function scrapeRedditBB(week: number, season: string) {
  const sources = [];
  const subreddits = ['BigBrother', 'BigBrother26'];
  
  for (const subreddit of subreddits) {
    try {
      const response = await fetch(`https://www.reddit.com/r/${subreddit}/search.json?q=week+${week}+HOH+eviction&sort=new&limit=10`, {
        headers: {
          'User-Agent': 'BigBrotherBot/1.0'
        }
      });
      
      if (!response.ok) continue;
      
      const data = await response.json();
      const posts = data.data?.children || [];
      
      for (const post of posts) {
        const postData = post.data;
        sources.push({
          source: `Reddit r/${subreddit}`,
          title: postData.title,
          content: postData.selftext || '',
          url: `https://reddit.com${postData.permalink}`,
          score: postData.score,
          created: new Date(postData.created_utc * 1000).toISOString()
        });
      }
    } catch (error) {
      console.error(`Reddit scraping failed for r/${subreddit}:`, error);
    }
  }
  
  return sources;
}

// Big Brother Fandom wiki scraping
async function scrapeBBFandom(week: number, season: string) {
  const sources = [];
  
  try {
    // Try to get the specific week page
    const wikis = [
      `https://bigbrother.fandom.com/wiki/Big_Brother_26/Week_${week}`,
      `https://bigbrother.fandom.com/wiki/Big_Brother_(American_season_26)`,
      `https://bigbrother.fandom.com/wiki/Big_Brother_26`
    ];
    
    for (const url of wikis) {
      try {
        const response = await fetch(url);
        if (!response.ok) continue;
        
        const html = await response.text();
        
        // Extract relevant text content
        const textContent = html
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/<style[^>]*>.*?<\/style>/gi, '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        sources.push({
          source: 'Big Brother Fandom Wiki',
          content: textContent.substring(0, 5000), // Limit content length
          url: url,
          created: new Date().toISOString()
        });
        
        break; // Stop after first successful fetch
      } catch (error) {
        console.error(`Fandom scraping failed for ${url}:`, error);
      }
    }
  } catch (error) {
    console.error('Fandom scraping failed:', error);
  }
  
  return sources;
}

// Live feed updates scraping
async function scrapeLiveFeedUpdates(week: number, season: string) {
  const sources = [];
  
  try {
    // Try multiple Big Brother update sites
    const sites = [
      'https://twitter.com/search?q=big%20brother%2026%20week%20' + week,
      'https://www.onlinebigbrother.com/',
    ];
    
    for (const url of sites) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (!response.ok) continue;
        
        const html = await response.text();
        const textContent = html
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/<style[^>]*>.*?<\/style>/gi, '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        sources.push({
          source: 'Live Feed Updates',
          content: textContent.substring(0, 3000),
          url: url,
          created: new Date().toISOString()
        });
        
      } catch (error) {
        console.error(`Live feed scraping failed for ${url}:`, error);
      }
    }
  } catch (error) {
    console.error('Live feed scraping failed:', error);
  }
  
  return sources;
}

// AI Analysis Function
async function analyzeWithAI(bbData: any[], threshold: number, contestantNames: string[]) {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `
    You are an expert Big Brother analyst. Analyze the following scraped Big Brother data and extract competition results with confidence scores.
    Only return results where confidence >= ${threshold}.
    
    Valid contestant names: ${contestantNames.join(', ')}
    
    Data sources: ${JSON.stringify(bbData, null, 2)}
    
    Based on this data, extract:
    1. Head of Household (HOH) winner
    2. Power of Veto (POV) winner  
    3. Nominees for eviction
    4. Evicted contestant
    5. Any special events
    
    Return ONLY valid JSON in this exact format (no other text):
    {
      "hoh_winner": {"name": "exact_contestant_name", "confidence": 0.95},
      "pov_winner": {"name": "exact_contestant_name", "confidence": 0.96},
      "nominees": ["name1", "name2"],
      "nominees_confidence": 0.94,
      "evicted": {"name": "exact_contestant_name", "confidence": 0.97},
      "special_events": ["event1", "event2"],
      "sources": ["source1", "source2"]
    }
    
    Important rules:
    - Use EXACT contestant names from the valid list
    - Set confidence to 0 if information is unclear or missing
    - Only include results with confidence >= ${threshold}
    - If a field has low confidence, set it to null or empty array
  `;
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a Big Brother competition results analyzer. Return only valid JSON responses.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid JSON response from AI');
    }
    
  } catch (error) {
    console.error('AI analysis failed:', error);
    throw error;
  }
}