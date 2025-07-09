import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GenerationRequest } from './types.ts';
import { scrapeContestantData } from './contestant-data.ts';
import { processBatches } from './database.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json().catch(e => {
      console.error('Failed to parse request body:', e);
      throw new Error('Invalid request body');
    });
    
    const { season_number, season_theme, season_format, cast_size, special_twists, count = 1, pool_id }: GenerationRequest = requestBody;
    
    console.log(`🚀 Starting contestant generation for Season ${season_number}`);
    console.log(`📊 Request: ${count} contestants, theme: ${season_theme}, pool_id: ${pool_id}`);

    // Validate season number
    if (season_number < 26) {
      throw new Error(`Season ${season_number} is not supported. Only Season 26+ contestants are processed.`);
    }

    // Season 27 is now supported via Parade scraping
    console.log(`📋 Season ${season_number} requested - proceeding with data processing`);

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
    const results = await processBatches(contestants, season_number, supabaseUrl, supabaseKey, pool_id);

    // Prepare response
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