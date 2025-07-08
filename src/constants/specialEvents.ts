// Special Events Configuration
// Defines all special events with categories and display information

export interface SpecialEventConfig {
  id: string;
  label: string;
  emoji: string;
  points?: number;
}

// Special Events Configuration - SIMPLIFIED
// Now using database scoring rules as single source of truth for configurable events
// Only automatic events that don't need admin configuration are stored here

export const SPECIAL_EVENTS_CONFIG: {
  automatic: SpecialEventConfig[];
} = {
  // Automatic events (calculated automatically, shown in legend but not in weekly admin)
  automatic: [
    { id: 'won_bb_arena', label: 'Won BB Arena/AI Arena', emoji: '🏟️', points: 2 },
    { id: 'survived_block_2x', label: '2+ Week Block Survival Bonus', emoji: '🛟', points: 2 },
    { id: 'survived_block_4x', label: '4+ Week Block Survival Bonus', emoji: '💪', points: 4 },
    { id: 'floater_achievement', label: 'Floater Achievement (4 consecutive weeks without wins)', emoji: '🏰', points: 2 },
    { id: 'afp_winner', label: "America's Favorite Player", emoji: '🌟', points: 10 },
    { id: 'runner_up', label: 'Runner-up (2nd Place)', emoji: '🥈', points: 15 },
    { id: 'season_winner', label: 'Season Winner (1st Place)', emoji: '👑', points: 25 },
    { id: 'made_jury', label: 'Made Jury', emoji: '⚖️', points: 3 }
  ]
};

// Get all automatic events
export const getAllSpecialEvents = (): SpecialEventConfig[] => [
  ...SPECIAL_EVENTS_CONFIG.automatic
];

// Get event by ID
export const getSpecialEventById = (id: string): SpecialEventConfig | undefined => {
  return getAllSpecialEvents().find(event => event.id === id);
};

// Get default points for an event
export const getDefaultPointsForEvent = (eventId: string): number => {
  const event = getSpecialEventById(eventId);
  return event?.points || 1;
};

// Predefined emoji options for custom events
export const CUSTOM_EVENT_EMOJIS = [
  '✨', '🎪', '🎭', '🎨', '🎵', '🎸', '🎤', '🎬', '🎮',
  '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '👑', '💎', '⭐', '🌟',
  '💫', '🔥', '💥', '⚡', '🌈', '🎊', '🎉', '🎁', '💝', '🎀',
  '💯', '🔮', '🍀', '🦄', '🌸', '🌺', '🌻', '🌼', '🌷', '🌹',
  '💖', '💕', '💘', '💗', '💓', '💟', '❤️', '🧡', '💛', '💚',
  '💙', '💜', '🤍', '🖤', '🤎', '💔', '❣️', '💋', '👑', '💍'
];