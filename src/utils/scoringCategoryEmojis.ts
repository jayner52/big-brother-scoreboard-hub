
// Scoring Category Emoji Mappings
// Maps scoring rule categories and subcategories to appropriate emojis

export interface ScoringCategoryMapping {
  category: string;
  subcategory?: string;
  emoji: string;
  description: string;
}

// Define emoji mappings for all scoring categories - ALL UNIQUE EMOJIS
export const SCORING_CATEGORY_EMOJIS: Record<string, ScoringCategoryMapping[]> = {
  // Competition Events
  competition: [
    { category: 'competition', subcategory: 'hoh_winner', emoji: '🏆', description: 'Head of Household Winner' },
    { category: 'competition', subcategory: 'pov_winner', emoji: '🚫', description: 'Power of Veto Winner' },
    { category: 'competition', subcategory: 'ai_arena_winner', emoji: '🤖', description: 'AI Arena Winner' },
  ],

  // Weekly Events
  weekly: [
    { category: 'weekly', subcategory: 'nominee', emoji: '🎯', description: 'Nominated for Eviction' },
    { category: 'weekly', subcategory: 'replacement_nominee', emoji: '🔃', description: 'Replacement Nominee' },
    { category: 'weekly', subcategory: 'saved_by_veto', emoji: '🔓', description: 'Saved by Power of Veto' },
    { category: 'weekly', subcategory: 'survival', emoji: '💚', description: 'Survived Eviction' },
    { category: 'weekly', subcategory: 'bb_arena_winner', emoji: '🏟️', description: 'Won BB Arena (Safety from Eviction)' },
  ],

  // Special Achievements
  special_achievements: [
    { category: 'special_achievements', subcategory: 'block_survival_2_weeks', emoji: '🛟', description: '2+ Week Block Survival Bonus' },
    { category: 'special_achievements', subcategory: 'block_survival_4_weeks', emoji: '💪', description: '4+ Week Block Survival Bonus (Consecutive)' },
    { category: 'special_achievements', subcategory: 'floater_achievement', emoji: '🏰', description: 'Floater Achievement (4+ Consecutive Weeks No Comp Wins)' },
  ],

  // Jury Phase
  jury: [
    { category: 'jury', subcategory: 'jury_member', emoji: '⚖️', description: 'Made Jury' },
  ],

  // Final Placement
  final_placement: [
    { category: 'final_placement', subcategory: 'winner', emoji: '👑', description: 'Season Winner' },
    { category: 'final_placement', subcategory: 'runner_up', emoji: '🥈', description: 'Runner-up' },
    { category: 'final_placement', subcategory: 'americas_favorite', emoji: '🌟', description: "America's Favorite Player" },
  ],

  // Special Events (from existing config)
  special_events: [
    { category: 'special_events', subcategory: 'won_special_power', emoji: '🔮', description: 'Won Special Power/Advantage' },
    { category: 'special_events', subcategory: 'used_special_power', emoji: '⚡', description: 'Used Special Power' },
    { category: 'special_events', subcategory: 'won_prize', emoji: '🎁', description: 'Won Prize/Reward' },
    { category: 'special_events', subcategory: 'in_showmance', emoji: '💕', description: 'In a Showmance' },
    { category: 'special_events', subcategory: 'received_penalty', emoji: '⚠️', description: 'Received Penalty/Punishment' },
    { category: 'special_events', subcategory: 'costume_punishment', emoji: '🤡', description: 'Costume Punishment' },
    { category: 'special_events', subcategory: 'came_back_evicted', emoji: '↩️', description: 'Came Back After Evicted' },
    { category: 'special_events', subcategory: 'self_evicted', emoji: '🚪', description: 'Self-Evicted/Quit' },
    { category: 'special_events', subcategory: 'removed_production', emoji: '❌', description: 'Removed by Production' },
    { category: 'special_events', subcategory: 'won_safety_comp', emoji: '🔒', description: 'Won Safety Competition' },
    { category: 'special_events', subcategory: 'custom_event', emoji: '✨', description: 'Custom Event' },
  ]
};

// Get emoji for a specific scoring rule
export const getScoringRuleEmoji = (category: string, subcategory?: string): string => {
  const categoryMappings = SCORING_CATEGORY_EMOJIS[category];
  if (!categoryMappings) return '📝';

  if (subcategory) {
    const mapping = categoryMappings.find(m => m.subcategory === subcategory);
    if (mapping) return mapping.emoji;
  }

  // Return first emoji for category if no subcategory match
  return categoryMappings[0]?.emoji || '📝';
};

// Get category emoji for display in headers - ALL UNIQUE
export const getCategoryHeaderEmoji = (category: string): string => {
  const emojiMap: Record<string, string> = {
    competition: '🏁',      // Changed from 🏆 to avoid duplicate
    weekly: '📅',
    special_achievements: '🎖️',  // Changed from 🌟 to avoid duplicate  
    jury: '👨‍⚖️',             // Changed from ⚖️ to avoid duplicate
    final_placement: '🥇',   // Changed from 👑 to avoid duplicate
    special_events: '🎪'     // Changed from ⚡ to avoid duplicate
  };

  return emojiMap[category] || '📝';
};

// Get all emojis for a category (for legend display)
export const getCategoryEmojis = (category: string): ScoringCategoryMapping[] => {
  return SCORING_CATEGORY_EMOJIS[category] || [];
};
