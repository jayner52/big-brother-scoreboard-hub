import { ScrapedSource } from './types.ts';

export async function scrapeMultipleSources(season: string, week: number, contestants: string[]): Promise<ScrapedSource[]> {
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

export async function scrapeWikipedia(season: string, week: number): Promise<ScrapedSource | null> {
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

export async function scrapeReddit(season: string, week: number): Promise<ScrapedSource | null> {
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

export async function scrapeCBS(season: string, week: number): Promise<ScrapedSource | null> {
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

export async function scrapeBigBrotherNetwork(season: string, week: number): Promise<ScrapedSource | null> {
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