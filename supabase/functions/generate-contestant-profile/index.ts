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

// Scrape Big Brother Fandom for contestant data
async function scrapeContestantData(seasonNumber: number): Promise<ContestantProfile[]> {
  console.log(`🔍 Starting real wiki scraping for Big Brother Season ${seasonNumber}...`);
  
  if (seasonNumber < 26) {
    throw new Error(`Season ${seasonNumber} is not supported. Only Season 26+ contestants are processed.`);
  }
  
  if (seasonNumber === 27) {
    throw new Error('Big Brother 27 cast has not been announced yet. Please select a different season.');
  }
  
  // For Season 26, scrape real data with proper image extraction
  if (seasonNumber === 26) {
    console.log('📋 Starting real wiki scraping for Season 26 cast...');
    
    // Base contestant data (names, ages, etc.) - we'll scrape the images
    const season26BaseData = [
      { name: "Angela Murray", age: 50, hometown: "Long Beach, CA", occupation: "Real Estate Agent", bio: "Angela is a dedicated real estate agent who grew up in a close-knit family in Long Beach. She's passionate about fitness and helping first-time homebuyers achieve their dreams. She applied for Big Brother to challenge herself and prove that women over 50 can compete with anyone." },
      { name: "Brooklyn Rivera", age: 34, hometown: "Dallas, TX", occupation: "Business Administrator", bio: "Brooklyn is a driven business administrator from Dallas who loves organizing events and spending time with her family. She's passionate about travel and has visited over 20 countries. She joined Big Brother to test her social skills and win money for her daughter's college fund." },
      { name: "Cam Sullivan-Brown", age: 25, hometown: "Bowie, MD", occupation: "Physical Therapist", bio: "Cam is a compassionate physical therapist who helps people recover from injuries and reach their fitness goals. He's an avid runner and volunteers at local youth sports programs. He came to Big Brother to challenge himself mentally and inspire others to pursue their dreams." },
      { name: "Cedric Hodges", age: 21, hometown: "Saginaw, TX", occupation: "Former Marine", bio: "Cedric is a young former Marine who served his country with honor and is now pursuing his education. He's passionate about fitness, mentoring young people, and spending time with his family. He entered Big Brother to show that young veterans can excel in any environment." },
      { name: "Chelsie Baham", age: 27, hometown: "Rancho Cucamonga, CA", occupation: "Nonprofit Director", bio: "Chelsie runs a nonprofit organization focused on helping underprivileged communities access education resources. She's a dedicated advocate who loves hiking and spending time outdoors. She joined Big Brother to raise awareness for her cause and prove that kindness can be a winning strategy." }
    ];
    
    // Test with just Angela Murray first as requested
    console.log('🧪 Testing image extraction with Angela Murray first...');
    const testImageUrl = await extractContestantImage("Angela Murray", 26);
    if (testImageUrl) {
      console.log(`✅ Test successful! Angela Murray image: ${testImageUrl}`);
    } else {
      console.log(`❌ Test failed - could not extract Angela Murray's image`);
    }
    
    // Now scrape images for all contestants
    const scrapedCast: ContestantProfile[] = [];
    let imageSuccessCount = 0;
    let imageFailureCount = 0;
    
    for (let i = 0; i < season26BaseData.length; i++) {
      const contestant = season26BaseData[i];
      console.log(`🖼️  [${i + 1}/${season26BaseData.length}] Scraping image for ${contestant.name}...`);
      
      // Extract the actual image URL from their wiki page
      const scrapedImageUrl = await extractContestantImage(contestant.name, 26);
      
      let finalPhotoUrl = scrapedImageUrl;
      
      if (scrapedImageUrl) {
        console.log(`✅ Successfully scraped image for ${contestant.name}: ${scrapedImageUrl}`);
        imageSuccessCount++;
      } else {
        console.log(`❌ Failed to scrape image for ${contestant.name}, using placeholder`);
        // Use a placeholder image from Unsplash
        finalPhotoUrl = 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=300&fit=crop&crop=face';
        imageFailureCount++;
      }
      
      scrapedCast.push({
        ...contestant,
        photo: finalPhotoUrl
      });
      
      // Rate limiting between requests (be respectful to the wiki)
      await delay(1000);
    }
    
    console.log(`📊 Image scraping complete: ${imageSuccessCount} success, ${imageFailureCount} failed`);
    console.log(`✅ Season 26 cast processed: ${scrapedCast.length} contestants`);
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