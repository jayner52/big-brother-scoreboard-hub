// Special Events Configuration
// Defines all special events with categories and display information

export interface SpecialEventConfig {
  id: string;
  label: string;
  emoji: string;
  points?: number;
}

export const SPECIAL_EVENTS_CONFIG: {
  toggleable: SpecialEventConfig[];
  automatic: SpecialEventConfig[];
} = {
  // Events that can be toggled in pool settings and appear in weekly tracking
  toggleable: [
    { id: 'won_special_power', label: 'Won Special Power/Advantage', emoji: '🔮', points: 2 },
    { id: 'used_special_power', label: 'Used Special Power', emoji: '⚡', points: 1 },
    { id: 'won_prize', label: 'Won Prize/Reward', emoji: '🎁', points: 2 },
    { id: 'in_showmance', label: 'In a Showmance', emoji: '💕', points: 1 },
    { id: 'received_penalty', label: 'Received Penalty/Punishment', emoji: '⚠️', points: -2 },
    { id: 'costume_punishment', label: 'Costume Punishment', emoji: '🤡', points: -1 },
    { id: 'came_back_evicted', label: 'Came Back After Evicted', emoji: '🔄', points: 5 },
    { id: 'self_evicted', label: 'Self-Evicted/Quit', emoji: '🚪', points: -5 },
    { id: 'removed_production', label: 'Removed by Production', emoji: '❌', points: -5 },
    { id: 'won_safety_comp', label: 'Won Safety Competition', emoji: '🛡️', points: 1 },
    { id: 'custom_event', label: 'Custom Event', emoji: '✨', points: 1 }
  ],
  
  // Automatic events (shown in legend but not in settings/weekly)
  automatic: [
    { id: 'won_bb_arena', label: 'Won BB Arena/AI Arena', emoji: '🛡️', points: 2 },
    { id: 'survived_block_2x', label: '2+ Week Block Survival Bonus', emoji: '💪', points: 2 },
    { id: 'survived_block_4x', label: '4+ Week Block Survival Bonus', emoji: '🔥', points: 4 },
    { id: 'floater_achievement', label: 'Floater Achievement (4 consecutive weeks without wins)', emoji: '🛟', points: 2 },
    { id: 'afp_winner', label: "America's Favorite Player", emoji: '🌟', points: 10 },
    { id: 'runner_up', label: 'Runner-up (2nd Place)', emoji: '🥈', points: 15 },
    { id: 'season_winner', label: 'Season Winner (1st Place)', emoji: '👑', points: 25 },
    { id: 'made_jury', label: 'Made Jury', emoji: '⚖️', points: 3 }
  ]
};

// Get all events combined
export const getAllSpecialEvents = (): SpecialEventConfig[] => [
  ...SPECIAL_EVENTS_CONFIG.toggleable,
  ...SPECIAL_EVENTS_CONFIG.automatic
];

// Get event by ID
export const getSpecialEventById = (id: string): SpecialEventConfig | undefined => {
  return getAllSpecialEvents().find(event => event.id === id);
};

// Get default points for an event
export const getDefaultPointsForEvent = (eventId: string): number => {
  const event = getSpecialEventById(eventId);
  return event?.points || 0;
};