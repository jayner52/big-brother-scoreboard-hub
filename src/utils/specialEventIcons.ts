export const getSpecialEventIcon = (eventType: string): string => {
  const iconMap: Record<string, string> = {
    // BB Arena and Safety Events
    'bb_arena_winner': '🛡️',
    'won_bb_arena': '🛡️',
    'won_safety': '🛡️',
    'won_safety_comp': '🛡️',
    
    // Showmance events
    'showmance': '💕',
    'in_showmance': '💕',
    
    // Prize and punishment events
    'prize_won': '🎁',
    'wins_prize': '🎁',
    'given_prize': '🎁',
    'won_prize': '🎁',
    'wins_cash': '💰',
    'punishment': '⚠️',
    'receives_punishment': '⚠️',
    'received_penalty': '⚠️',
    'costume_punishment': '🤡',
    'won_secret_power': '🔮',
    'won_special_power': '🔮',
    'used_special_power': '⚡',
    
    // Power and safety events
    'special_power': '🔮',
    'power_from_hg': '🔮',
    'given_power': '🔮',
    'granted_safety': '🛡️',
    'safety': '🛡️',
    
    // Survival Events
    'survived_block_2x': '💪',
    'survived_block_4x': '🏰',
    'no_comp_wins_4weeks': '🛟',
    'block_survival_2_weeks': '💪',
    'block_survival_4_weeks': '🏰',
    'no_comp_4_weeks': '🛟',
    'floater_achievement': '🛟',
    
    // Social/Game Events
    'came_back_after_evicted': '🔄',
    'came_back_evicted': '🔄',
    'comeback': '🔄',
    'comes_back': '🔄',
    
    // Exit Events
    'self_evicted': '🚪',
    'removed_from_game': '❌',
    'removed_production': '❌',
    'left_not_eviction': '👋',
    'leaves_not_eviction': '👋',
    'leaves_early': '👋',
    
    // Game milestones
    'jury_member': '⚖️',
    'made_jury': '⚖️',
    'americas_favorite': '🌟',
    'afp_winner': '🌟',
    'winner': '👑',
    'season_winner': '👑',
    'runner_up': '🥈',
    
    // Default
    'custom': '✨',
    'custom_event': '✨'
  };

  return iconMap[eventType] || '📝';
};

export const getSpecialEventLegend = () => ({
  // Competition & Achievement Events
  '🛡️': 'Won BB Arena/Safety',
  '🔮': 'Won Special Power',
  '⚡': 'Used Special Power', 
  '🎁': 'Won Prize',
  
  // Survival Events
  '💪': '2+ Times Block Survival',
  '🏰': '4+ Times Block Survival',
  '🛟': '4+ Consecutive Weeks No Comp Wins (Floater)',
  
  // Social/Game Events
  '💕': 'In Showmance',
  '⚠️': 'Received Penalty/Punishment',
  '🤡': 'Costume Punishment',
  '🔄': 'Came Back After Evicted',
  
  // Exit Events
  '🚪': 'Self-Evicted',
  '❌': 'Removed by Production',
  
  // Finale Events
  '🌟': "America's Favorite Player",
  '🥈': 'Runner-up (2nd Place)',
  '👑': 'Season Winner (1st Place)',
  '⚖️': 'Made Jury',
  
  // Other
  '✨': 'Custom Event',
  '📝': 'Other Event'
});