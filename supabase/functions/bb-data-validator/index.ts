import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseKey);

interface ValidationRequest {
  season: string;
  week: number;
  contestants: string[];
}

interface ValidationResult {
  field: string;
  value: string | null;
  confidence: number;
  sources: string[];
  conflicts: string[];
}

interface SourceReliability {
  name: string;
  weight: number;
}

const SOURCE_RELIABILITY: SourceReliability[] = [
  { name: 'CBS Official', weight: 98 },
  { name: 'Wikipedia', weight: 95 },
  { name: 'Big Brother Network', weight: 90 },
  { name: 'Reality TV Fandom', weight: 85 },
  { name: 'Gold Derby', weight: 80 },
  { name: 'Reddit Live Feeds', weight: 70 },
  { name: 'Twitter Updates', weight: 65 }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { season, week, contestants }: ValidationRequest = await req.json();
    console.log(`Validating Big Brother ${season} Week ${week} data`);

    if (!perplexityApiKey) {
      throw new Error('Perplexity API key not configured');
    }

    // Generate dynamic search queries for comprehensive data gathering
    const searchQueries = generateSearchQueries(season, week);
    console.log('Generated search queries:', searchQueries);

    // Gather data from multiple sources using AI-powered web search
    const sourceData = await gatherSourceData(searchQueries, contestants);
    console.log(`Gathered data from ${sourceData.length} sources`);

    // Validate each data point with confidence scoring
    const validationResults = await validateDataPoints(sourceData, contestants);
    console.log('Validation completed for all data points');

    // Calculate overall validation quality
    const overallConfidence = calculateOverallConfidence(validationResults);
    const highConfidenceFields = validationResults.filter(r => r.confidence >= 90);
    const lowConfidenceFields = validationResults.filter(r => r.confidence < 90 && r.confidence >= 80);
    const unreliableFields = validationResults.filter(r => r.confidence < 80);

    return new Response(JSON.stringify({
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
    }), {
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

function generateSearchQueries(season: string, week: number): string[] {
  return [
    `Big Brother ${season} Week ${week} HOH Head of Household winner`,
    `Big Brother ${season} Week ${week} Power of Veto POV winner`,
    `Big Brother ${season} Week ${week} nominations nominees`,
    `Big Brother ${season} Week ${week} eviction evicted houseguest`,
    `Big Brother ${season} Week ${week} veto used replacement nominee`,
    `Big Brother ${season} Week ${week} results summary official`,
    `Big Brother ${season} Week ${week} CBS episode recap`,
    `Big Brother ${season} Week ${week} live feeds updates`
  ];
}

async function gatherSourceData(queries: string[], contestants: string[]): Promise<any[]> {
  const allData = [];
  
  for (const query of queries) {
    try {
      const searchResult = await performAIWebSearch(query, contestants);
      if (searchResult) {
        allData.push(searchResult);
      }
    } catch (error) {
      console.error(`Error searching for: ${query}`, error);
    }
  }
  
  return allData;
}

async function performAIWebSearch(query: string, contestants: string[]): Promise<any> {
  const prompt = `
    Search for and analyze information about: "${query}"
    
    Available contestants: ${contestants.join(', ')}
    
    Please provide structured information about:
    1. HOH (Head of Household) winner
    2. POV (Power of Veto) winner  
    3. Initial nominees
    4. Veto usage (true/false)
    5. Replacement nominee (if veto was used)
    6. Final evicted contestant
    7. Source reliability indicator
    
    Return ONLY valid JSON in this exact format:
    {
      "hoh_winner": "contestant_name or null",
      "pov_winner": "contestant_name or null", 
      "nominees": ["contestant1", "contestant2"] or [],
      "veto_used": true or false,
      "replacement_nominee": "contestant_name or null",
      "evicted": "contestant_name or null",
      "source_type": "CBS Official" or "Wikipedia" or "Big Brother Network" or "Reddit" or "Other",
      "confidence_indicators": ["verified", "multiple_sources", "official"] or [],
      "found_data": true or false
    }
    
    Use exact contestant names from the provided list. If no reliable information found, set found_data to false.
  `;

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${perplexityApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        { 
          role: 'system', 
          content: 'You are a Big Brother data analyst with web search access. Search for current Big Brother competition results and return structured JSON data.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 800,
      return_images: false,
      return_related_questions: false,
      search_domain_filter: ['wikipedia.org', 'cbs.com', 'bigbrothernetwork.com', 'bigbrother.fandom.com'],
      search_recency_filter: 'month'
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const result = JSON.parse(content);
    return result.found_data ? result : null;
  } catch (parseError) {
    console.error('Failed to parse AI response:', content);
    return null;
  }
}

async function validateDataPoints(sourceData: any[], contestants: string[]): Promise<ValidationResult[]> {
  const fields = ['hoh_winner', 'pov_winner', 'nominees', 'veto_used', 'replacement_nominee', 'evicted'];
  const results: ValidationResult[] = [];

  for (const field of fields) {
    const fieldData = sourceData
      .filter(data => data && data[field] !== null && data[field] !== undefined)
      .map(data => ({
        value: data[field],
        source: data.source_type || 'Unknown',
        indicators: data.confidence_indicators || []
      }));

    if (fieldData.length === 0) {
      results.push({
        field,
        value: null,
        confidence: 0,
        sources: [],
        conflicts: []
      });
      continue;
    }

    // Calculate consensus and confidence
    const consensus = findConsensusValue(fieldData, field);
    const confidence = calculateFieldConfidence(fieldData, consensus, field);
    const sources = fieldData.map(d => d.source);
    const conflicts = findConflicts(fieldData, field);

    results.push({
      field,
      value: consensus,
      confidence,
      sources: [...new Set(sources)], // Remove duplicates
      conflicts
    });
  }

  return results;
}

function findConsensusValue(fieldData: any[], field: string): string | null {
  if (fieldData.length === 0) return null;

  // For arrays (nominees), find most common array
  if (field === 'nominees') {
    const nomineeCounts = new Map();
    fieldData.forEach(data => {
      const key = JSON.stringify(data.value);
      nomineeCounts.set(key, (nomineeCounts.get(key) || 0) + getSourceWeight(data.source));
    });
    
    const bestNominees = [...nomineeCounts.entries()]
      .sort((a, b) => b[1] - a[1])[0];
    
    return bestNominees ? JSON.parse(bestNominees[0]) : null;
  }

  // For other fields, find weighted consensus
  const valueCounts = new Map();
  fieldData.forEach(data => {
    const weight = getSourceWeight(data.source);
    valueCounts.set(data.value, (valueCounts.get(data.value) || 0) + weight);
  });

  const bestValue = [...valueCounts.entries()]
    .sort((a, b) => b[1] - a[1])[0];

  return bestValue ? bestValue[0] : null;
}

function calculateFieldConfidence(fieldData: any[], consensus: any, field: string): number {
  if (!fieldData.length) return 0;

  let totalWeight = 0;
  let consensusWeight = 0;

  fieldData.forEach(data => {
    const weight = getSourceWeight(data.source);
    totalWeight += weight;
    
    const matches = field === 'nominees' 
      ? JSON.stringify(data.value) === JSON.stringify(consensus)
      : data.value === consensus;
      
    if (matches) {
      consensusWeight += weight;
      // Bonus for quality indicators
      if (data.indicators.includes('verified')) consensusWeight += 5;
      if (data.indicators.includes('multiple_sources')) consensusWeight += 3;
      if (data.indicators.includes('official')) consensusWeight += 7;
    }
  });

  const baseConfidence = totalWeight > 0 ? (consensusWeight / totalWeight) * 100 : 0;
  
  // Boost confidence for multiple agreeing sources
  const agreeingSourceCount = fieldData.filter(data => {
    return field === 'nominees' 
      ? JSON.stringify(data.value) === JSON.stringify(consensus)
      : data.value === consensus;
  }).length;
  
  const sourceBonus = Math.min(agreeingSourceCount * 5, 20);
  
  return Math.min(baseConfidence + sourceBonus, 100);
}

function getSourceWeight(sourceName: string): number {
  const source = SOURCE_RELIABILITY.find(s => 
    sourceName && sourceName.toLowerCase().includes(s.name.toLowerCase())
  );
  return source ? source.weight : 50; // Default weight for unknown sources
}

function findConflicts(fieldData: any[], field: string): string[] {
  const conflicts = [];
  const valueGroups = new Map();

  fieldData.forEach(data => {
    const key = field === 'nominees' ? JSON.stringify(data.value) : data.value;
    if (!valueGroups.has(key)) {
      valueGroups.set(key, []);
    }
    valueGroups.get(key).push(data.source);
  });

  if (valueGroups.size > 1) {
    valueGroups.forEach((sources, value) => {
      conflicts.push(`${sources.join(', ')}: ${value}`);
    });
  }

  return conflicts;
}

function calculateOverallConfidence(results: ValidationResult[]): number {
  if (results.length === 0) return 0;
  
  const totalConfidence = results.reduce((sum, result) => sum + result.confidence, 0);
  return Math.round(totalConfidence / results.length);
}

function extractPopulatedFields(highConfidenceResults: ValidationResult[]): any {
  const populated = {};
  
  highConfidenceResults.forEach(result => {
    if (result.value !== null) {
      populated[result.field] = result.value;
    }
  });
  
  return populated;
}