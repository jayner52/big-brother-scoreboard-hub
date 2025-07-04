export const getSpecialEventIcon = (eventType: string): string => {
  const iconMap: Record<string, string> = {
    // Competition events
    'bb_arena_winner': '🏟️',
    'hoh_winner': '👑',
    'pov_winner': '🔑',
    
    // Showmance events
    'showmance': '💕',
    'in_showmance': '💕',
    
    // Prize and punishment events
    'prize_won': '🎁',
    'wins_prize': '🎁',
    'given_prize': '🎁',
    'wins_cash': '💰',
    'punishment': '⚡',
    'receives_punishment': '⚡',
    'costume_punishment': '🎭',
    
    // Power and safety events
    'special_power': '🔮',
    'power_from_hg': '🔮',
    'given_power': '🔮',
    'granted_safety': '🛡️',
    'safety': '🛡️',
    
    // Game milestones
    'jury_member': '⚖️',
    'americas_favorite': '⭐',
    'winner': '🏆',
    'runner_up': '🥈',
    
    // Survival and strategy
    'comes_back': '🔄',
    'comeback': '🔄',
    'block_survival_2_weeks': '💪',
    'block_survival_4_weeks': '🏰',
    'no_comp_4_weeks': '😴',
    'leaves_not_eviction': '🚪',
    'leaves_early': '🚪',
    
    // Default
    'custom': '✨'
  };

  return iconMap[eventType] || '📝';
};

export const getSpecialEventLegend = () => ({
  '🏟️': 'BB Arena Winner',
  '👑': 'Head of Household',
  '🔑': 'Power of Veto Winner',
  '💕': 'Showmance',
  '🎁': 'Prize Won',
  '💰': 'Cash Prize',
  '⚡': 'Punishment',
  '🎭': 'Costume Punishment',
  '🔮': 'Special Power',
  '🛡️': 'Safety',
  '⚖️': 'Jury Member',
  '⭐': "America's Favorite",
  '🏆': 'Winner',
  '🥈': 'Runner-up',
  '🔄': 'Comeback',
  '💪': '2-Week Block Survival',
  '🏰': '4-Week Block Survival',
  '😴': '4 Weeks No Comp Wins',
  '🚪': 'Left Not by Eviction',
  '✨': 'Custom Event',
  '📝': 'Other Event'
});