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
    console.log('🔍 Starting Big Brother 27 cast scraping from Parade...');
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Use GPT-4 to scrape the Parade page for BB27 cast
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a web scraper that extracts Big Brother 27 cast information. Visit the URL and return contestant data in the exact XML format requested. Be precise with names, ages, locations, occupations, bios, and image URLs.`
          },
          {
            role: 'user',
            content: `Scrape the Parade page at: https://parade.com/tv/big-brother-27-cast-photos-interview-2025 and return a complete <contestants> list in XML, where each <contestant> includes: <name>, <age>, <location>, <occupation>, <bio>, and <imageUrl> (direct link to their headshot). Format precisely like:

<contestants>
  <contestant>
    <name>Jane Doe</name>
    <age>24</age>
    <location>Chicago, IL</location>
    <occupation>Barista</occupation>
    <bio>Short 1–2 sentence bio about their background and strategy.</bio>
    <imageUrl>https://example.com/jane.jpg</imageUrl>
  </contestant>
  <!-- more contestants -->
</contestants>

Return ONLY the XML, no other text.`
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const xmlContent = data.choices[0].message.content;
    
    console.log('📋 Raw XML response:', xmlContent);

    // Parse the XML response to extract contestant data
    const contestants = parseContestantsFromXML(xmlContent);
    
    if (contestants.length === 0) {
      throw new Error('No contestants found in the parsed XML');
    }

    console.log(`✅ Successfully parsed ${contestants.length} Big Brother 27 contestants`);
    
    // Log each contestant for verification
    contestants.forEach((contestant, index) => {
      console.log(`${index + 1}. ${contestant.name} (${contestant.age}) - ${contestant.occupation} from ${contestant.location}`);
    });

    return new Response(
      JSON.stringify({
        success: true,
        contestants,
        metadata: {
          season: 27,
          source: 'parade.com',
          scraped_at: new Date().toISOString(),
          total_contestants: contestants.length,
          scraping_method: 'gpt-4_xml_extraction'
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