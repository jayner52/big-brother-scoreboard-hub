
import { SCORING_CATEGORY_EMOJIS } from './scoringCategoryEmojis';
import { getSpecialEventIcon, getSpecialEventLegend } from './specialEventIcons';

// Get all emojis currently used by the scoring system
export const getUsedEmojis = (): Set<string> => {
  const usedEmojis = new Set<string>();

  // Add emojis from scoring category mappings
  Object.values(SCORING_CATEGORY_EMOJIS).forEach(mappings => {
    mappings.forEach(mapping => {
      usedEmojis.add(mapping.emoji);
    });
  });

  // Add emojis from special event icons
  const specialEventLegend = getSpecialEventLegend();
  Object.keys(specialEventLegend).forEach(emoji => {
    usedEmojis.add(emoji);
  });

  return usedEmojis;
};

// Common emojis that could be used for special events
export const getAllAvailableEmojis = (): string[] => [
  // Activity & Competition
  '🎯', '🎪', '🎭', '🎨', '🎲', '🎸', '🎹', '🎺', '🎻', '🎤',
  
  // Objects & Items
  '📚', '📝', '📊', '📈', '📉', '🔧', '🔨', '🔩', '⚙️', '🛠️',
  
  // Nature & Weather
  '🌈', '⭐', '☀️', '🌙', '☁️', '⚡', '🔥', '💧', '🌊', '🌸',
  
  // Food & Drink
  '🍕', '🍔', '🍟', '🍗', '🍰', '🧁', '🍪', '🍫', '☕', '🥤',
  
  // Faces & Emotions
  '😄', '😊', '😎', '🤔', '😮', '😱', '🤗', '🤪', '🥳', '😤',
  
  // Animals
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐸', '🦄',
  
  // Transportation
  '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '✈️',
  
  // Symbols
  '💎', '🔮', '💰', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '⚡',
  
  // Miscellaneous
  '🌟', '💫', '✨', '🎊', '🎉', '🎈', '🎁', '🔔', '📢', '📣'
];

// Get emojis that are available for use (not already assigned)
export const getAvailableEmojis = (): string[] => {
  const usedEmojis = getUsedEmojis();
  const allEmojis = getAllAvailableEmojis();
  
  return allEmojis.filter(emoji => !usedEmojis.has(emoji));
};
