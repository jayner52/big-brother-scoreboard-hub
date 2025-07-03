export const getSpecialEventIcon = (eventType: string): string => {
  const iconMap: Record<string, string> = {
    'bb_arena_winner': '🏟️',
    'prize_won': '🎁',
    'punishment': '⚡',
    'showmance': '💕',
    'special_power': '🔮',
    'comes_back': '🔄',
    'americas_favorite': '⭐',
    'winner': '🏆',
    'runner_up': '🥈',
    'custom': '✨',
    'block_survival_2_weeks': '💪',
    'block_survival_4_weeks': '🛡️',
    'jury_member': '⚖️',
    'leaves_not_eviction': '🚪',
    'no_comp_4_weeks': '😴',
    'costume_punishment': '🎭',
    'granted_safety': '🛡️',
    'wins_prize': '🎁',
    'receives_punishment': '⚡'
  };

  return iconMap[eventType] || '📝';
};

export const getSpecialEventLegend = () => ({
  '🏟️': 'BB Arena Winner',
  '🎁': 'Prize Won',
  '⚡': 'Punishment',
  '💕': 'Showmance',
  '🔮': 'Special Power',
  '🔄': 'Comes Back',
  '⭐': "America's Favorite",
  '🏆': 'Winner',
  '🥈': 'Runner-up',
  '✨': 'Custom Event',
  '💪': '2-Week Block Survival',
  '🛡️': 'Safety/4-Week Block Survival',
  '⚖️': 'Jury Member',
  '🚪': 'Left Not by Eviction',
  '😴': '4 Weeks No Comp Wins',
  '🎭': 'Costume Punishment',
  '📝': 'Other Event'
});