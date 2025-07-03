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

interface BatchProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  currentBatch: number;
  totalBatches: number;
}

// Utility function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Exponential backoff retry function
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${attempt}/${maxAttempts} failed:`, error.message);
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      // Exponential backoff: 1s, 2s, 4s, etc.
      const delayMs = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Retrying in ${delayMs}ms...`);
      await delay(delayMs);
    }
  }
  
  throw lastError;
}

// Validate photo URL
async function validatePhotoUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && response.headers.get('content-type')?.startsWith('image/');
  } catch {
    return false;
  }
}

// Extract profile image URL from individual contestant wiki page
async function extractContestantImage(name: string, seasonNumber: number): Promise<string> {
  try {
    // Try different wiki page name variations
    const nameVariations = [
      name.replace(/\s+/g, '_'),
      `${name.replace(/\s+/g, '_')}_(Big_Brother)`,
      `${name.replace(/\s+/g, '_')}_(US${seasonNumber})`,
      `${name.replace(/\s+/g, '_')}_(Season_${seasonNumber})`
    ];
    
    for (const wikiPageName of nameVariations) {
      const wikiUrl = `https://bigbrother.fandom.com/wiki/${wikiPageName}`;
      
      console.log(`🔍 Trying to scrape image for ${name} from ${wikiUrl}`);
      
      try {
        const response = await fetch(wikiUrl);
        if (!response.ok) {
          console.log(`❌ Failed to fetch wiki page (${response.status}): ${wikiUrl}`);
          continue; // Try next variation
        }
        
        const html = await response.text();
        
        // Look for the main profile image - search for img tags with Large in the src
        const imageRegexPatterns = [
          // Look for images with "Large" in the filename and US26 prefix
          /<img[^>]+src="(https:\/\/static\.wikia\.nocookie\.net\/bigbrother\/images\/[^"]*US26[^"]*Large[^"]*\.jpg[^"]*)"[^>]*>/gi,
          // Broader search for any US26 image
          /<img[^>]+src="(https:\/\/static\.wikia\.nocookie\.net\/bigbrother\/images\/[^"]*US26[^"]*\.jpg[^"]*)"[^>]*>/gi,
          // Even broader - any bigbrother image that might be the contestant
          /<img[^>]+src="(https:\/\/static\.wikia\.nocookie\.net\/bigbrother\/images\/[^"]*\.jpg[^"]*)"[^>]*>/gi
        ];
        
        for (const pattern of imageRegexPatterns) {
          const matches = [...html.matchAll(pattern)];
          
          for (const match of matches) {
            if (match && match[1]) {
              let imageUrl = match[1];
              
              // Clean up the URL
              imageUrl = imageUrl.replace(/&amp;/g, '&');
              
              // Check if this image URL contains the contestant's name or looks like a profile image
              const nameWords = name.toLowerCase().split(' ');
              const urlLower = imageUrl.toLowerCase();
              
              // Look for contestant name in URL or "Large" indicating it's a full-size profile image
              const hasName = nameWords.some(word => urlLower.includes(word.toLowerCase()));
              const isLargeImage = urlLower.includes('large');
              const isUS26 = urlLower.includes('us26');
              
              if ((hasName || isLargeImage) && isUS26) {
                console.log(`✅ Found potential image for ${name}: ${imageUrl}`);
                
                // Validate the image URL
                const isValid = await validatePhotoUrl(imageUrl);
                if (isValid) {
                  console.log(`✅ Image validated for ${name}: ${imageUrl}`);
                  return imageUrl;
                } else {
                  console.log(`❌ Image validation failed for ${name}: ${imageUrl}`);
                }
              }
            }
          }
        }
        
        console.log(`⚠️  No suitable image found for ${name} on ${wikiUrl}`);
        
      } catch (error) {
        console.log(`❌ Error fetching ${wikiUrl}: ${error.message}`);
        continue; // Try next variation
      }
    }
    
    console.log(`❌ No working wiki page found for ${name} after trying all variations`);
    return '';
    
  } catch (error) {
    console.log(`❌ Error extracting image for ${name}: ${error.message}`);
    return '';
  }
}

// Scrape the full cast list from Big Brother Wiki
async function scrapeBB26CastList(): Promise<string[]> {
  console.log('🔍 Scraping Big Brother 26 cast list from wiki...');
  
  try {
    const wikiUrl = 'https://bigbrother.fandom.com/wiki/Big_Brother_26_(US)';
    console.log(`📄 Fetching cast list from: ${wikiUrl}`);
    
    const response = await fetch(wikiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch BB26 wiki page: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Look for contestant names in the cast section
    // The wiki typically has contestant names in specific patterns
    const contestantNames: string[] = [];
    
    // Pattern 1: Look for links to individual contestant pages
    const linkPattern = /<a[^>]+href="\/wiki\/([^"]+)"[^>]*title="([^"]*)"[^>]*>([^<]+)<\/a>/gi;
    const matches = [...html.matchAll(linkPattern)];
    
    for (const match of matches) {
      const linkHref = match[1];
      const linkTitle = match[2] || '';
      const linkText = match[3];
      
      // Filter for likely contestant links (avoid general BB pages)
      if (linkHref && linkText && 
          !linkHref.includes('Big_Brother') && 
          !linkHref.includes('Category:') &&
          !linkHref.includes('Template:') &&
          linkText.length > 2 && linkText.length < 30 &&
          /^[A-Z][a-z]/.test(linkText) && // Starts with capital letter
          linkText.includes(' ') && // Has space (first and last name)
          !linkText.includes('(') && // No parentheses
          !linkText.includes(':')) {
        
        const cleanName = linkText.trim();
        if (!contestantNames.includes(cleanName)) {
          contestantNames.push(cleanName);
          console.log(`✅ Found contestant: ${cleanName}`);
        }
      }
    }
    
    // If we didn't find enough contestants with the first method, try alternative patterns
    if (contestantNames.length < 10) {
      console.log('⚠️  Using fallback method to find more contestants...');
      
      // Look for text patterns that might contain contestant names
      const namePattern = /\b([A-Z][a-z]+ [A-Z][a-z]+(?:-[A-Z][a-z]+)?)\b/g;
      const potentialNames = [...html.matchAll(namePattern)];
      
      for (const match of potentialNames) {
        const name = match[1];
        if (name && 
            !contestantNames.includes(name) &&
            name.length < 30 &&
            !name.includes('Big') &&
            !name.includes('Brother') &&
            !name.includes('House') &&
            !name.includes('Season')) {
          contestantNames.push(name);
          console.log(`✅ Found additional contestant: ${name}`);
        }
      }
    }
    
    console.log(`📊 Total contestants found: ${contestantNames.length}`);
    return contestantNames.slice(0, 16); // Limit to expected cast size
    
  } catch (error) {
    console.error('❌ Error scraping BB26 cast list:', error);
    
    // Fallback to known Season 26 contestants if scraping fails
    console.log('⚠️  Using fallback contestant list...');
    return [
      "Angela Murray", "Brooklyn Rivera", "Cam Sullivan-Brown", "Cedric Hodges", 
      "Chelsie Baham", "Joseph Rodriguez", "Kimo Apaka", "Leah Peters", 
      "Makensy Manbeck", "Quinn Martin", "Rubina Bernabe", "T'Kor Clottey", 
      "Tucker Des Lauriers", "Lisa Weintraub", "Kenney Kelley", "Matt Hardeman"
    ];
  }
}

// Extract contestant details from individual wiki page
async function extractContestantDetails(name: string): Promise<Partial<ContestantProfile>> {
  console.log(`📋 Extracting details for ${name}...`);
  
  try {
    // Try different wiki page name variations
    const nameVariations = [
      name.replace(/\s+/g, '_'),
      `${name.replace(/\s+/g, '_')}_(Big_Brother)`,
      `${name.replace(/\s+/g, '_')}_(US26)`,
      `${name.replace(/\s+/g, '_')}_(Season_26)`
    ];
    
    for (const wikiPageName of nameVariations) {
      const wikiUrl = `https://bigbrother.fandom.com/wiki/${wikiPageName}`;
      
      try {
        const response = await fetch(wikiUrl);
        if (!response.ok) continue;
        
        const html = await response.text();
        
        // Extract basic info from infobox or text
        const details: Partial<ContestantProfile> = {
          name: name,
          age: 25, // Default age, will try to extract
          hometown: "Unknown", // Default hometown
          occupation: "Unknown", // Default occupation
          bio: `${name} is a contestant on Big Brother 26.` // Default bio
        };
        
        // Try to extract age
        const ageMatch = html.match(/Age[:\s]*(\d+)/i) || html.match(/(\d+)\s*years?\s*old/i);
        if (ageMatch) {
          details.age = parseInt(ageMatch[1]);
        }
        
        // Try to extract hometown
        const hometownMatch = html.match(/Hometown[:\s]*([^<\n]+)/i) || 
                             html.match(/from\s+([A-Z][a-z]+,\s*[A-Z]{2})/i);
        if (hometownMatch) {
          details.hometown = hometownMatch[1].trim();
        }
        
        // Try to extract occupation
        const occupationMatch = html.match(/Occupation[:\s]*([^<\n]+)/i) ||
                               html.match(/Job[:\s]*([^<\n]+)/i);
        if (occupationMatch) {
          details.occupation = occupationMatch[1].trim();
        }
        
        console.log(`✅ Extracted details for ${name}: Age ${details.age}, ${details.hometown}, ${details.occupation}`);
        return details;
        
      } catch (error) {
        console.log(`❌ Failed to fetch ${wikiUrl}: ${error.message}`);
        continue;
      }
    }
    
    // Return defaults if no page found
    console.log(`⚠️  Using default details for ${name}`);
    return {
      name: name,
      age: 25,
      hometown: "Unknown",
      occupation: "Unknown",
      bio: `${name} is a contestant on Big Brother 26.`
    };
    
  } catch (error) {
    console.error(`❌ Error extracting details for ${name}:`, error);
    return {
      name: name,
      age: 25,
      hometown: "Unknown", 
      occupation: "Unknown",
      bio: `${name} is a contestant on Big Brother 26.`
    };
  }
}

// Scrape Big Brother Fandom for contestant data
async function scrapeContestantData(seasonNumber: number): Promise<ContestantProfile[]> {
  console.log(`🔍 Starting comprehensive wiki scraping for Big Brother Season ${seasonNumber}...`);
  
  if (seasonNumber < 26) {
    throw new Error(`Season ${seasonNumber} is not supported. Only Season 26+ contestants are processed.`);
  }
  
  if (seasonNumber === 27) {
    throw new Error('Big Brother 27 cast has not been announced yet. Please select a different season.');
  }
  
  // For Season 26, scrape the complete cast list
  if (seasonNumber === 26) {
    console.log('📋 Starting comprehensive Season 26 cast scraping...');
    
    // Step 1: Get the full cast list
    const contestantNames = await scrapeBB26CastList();
    console.log(`📊 Processing ${contestantNames.length} contestants...`);
    
    if (contestantNames.length === 0) {
      throw new Error('No contestants found in cast list');
    }
    
    // Step 2: Process each contestant individually
    const scrapedCast: ContestantProfile[] = [];
    let imageSuccessCount = 0;
    let imageFailureCount = 0;
    let detailsSuccessCount = 0;
    
    for (let i = 0; i < contestantNames.length; i++) {
      const contestantName = contestantNames[i];
      console.log(`\n🔄 [${i + 1}/${contestantNames.length}] Processing ${contestantName}...`);
      
      // Extract contestant details
      const contestantDetails = await extractContestantDetails(contestantName);
      if (contestantDetails.hometown !== "Unknown") {
        detailsSuccessCount++;
      }
      
      // Extract contestant image
      const scrapedImageUrl = await extractContestantImage(contestantName, 26);
      
      let finalPhotoUrl = scrapedImageUrl;
      
      if (scrapedImageUrl) {
        console.log(`✅ Successfully scraped image for ${contestantName}: ${scrapedImageUrl}`);
        imageSuccessCount++;
      } else {
        console.log(`❌ Failed to scrape image for ${contestantName}, using placeholder`);
        finalPhotoUrl = 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=300&fit=crop&crop=face';
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
      
      // Rate limiting between requests (be respectful to the wiki)
      await delay(1500);
    }
    
    console.log(`\n📊 Season 26 scraping complete!`);
    console.log(`📸 Images: ${imageSuccessCount} success, ${imageFailureCount} failed`);
    console.log(`📋 Details: ${detailsSuccessCount} success, ${contestantNames.length - detailsSuccessCount} used defaults`);
    console.log(`✅ Total contestants processed: ${scrapedCast.length}`);
    
    return scrapedCast;
  }
  
  throw new Error(`Season ${seasonNumber} scraping not yet implemented. Only Season 26 is currently supported.`);
}

// Process contestants in batches
async function processBatches(
  contestants: ContestantProfile[],
  seasonNumber: number,
  supabaseUrl: string,
  supabaseKey: string
): Promise<{ successful: number; failed: Array<{ name: string; error: string }> }> {
  const BATCH_SIZE = 10;
  const batches = [];
  
  // Split contestants into batches
  for (let i = 0; i < contestants.length; i += BATCH_SIZE) {
    batches.push(contestants.slice(i, i + BATCH_SIZE));
  }
  
  console.log(`📦 Processing ${contestants.length} contestants in ${batches.length} batches of ${BATCH_SIZE}`);
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  let totalSuccessful = 0;
  const allFailures: Array<{ name: string; error: string }> = [];
  
  // Clear existing contestants for this season first
  console.log(`🗑️  Clearing existing contestants for season ${seasonNumber}...`);
  try {
    const { error: deleteError } = await supabase
      .from('contestants')
      .delete()
      .eq('season_number', seasonNumber);
    
    if (deleteError) {
      console.error('Failed to clear existing contestants:', deleteError);
    } else {
      console.log('✅ Existing contestants cleared successfully');
    }
  } catch (error) {
    console.error('Error clearing existing contestants:', error);
  }
  
  // Process each batch
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const batchNumber = batchIndex + 1;
    
    console.log(`\n📋 Processing batch ${batchNumber}/${batches.length} (${batch.length} contestants)...`);
    
    const batchResults = await Promise.allSettled(
      batch.map(async (contestant, index) => {
        const globalIndex = batchIndex * BATCH_SIZE + index + 1;
        
        return await retryWithBackoff(async () => {
          console.log(`  [${globalIndex}/${contestants.length}] Processing: ${contestant.name}`);
          
          const insertData = {
            name: contestant.name.trim(),
            age: contestant.age,
            hometown: contestant.hometown.trim(),
            occupation: contestant.occupation.trim(),
            bio: contestant.bio || '',
            photo_url: contestant.photo || null,
            season_number: seasonNumber,
            data_source: 'bigbrother_fandom',
            ai_generated: false,
            generation_metadata: {
              generated_date: new Date().toISOString(),
              source: 'bigbrother.fandom.com',
              data_source: 'real_contestant_data',
              batch_id: Date.now(),
              batch_number: batchNumber,
              global_index: globalIndex
            },
            is_active: true,
            sort_order: globalIndex
          };
          
          // Use insert instead of upsert to avoid conflict issues
          const { data, error } = await supabase
            .from('contestants')
            .insert(insertData)
            .select()
            .single();
          
          if (error) {
            throw new Error(`Database error: ${error.message} (${error.code})`);
          }
          
          console.log(`    ✅ Success: ${contestant.name} (ID: ${data.id})`);
          return { contestant, data };
        }, 3, 1000);
      })
    );
    
    // Process batch results
    let batchSuccessful = 0;
    const batchFailures: Array<{ name: string; error: string }> = [];
    
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        batchSuccessful++;
        totalSuccessful++;
      } else {
        const contestant = batch[index];
        const error = result.reason?.message || 'Unknown error';
        console.log(`    ❌ Failed: ${contestant.name} - ${error}`);
        batchFailures.push({ name: contestant.name, error });
        allFailures.push({ name: contestant.name, error });
      }
    });
    
    console.log(`📊 Batch ${batchNumber} complete: ${batchSuccessful}/${batch.length} successful`);
    
    // Rate limiting between batches
    if (batchIndex < batches.length - 1) {
      console.log('⏱️  Rate limiting delay between batches...');
      await delay(300);
    }
  }
  
  console.log(`\n🎯 Final Results: ${totalSuccessful}/${contestants.length} contestants processed successfully`);
  
  if (allFailures.length > 0) {
    console.log('❌ Failed contestants:', allFailures);
  }
  
  return {
    successful: totalSuccessful,
    failed: allFailures
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json().catch(e => {
      console.error('Failed to parse request body:', e);
      throw new Error('Invalid request body');
    });
    
    const { season_number, season_theme, season_format, cast_size, special_twists, count = 1 }: GenerationRequest = requestBody;
    
    console.log(`🚀 Starting contestant generation for Season ${season_number}`);
    console.log(`📊 Request: ${count} contestants, theme: ${season_theme}`);

    // Validate season number
    if (season_number < 26) {
      throw new Error(`Season ${season_number} is not supported. Only Season 26+ contestants are processed.`);
    }

    // Check for Season 27 (TBD)
    if (season_number === 27) {
      throw new Error('Big Brother 27 cast has not been announced yet. Please select a different season.');
    }

    // Get Supabase credentials for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    // Scrape contestant data
    const contestants = await scrapeContestantData(season_number);
    
    if (!contestants || contestants.length === 0) {
      throw new Error(`No contestant data found for season ${season_number}`);
    }

    console.log(`📋 Found ${contestants.length} contestants to process`);

    // Process contestants in batches with retry logic
    const results = await processBatches(contestants, season_number, supabaseUrl, supabaseKey);

    // Prepare response
    const success = results.successful === contestants.length;
    const responseData = {
      success: results.successful > 0, // Partial success is still success
      profiles: contestants,
      metadata: {
        generated_date: new Date().toISOString(),
        season_context: `Season ${season_number}: ${season_theme}`,
        scraping_source: 'bigbrother.fandom.com',
        total_found: contestants.length,
        successful_inserts: results.successful,
        failed_inserts: results.failed.length,
        batch_processing: true,
        season_name: `Big Brother ${season_number}`
      },
      statistics: {
        total_contestants: contestants.length,
        successful: results.successful,
        failed: results.failed.length,
        success_rate: Math.round((results.successful / contestants.length) * 100)
      },
      failures: results.failed
    };

    if (results.failed.length > 0) {
      console.log(`⚠️  Partial success: ${results.successful}/${contestants.length} contestants processed`);
      responseData.error = `Partial success: ${results.failed.length} contestants failed to save. Check failures array for details.`;
    } else {
      console.log(`🎉 Complete success: All ${results.successful} contestants processed successfully`);
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in generate-contestant-profile function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      metadata: {
        error_type: 'function_error',
        timestamp: new Date().toISOString()
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});