import { ContestantWithBio, DetailedScoringRule } from '@/types/admin';

export interface SpecialEventData {
  id?: string;
  contestant: string;
  eventType: string;
  weekNumber: number;
  description?: string;
  customPoints?: number;
  customDescription?: string;
  customEmoji?: string;
}

export interface ProcessedEvent {
  guestId: string;
  guestName: string;
  eventType: string;
  weekNumber: number;
  causesEviction: boolean;
  statusChange?: 'evicted' | 'unchanged' | 'revived';
}

export interface WeeklyOverview {
  evicted: string[];
  specialEvents: SpecialEventData[];
  weekNumber: number;
  validationErrors: ValidationError[];
}

export interface ValidationError {
  eventIndex: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Core Rule: Event Type to Status Mapping
 * Determines if an event type causes eviction based on subcategory
 */
export const isEvictionEvent = (eventType: string, scoringRules: DetailedScoringRule[]): boolean => {
  const rule = scoringRules.find(r => r.id === eventType);
  if (!rule) return false;
  
  // Map XML event types to database subcategories
  return rule.subcategory === 'removed_production' || rule.subcategory === 'self_evicted';
};

/**
 * Determines if an event type is a revival event
 */
export const isRevivalEvent = (eventType: string, scoringRules: DetailedScoringRule[]): boolean => {
  const rule = scoringRules.find(r => r.id === eventType);
  return rule?.subcategory === 'came_back_evicted';
};

/**
 * Deduplication Logic
 * Removes duplicate events based on guestId + weekNumber + eventType
 * Strategy: keepFirst
 */
export const deduplicateEvents = (events: SpecialEventData[]): SpecialEventData[] => {
  const seen = new Set<string>();
  const duplicateIndices = new Set<number>();
  
  const deduplicatedEvents = events.filter((event, index) => {
    const key = `${event.contestant}-${event.weekNumber}-${event.eventType}`;
    if (seen.has(key)) {
      duplicateIndices.add(index);
      return false;
    }
    seen.add(key);
    return true;
  });
  
  return deduplicatedEvents;
};

/**
 * Validates special events against the rules
 * This validation runs on the ORIGINAL events list to catch duplicates
 */
export const validateSpecialEvents = (
  events: SpecialEventData[], 
  contestants: ContestantWithBio[],
  scoringRules: DetailedScoringRule[]
): ValidationError[] => {
  const errors: ValidationError[] = [];
  const seen = new Set<string>();
  
  events.forEach((event, index) => {
    // Check for required fields
    if (!event.contestant) {
      errors.push({
        eventIndex: index,
        field: 'contestant',
        message: 'Contestant is required',
        severity: 'error'
      });
    }
    
    if (!event.eventType) {
      errors.push({
        eventIndex: index,
        field: 'eventType',
        message: 'Event type is required',
        severity: 'error'
      });
    }
    
    // Skip further validation if required fields are missing
    if (!event.contestant || !event.eventType) return;
    
    // Check for duplicates
    const key = `${event.contestant}-${event.weekNumber}-${event.eventType}`;
    if (seen.has(key)) {
      errors.push({
        eventIndex: index,
        field: 'duplicate',
        message: `Duplicate event: ${event.contestant} already has this event type for week ${event.weekNumber}`,
        severity: 'error'
      });
    }
    seen.add(key);
    
    // Validate contestant exists
    const contestant = contestants.find(c => c.name === event.contestant);
    if (!contestant) {
      errors.push({
        eventIndex: index,
        field: 'contestant',
        message: 'Selected contestant does not exist',
        severity: 'error'
      });
      return;
    }
    
    // Validate revival events (can only be applied to evicted contestants)
    if (isRevivalEvent(event.eventType, scoringRules)) {
      if (contestant.isActive) {
        errors.push({
          eventIndex: index,
          field: 'contestant',
          message: "Can only apply 'Came Back After Evicted' to contestants who were previously evicted",
          severity: 'error'
        });
      }
    }
    
    // Validate eviction events (can only be applied to active contestants)
    if (isEvictionEvent(event.eventType, scoringRules)) {
      if (!contestant.isActive) {
        errors.push({
          eventIndex: index,
          field: 'contestant',
          message: 'Can only apply eviction events to active contestants',
          severity: 'error'
        });
      }
    }
  });
  
  return errors;
};

/**
 * Process events with rules
 * Returns processed events with status changes
 */
export const processWeeklyEvents = (
  events: SpecialEventData[], 
  contestants: ContestantWithBio[],
  scoringRules: DetailedScoringRule[]
): WeeklyOverview => {
  // CRITICAL FIX: Validate BEFORE deduplication to catch duplicates
  const validationErrors = validateSpecialEvents(events, contestants, scoringRules);
  
  // Then deduplicate for processing
  const uniqueEvents = deduplicateEvents(events);
  
  // Process each event
  const evictedGuests: string[] = [];
  const revivedGuests: string[] = [];
  const nonEvictionEvents: SpecialEventData[] = [];
  
  uniqueEvents.forEach(event => {
    const contestant = contestants.find(c => c.name === event.contestant);
    if (!contestant) return;
    
    if (isEvictionEvent(event.eventType, scoringRules)) {
      evictedGuests.push(event.contestant);
    } else if (isRevivalEvent(event.eventType, scoringRules)) {
      revivedGuests.push(event.contestant);
    } else {
      nonEvictionEvents.push(event);
    }
  });
  
  return {
    evicted: evictedGuests,
    specialEvents: nonEvictionEvents,
    weekNumber: events[0]?.weekNumber || 1,
    validationErrors
  };
};

/**
 * Get available contestants for a specific event type
 */
export const getAvailableContestantsForEvent = (
  eventType: string,
  contestants: ContestantWithBio[],
  scoringRules: DetailedScoringRule[]
): ContestantWithBio[] => {
  if (!eventType) return [];
  
  if (isRevivalEvent(eventType, scoringRules)) {
    // Only show evicted contestants for revival events
    return contestants.filter(c => !c.isActive);
  }
  
  if (isEvictionEvent(eventType, scoringRules)) {
    // Only show active contestants for eviction events
    return contestants.filter(c => c.isActive);
  }
  
  // For all other events, show all contestants
  return contestants;
};