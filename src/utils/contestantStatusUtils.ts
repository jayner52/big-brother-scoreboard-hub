
import { ContestantWithBio } from '@/types/admin';

/**
 * Centralized utility functions for contestant status management
 * Single source of truth: contestants.is_active field
 */

// Removed line-through styling - use contextual visual indicators instead
export const getContestantVisualStyling = (isEvicted: boolean): string => {
  return isEvicted ? 'opacity-70' : '';
};

export const getAdminStatusStyling = (isEvicted: boolean): string => {
  return isEvicted ? 'text-red-600' : '';
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

/**
 * CRITICAL EVICTION DETECTION RULES
 * 
 * A contestant is considered evicted (is_active = false) when ANY of these occur:
 * 1. They appear in weekly_results.evicted_contestant for any week
 * 2. They appear in weekly_results.second_evicted_contestant for any week  
 * 3. They appear in weekly_results.third_evicted_contestant for any week
 * 4. They have a weekly_events entry with event_type matching a scoring rule where subcategory = 'self_evicted'
 * 5. They have a weekly_events entry with event_type matching a scoring rule where subcategory = 'removed_production'
 * 
 * A contestant can ONLY be reactivated (is_active = true) when:
 * 1. They have a special_events entry with event_type matching a scoring rule where subcategory = 'came_back_evicted'
 * 
 * The database trigger maintain_contestant_status() automatically enforces these rules.
 */
