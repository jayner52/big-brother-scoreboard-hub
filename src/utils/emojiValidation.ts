import { SCORING_CATEGORY_EMOJIS, getCategoryHeaderEmoji } from './scoringCategoryEmojis';

// Validation function to ensure no emoji duplicates
export const validateEmojiUniqueness = () => {
  const allEmojis: string[] = [];
  const duplicates: { emoji: string; locations: string[] }[] = [];

  // Collect all emojis from scoring categories
  Object.entries(SCORING_CATEGORY_EMOJIS).forEach(([category, mappings]) => {
    mappings.forEach(mapping => {
      const existingIndex = allEmojis.indexOf(mapping.emoji);
      if (existingIndex >= 0) {
        // Check if duplicate already recorded
        const existingDuplicate = duplicates.find(d => d.emoji === mapping.emoji);
        if (existingDuplicate) {
          existingDuplicate.locations.push(`${category}.${mapping.subcategory}`);
        } else {
          duplicates.push({
            emoji: mapping.emoji,
            locations: [`existing`, `${category}.${mapping.subcategory}`]
          });
        }
      } else {
        allEmojis.push(mapping.emoji);
      }
    });
  });

  // Collect category header emojis
  const categories = ['competition', 'weekly', 'special_achievements', 'jury', 'final_placement', 'special_events'];
  categories.forEach(category => {
    const headerEmoji = getCategoryHeaderEmoji(category);
    const existingIndex = allEmojis.indexOf(headerEmoji);
    if (existingIndex >= 0) {
      const existingDuplicate = duplicates.find(d => d.emoji === headerEmoji);
      if (existingDuplicate) {
        existingDuplicate.locations.push(`header.${category}`);
      } else {
        duplicates.push({
          emoji: headerEmoji,
          locations: [`existing`, `header.${category}`]
        });
      }
    } else {
      allEmojis.push(headerEmoji);
    }
  });

  return {
    totalEmojis: allEmojis.length,
    uniqueEmojis: allEmojis.filter((emoji, index, arr) => arr.indexOf(emoji) === index).length,
    duplicates,
    isValid: duplicates.length === 0
  };
};

// Run validation and log results
export const logEmojiValidation = () => {
  const validation = validateEmojiUniqueness();
  
  console.log('🔍 Emoji Validation Results:');
  console.log(`Total emojis: ${validation.totalEmojis}`);
  console.log(`Unique emojis: ${validation.uniqueEmojis}`);
  console.log(`Duplicates found: ${validation.duplicates.length}`);
  
  if (validation.duplicates.length > 0) {
    console.log('\n⚠️ Duplicate emojis found:');
    validation.duplicates.forEach(duplicate => {
      console.log(`  ${duplicate.emoji} appears in: ${duplicate.locations.join(', ')}`);
    });
  } else {
    console.log('\n✅ All emojis are unique!');
  }
  
  return validation;
};