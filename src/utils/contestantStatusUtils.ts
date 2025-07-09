import { ContestantWithBio } from '@/types/admin';

/**
 * Centralized utility functions for contestant status management
 * Single source of truth: contestants.is_active field
 */

export const getContestantStatusStyling = (isActive: boolean): string => {
  return isActive ? '' : 'text-red-500 line-through';
};

export const getAdminStatusStyling = (isActive: boolean): string => {
  return isActive ? '' : 'text-red-600';
};

export const getContestantStatusLabel = (isActive: boolean): string => {
  return isActive ? 'Active' : 'Evicted';
};

export const getContestantStatusBadge = (isActive: boolean) => ({
  variant: isActive ? 'default' as const : 'destructive' as const,
  text: isActive ? 'Active' : 'Evicted'
});

export const groupContestantsByStatus = (contestants: ContestantWithBio[]) => {
  return contestants.reduce(
    (groups, contestant) => {
      if (contestant.isActive) {
        groups.active.push(contestant);
      } else {
        groups.evicted.push(contestant);
      }
      return groups;
    },
    { active: [] as ContestantWithBio[], evicted: [] as ContestantWithBio[] }
  );
};

export const filterActiveContestants = (contestants: ContestantWithBio[]): ContestantWithBio[] => {
  return contestants.filter(contestant => contestant.isActive);
};

export const filterEvictedContestants = (contestants: ContestantWithBio[]): ContestantWithBio[] => {
  return contestants.filter(contestant => !contestant.isActive);
};

/**
 * Determines if a contestant should be available for selection in dropdowns
 * Based on event type and current contestant status
 */
export const isContestantAvailableForEvent = (
  contestant: ContestantWithBio,
  eventType: string
): boolean => {
  // For most events, only active contestants are available
  // Special events like "came back after evicted" might need evicted contestants
  const evictionRelatedEvents = ['came_back_evicted'];
  
  if (evictionRelatedEvents.includes(eventType)) {
    return !contestant.isActive; // Only evicted contestants can come back
  }
  
  return contestant.isActive; // Default: only active contestants
};