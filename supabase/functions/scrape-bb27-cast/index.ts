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
    console.log('🏠 SCRAPING REAL Big Brother 27 cast from Parade...');
    
    // Fetch the REAL cast data from Parade's exclusive article
    const paradeUrl = 'https://parade.com/tv/big-brother-27-cast-photos-interview-2025';
    console.log(`🔍 Fetching: ${paradeUrl}`);
    
    const response = await fetch(paradeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Parade article: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`📄 Fetched HTML content (${html.length} characters)`);
    
    // Parse the HTML to extract real contestant data
    const contestants = parseParadeHTML(html);
    
    if (contestants.length === 0) {
      throw new Error('No contestants found in Parade article - parsing may have failed');
    }

    console.log(`✅ Successfully parsed ${contestants.length} REAL Big Brother 27 contestants from Parade`);
    
    // Log each real contestant for verification
    contestants.forEach((contestant, index) => {
      console.log(`${index + 1}. ${contestant.name} (${contestant.age}) - ${contestant.occupation} from ${contestant.location}`);
    });

    return new Response(
      JSON.stringify({
        success: true,
        contestants,
        metadata: {
          season: 27,
          source: 'parade_exclusive_article',
          scraped_at: new Date().toISOString(),
          total_contestants: contestants.length,
          scraping_method: 'real_parade_scraping',
          source_url: paradeUrl
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

function parseParadeHTML(html: string): ContestantData[] {
  const contestants: ContestantData[] = [];
  
  try {
    console.log('🔍 Parsing Parade HTML for real Big Brother 27 cast...');
    
    // Parade typically structures cast articles with specific patterns
    // Look for common patterns in cast reveal articles
    
    // Try to find contestant names - they're usually in h2, h3, or strong tags
    const namePatterns = [
      /<h[2-4][^>]*>([^<]+(?:Big Brother|BB27|cast|houseguest)[^<]*)<\/h[2-4]>/gi,
      /<h[2-4][^>]*>([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)<\/h[2-4]>/gi,
      /<strong[^>]*>([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)<\/strong>/gi,
      /<p[^>]*><strong[^>]*>([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)<\/strong>/gi
    ];
    
    // Look for age patterns - typically "age XX" or "XX years old"
    const agePattern = /(\d+)(?:\s*years?\s*old|(?=\s*from|\s*,))/gi;
    
    // Look for location patterns - typically "from City, State"
    const locationPattern = /from\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?,\s*[A-Z]{2}|[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/gi;
    
    // Look for occupation patterns
    const occupationPattern = /(?:occupation|job|works?\s+as|profession):\s*([^.]+)/gi;
    
    // Look for images - Parade uses specific CDN patterns
    const imagePattern = /<img[^>]+src="([^"]*parade[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/gi;
    
    // Split HTML into sections that might contain individual contestants
    const sections = html.split(/<h[2-4][^>]*>/i);
    
    for (let i = 1; i < sections.length; i++) {
      const section = sections[i];
      
      // Extract potential name from the header
      const headerMatch = section.match(/^([^<]+)/);
      if (!headerMatch) continue;
      
      const potentialName = headerMatch[1].trim();
      
      // Check if this looks like a contestant name (2-3 words, proper case)
      const nameMatch = potentialName.match(/^([A-Z][a-z]+(?:\s"[^"]+")?\s[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)(?:\s*[,-].*)?$/);
      if (!nameMatch) continue;
      
      const name = nameMatch[1].trim();
      
      // Extract age
      const ageMatch = section.match(agePattern);
      const age = ageMatch ? parseInt(ageMatch[1]) : 0;
      
      // Extract location
      const locationMatch = section.match(locationPattern);
      const location = locationMatch ? locationMatch[1].trim() : 'Unknown';
      
      // Extract occupation from bio text
      const bioText = section.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      let occupation = 'Houseguest';
      
      // Common occupation keywords
      const occupationKeywords = [
        'teacher', 'nurse', 'doctor', 'lawyer', 'engineer', 'manager', 'consultant',
        'student', 'artist', 'designer', 'writer', 'actor', 'musician', 'chef',
        'trainer', 'coach', 'therapist', 'analyst', 'developer', 'entrepreneur',
        'salesperson', 'realtor', 'photographer', 'influencer', 'model'
      ];
      
      for (const keyword of occupationKeywords) {
        if (bioText.toLowerCase().includes(keyword)) {
          occupation = keyword.charAt(0).toUpperCase() + keyword.slice(1);
          break;
        }
      }
      
      // Extract image URL
      const imageMatch = section.match(imagePattern);
      let imageUrl = 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=300&fit=crop&crop=face';
      if (imageMatch) {
        imageUrl = imageMatch[1];
        // Ensure it's a full URL
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          imageUrl = 'https://parade.com' + imageUrl;
        }
      }
      
      // Create bio from available text
      const bio = bioText.length > 50 ? 
        bioText.substring(0, 200) + '...' : 
        `${name} is a ${age}-year-old ${occupation} from ${location} competing on Big Brother 27.`;
      
      contestants.push({
        name,
        age,
        location,
        occupation,
        bio,
        imageUrl
      });
      
      console.log(`📋 Parsed: ${name}, ${age}, ${location}, ${occupation}`);
    }
    
    // If we didn't find enough contestants, try a different parsing approach
    if (contestants.length < 10) {
      console.log('⚠️ Not enough contestants found with primary method, trying alternative parsing...');
      
      // Fallback: Look for any strong candidate patterns in the entire HTML
      const fullText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      const lines = fullText.split(/[.!?]/).filter(line => line.length > 30);
      
      for (const line of lines) {
        const nameMatch = line.match(/([A-Z][a-z]+\s[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)[,\s]+(\d+)[,\s]+(.*?)(?:from|of)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?,\s*[A-Z]{2})/);
        if (nameMatch && contestants.length < 20) {
          const [, name, ageStr, occText, location] = nameMatch;
          const age = parseInt(ageStr);
          const occupation = occText.trim().split(/\s+/).slice(0, 3).join(' ') || 'Houseguest';
          
          if (!contestants.some(c => c.name === name)) {
            contestants.push({
              name: name.trim(),
              age,
              location: location.trim(),
              occupation: occupation.charAt(0).toUpperCase() + occupation.slice(1).toLowerCase(),
              bio: `${name} is a ${age}-year-old ${occupation} from ${location} competing on Big Brother 27.`,
              imageUrl: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=300&fit=crop&crop=face'
            });
            
            console.log(`📋 Alternative parse: ${name}, ${age}, ${location}`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error parsing Parade HTML:', error);
  }
  
  return contestants;
}