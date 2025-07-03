import { validatePhotoUrl } from './utils.ts';

// Scrape GoldDerby gallery for BB26 cast photos
export async function scrapeGoldDerbyGallery(): Promise<Record<string, string>> {
  try {
    console.log('🖼️  Scraping GoldDerby gallery for BB26 cast photos...');
    
    const galleryUrl = 'https://www.goldderby.com/gallery/big-brother-26-cast/';
    const response = await fetch(galleryUrl);
    
    if (!response.ok) {
      console.log(`❌ Failed to fetch GoldDerby gallery (${response.status})`);
      return {};
    }
    
    const html = await response.text();
    
    // Look for gallery images with contestant names
    const imageRegex = /<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi;
    const photoMap: Record<string, string> = {};
    let matches;
    
    while ((matches = imageRegex.exec(html)) !== null) {
      const imageUrl = matches[1];
      const altText = matches[2].toLowerCase();
      
      // Skip non-cast images (logos, etc.)
      if (!imageUrl.includes('.jpg') && !imageUrl.includes('.jpeg') && !imageUrl.includes('.png')) {
        continue;
      }
      
      // Skip small images (thumbnails, etc.)
      if (imageUrl.includes('150x') || imageUrl.includes('100x') || imageUrl.includes('thumb')) {
        continue;
      }
      
      console.log(`🔍 Found image: ${imageUrl} with alt: ${altText}`);
      
      // Match contestant names in alt text
      const contestantNames = [
        "Angela Murray", "Brooklyn Rivera", "Cam Sullivan-Brown", "Cedric Hodges", 
        "Chelsie Baham", "Joseph Rodriguez", "Kimo Apaka", "Leah Peters", 
        "Makensy Manbeck", "Quinn Martin", "Rubina Bernabe", "T'Kor Clottey", 
        "Tucker Des Lauriers", "Lisa Weintraub", "Kenney Kelley", "Matt Hardeman"
      ];
      
      for (const name of contestantNames) {
        // Handle special characters and punctuation in names
        const cleanName = name.toLowerCase()
          .replace(/[''`]/g, '')  // Remove apostrophes and backticks
          .replace(/[-]/g, ' ')   // Replace hyphens with spaces
          .replace(/[^a-z\s]/g, ''); // Remove other special chars
        const nameParts = cleanName.split(' ').filter(part => part.length > 0);
        const firstName = nameParts[0];
        const lastName = nameParts[nameParts.length - 1];
        
        // Clean alt text similarly
        const cleanAltText = altText.toLowerCase()
          .replace(/[''`]/g, '')
          .replace(/[-]/g, ' ')
          .replace(/[^a-z\s]/g, '');
        
        // Try exact match first, then partial match, then phonetic-like match
        const exactMatch = cleanAltText.includes(firstName) && cleanAltText.includes(lastName);
        const partialMatch = firstName.length > 3 && lastName.length > 3 && 
                           cleanAltText.includes(firstName.substring(0, 4)) && 
                           cleanAltText.includes(lastName.substring(0, 4));
        
        // Special case for T'Kor - also try "tkor"
        const specialMatch = (name.includes("T'Kor") || name.includes("T'kor")) && 
                           (cleanAltText.includes('tkor') || cleanAltText.includes('kor'));
        
        if (exactMatch || partialMatch || specialMatch) {
          // Validate the image URL
          const isValid = await validatePhotoUrl(imageUrl);
          if (isValid) {
            photoMap[name] = imageUrl;
            console.log(`✅ Matched ${name} to ${imageUrl}`);
            break;
          }
        }
      }
    }
    
    console.log(`📸 Found ${Object.keys(photoMap).length} contestant photos from GoldDerby`);
    return photoMap;
    
  } catch (error) {
    console.log(`❌ Error scraping GoldDerby gallery: ${error.message}`);
    return {};
  }
}