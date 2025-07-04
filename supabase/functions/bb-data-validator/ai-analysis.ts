import { ScrapedSource, ParsedData } from './types.ts';

export async function parseScrapedDataWithAI(scrapedData: ScrapedSource[], contestants: string[]): Promise<ParsedData[]> {
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

export async function analyzeSourceWithOpenAI(source: ScrapedSource, contestants: string[]): Promise<ParsedData | null> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

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