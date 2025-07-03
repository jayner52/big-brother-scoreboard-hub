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
        const firstName = name.split(' ')[0].toLowerCase();
        const lastName = name.split(' ')[1].toLowerCase();
        
        if (altText.includes(firstName) && altText.includes(lastName)) {
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