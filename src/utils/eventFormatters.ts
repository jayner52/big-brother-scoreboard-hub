// Utility functions for formatting event types and descriptions

export const formatEventType = (eventType: string): string => {
  switch (eventType) {
    case 'hoh_winner':
      return 'Head of Household Winner';
    case 'pov_winner':
      return 'Power of Veto Winner';
    case 'nominee':
      return 'Nominated for Eviction';
    case 'replacement_nominee':
      return 'Replacement Nominee';
    case 'evicted':
      return 'Evicted from House';
    case 'survival':
      return 'Survived the Week';
    case 'jury_member':
      return 'Jury Member';
    case 'block_survival_2_weeks':
      return '2-Week Block Survival Bonus';
    case 'block_survival_4_weeks':
      return '4-Week Block Survival Bonus';
    case 'prize_won':
      return 'Prize Winner';
    case 'punishment':
      return 'Punishment Received';
    case 'americas_favorite':
      return "America's Favorite Player";
    case 'winner':
      return 'Season Winner';
    case 'runner_up':
      return 'Runner-up';
    default:
      // Convert snake_case to Title Case
      return eventType
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
  }
};

export const getEventDisplayText = (
  eventType: string, 
  description?: string | null
): string => {
  if (description && description.trim()) {
    return description;
  }
  return formatEventType(eventType);
};