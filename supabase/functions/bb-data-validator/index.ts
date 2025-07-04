import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

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

interface ScrapedSource {
  url: string;
  content: string;
  source_type: string;
  timestamp: string;
}

async function scrapeMultipleSources(season: string, week: number, contestants: string[]): Promise<ScrapedSource[]> {
  const sources: ScrapedSource[] = [];
  
  try {
    // Scrape Wikipedia
    const wikipediaData = await scrapeWikipedia(season, week);
    if (wikipediaData) sources.push(wikipediaData);
    
    // Scrape Reddit r/BigBrother 
    const redditData = await scrapeReddit(season, week);
    if (redditData) sources.push(redditData);
    
    // Scrape CBS (if accessible)
    const cbsData = await scrapeCBS(season, week);
    if (cbsData) sources.push(cbsData);
    
    // Scrape Big Brother Network
    const bbnData = await scrapeBigBrotherNetwork(season, week);
    if (bbnData) sources.push(bbnData);
    
  } catch (error) {
    console.error('Error scraping sources:', error);
  }
  
  return sources;
}

async function scrapeWikipedia(season: string, week: number): Promise<ScrapedSource | null> {
  try {
    // Try multiple Wikipedia page patterns
    const urls = [
      `https://en.wikipedia.org/wiki/Big_Brother_${season}_(American_season)`,
      `https://en.wikipedia.org/wiki/Big_Brother_(American_season_${season})`,
      `https://en.wikipedia.org/wiki/Big_Brother_${season}_(American_TV_series)`
    ];
    
    for (const url of urls) {
      try {
        const response = await fetch(url);
        if (!response.ok) continue;
        
        const html = await response.text();
        
        // Extract competition results tables and episode summaries
        const relevantContent = extractWikipediaCompetitionData(html, week);
        
        if (relevantContent) {
          console.log(`Found Wikipedia data for Week ${week} at ${url}`);
          return {
            url,
            content: relevantContent,
            source_type: 'Wikipedia',
            timestamp: new Date().toISOString()
          };
        }
      } catch (pageError) {
        console.error(`Error fetching ${url}:`, pageError);
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error scraping Wikipedia:', error);
    return null;
  }
}

function extractWikipediaCompetitionData(html: string, week: number): string | null {
  // Look for multiple patterns that indicate week data
  const weekPatterns = [
    new RegExp(`Week ${week}[^\\n]*(?:[\\s\\S]*?)(?=Week ${week + 1}|$)`, 'gi'),
    new RegExp(`Episode ${week}[^\\n]*(?:[\\s\\S]*?)(?=Episode ${week + 1}|$)`, 'gi'),
    new RegExp(`${week}\\s*\\|[^\\n]*(?:[\\s\\S]*?)(?=${week + 1}\\s*\\||$)`, 'gi')
  ];
  
  for (const pattern of weekPatterns) {
    const matches = html.match(pattern);
    if (matches && matches.length > 0) {
      // Extract table content and structured data
      const content = matches[0];
      
      // Look for competition-related keywords
      const competitionKeywords = ['HOH', 'Head of Household', 'POV', 'Power of Veto', 'Nominated', 'Evicted', 'Winner'];
      const hasCompetitionData = competitionKeywords.some(keyword => 
        content.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (hasCompetitionData) {
        // Clean up HTML and return relevant sections
        return content
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/<style[^>]*>.*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
    }
  }
  
  return null;
}

async function scrapeReddit(season: string, week: number): Promise<ScrapedSource | null> {
  try {
    // Enhanced Reddit search with more targeted terms
    const searchTerms = [
      `BB${season} Episode ${week}`,
      `Big Brother ${season} Week ${week}`,
      `BB${season} HOH Week ${week}`,
      `BB${season} Veto Week ${week}`,
      `BB${season} Nominations Week ${week}`,
      `BB${season} Eviction Week ${week}`
    ];
    
    for (const term of searchTerms) {
      const url = `https://www.reddit.com/r/BigBrother/search.json?q=${encodeURIComponent(term)}&restrict_sr=1&sort=new&t=month&limit=10`;
      
      try {
        console.log(`Searching Reddit for: "${term}"`);
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'BigBrotherValidator/1.0'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const posts = data.data?.children || [];
          
          // Look for episode discussion or results posts
          const relevantPost = posts.find(post => {
            const title = post.data.title.toLowerCase();
            const isEpisodeThread = title.includes('episode') && title.includes('discussion');
            const isResultsThread = title.includes('result') || title.includes('winner') || title.includes('hoh') || title.includes('pov');
            const hasWeekInfo = title.includes(`${week}`) || title.includes(`week ${week}`);
            
            return (isEpisodeThread || isResultsThread) && hasWeekInfo;
          });
          
          if (relevantPost) {
            const postUrl = `https://www.reddit.com${relevantPost.data.permalink}`;
            console.log(`Found relevant Reddit post: ${relevantPost.data.title}`);
            
            // Fetch post and its comments
            const commentsResponse = await fetch(`${postUrl}.json`, {
              headers: { 'User-Agent': 'BigBrotherValidator/1.0' }
            });
            
            if (commentsResponse.ok) {
              const commentsData = await commentsResponse.json();
              const processedContent = extractRedditCompetitionData(commentsData);
              
              return {
                url: postUrl,
                content: processedContent,
                source_type: 'Reddit Live Feeds',
                timestamp: new Date().toISOString()
              };
            }
          }
        }
      } catch (searchError) {
        console.error(`Error searching Reddit for "${term}":`, searchError);
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error scraping Reddit:', error);
    return null;
  }
}

function extractRedditCompetitionData(commentsData: any): string {
  const post = commentsData[0]?.data?.children?.[0]?.data;
  const comments = commentsData[1]?.data?.children || [];
  
  let extractedText = '';
  
  // Include post title and body
  if (post) {
    extractedText += `POST TITLE: ${post.title}\n`;
    if (post.selftext) {
      extractedText += `POST BODY: ${post.selftext}\n\n`;
    }
  }
  
  // Extract top-level comments that likely contain competition results
  const relevantComments = comments
    .filter(comment => comment.data?.body && comment.data.score > 5) // Filter highly upvoted comments
    .slice(0, 10) // Top 10 comments
    .map(comment => comment.data.body)
    .filter(body => {
      const text = body.toLowerCase();
      return text.includes('hoh') || text.includes('pov') || text.includes('nominee') || 
             text.includes('evict') || text.includes('winner') || text.includes('head of household');
    });
  
  if (relevantComments.length > 0) {
    extractedText += 'RELEVANT COMMENTS:\n' + relevantComments.join('\n\n');
  }
  
  return extractedText || JSON.stringify(commentsData).substring(0, 5000);
}

async function scrapeCBS(season: string, week: number): Promise<ScrapedSource | null> {
  try {
    // Try CBS episode recaps
    const url = `https://www.cbs.com/shows/big_brother/`;
    const response = await fetch(url);
    
    if (response.ok) {
      const html = await response.text();
      return {
        url,
        content: html,
        source_type: 'CBS Official',
        timestamp: new Date().toISOString()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error scraping CBS:', error);
    return null;
  }
}

async function scrapeBigBrotherNetwork(season: string, week: number): Promise<ScrapedSource | null> {
  try {
    const url = `https://bigbrothernetwork.com/`;
    const response = await fetch(url);
    
    if (response.ok) {
      const html = await response.text();
      return {
        url,
        content: html,
        source_type: 'Big Brother Network',
        timestamp: new Date().toISOString()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error scraping Big Brother Network:', error);
    return null;
  }
}

async function parseScrapedDataWithAI(scrapedData: ScrapedSource[], contestants: string[]): Promise<any[]> {
  const parsedResults = [];
  
  for (const source of scrapedData) {
    try {
      const parsed = await analyzeSourceWithOpenAI(source, contestants);
      if (parsed) {
        parsedResults.push(parsed);
      }
    } catch (error) {
      console.error(`Error parsing ${source.source_type}:`, error);
    }
  }
  
  return parsedResults;
}

async function analyzeSourceWithOpenAI(source: ScrapedSource, contestants: string[]): Promise<any> {
  console.log(`Analyzing ${source.source_type} content (${source.content.length} chars)`);
  
  // Enhanced prompt with better contestant matching
  const prompt = `
    You are a Big Brother competition results analyst. Extract ONLY factual competition results from this content.
    
    CONTESTANT NAMES TO MATCH: ${contestants.join(', ')}
    
    SOURCE: ${source.source_type}
    CONTENT TO ANALYZE:
    ${source.content.substring(0, 6000)}
    
    Extract competition results and return VALID JSON:
    {
      "hoh_winner": "exact_contestant_name or null",
      "pov_winner": "exact_contestant_name or null", 
      "nominees": ["name1", "name2"] or [],
      "veto_used": true/false/null,
      "replacement_nominee": "exact_contestant_name or null",
      "evicted": "exact_contestant_name or null",
      "confidence_indicators": ["official", "verified", "multiple_mentions"],
      "found_data": true/false
    }
    
    CRITICAL RULES:
    1. Use EXACT names from contestant list - match case and spelling precisely
    2. For nicknames/abbreviations, match to full contestant names
    3. If you find "Angela won HOH", return "Angela" (not "Angela Rummans")
    4. Set found_data=true ONLY if you find specific competition results
    5. Look for: HOH/Head of Household winner, POV/Veto winner, nominees, evictions
    6. Ignore speculation, rumors, or unclear information
    7. Return null for any field you cannot determine with confidence
  `;

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
          content: 'You are a Big Brother data analyst. Extract competition results from source content and return structured JSON data.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 800
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
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