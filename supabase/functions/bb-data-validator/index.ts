import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

import { ValidationRequest, ValidationResponse } from './types.ts';
import { corsHeaders } from './config.ts';
import { scrapeMultipleSources } from './scrapers.ts';
import { parseScrapedDataWithAI } from './ai-analysis.ts';
import { 
  validateDataPoints, 
  calculateOverallConfidence, 
  extractPopulatedFields 
} from './validation.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { season, week, contestants }: ValidationRequest = await req.json();
    console.log(`Validating Big Brother ${season} Week ${week} data`);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Scrape data from multiple trusted sources
    const scrapedData = await scrapeMultipleSources(season, week, contestants);
    console.log(`Scraped data from ${scrapedData.length} sources`);

    // Use AI to parse and validate the scraped content
    const sourceData = await parseScrapedDataWithAI(scrapedData, contestants);
    console.log(`Parsed data from ${sourceData.length} sources`);

    // Validate each data point with confidence scoring
    const validationResults = await validateDataPoints(sourceData, contestants);
    console.log('Validation completed for all data points');

    // Calculate overall validation quality
    const overallConfidence = calculateOverallConfidence(validationResults);
    const highConfidenceFields = validationResults.filter(r => r.confidence >= 90);
    const lowConfidenceFields = validationResults.filter(r => r.confidence < 90 && r.confidence >= 80);
    const unreliableFields = validationResults.filter(r => r.confidence < 80);

    const response: ValidationResponse = {
      success: true,
      overall_confidence: overallConfidence,
      validation_results: validationResults,
      summary: {
        high_confidence_count: highConfidenceFields.length,
        low_confidence_count: lowConfidenceFields.length,
        unreliable_count: unreliableFields.length,
        total_fields: validationResults.length
      },
      populated_fields: extractPopulatedFields(highConfidenceFields),
      warnings: lowConfidenceFields.map(f => `${f.field}: ${f.confidence}% confidence`),
      errors: unreliableFields.map(f => `${f.field}: insufficient reliable sources (${f.confidence}%)`)
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in bb-data-validator:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      fallback_message: 'Validation failed - manual entry recommended'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});