import { supabase } from '@/integrations/supabase/client';

// Cache for scoring rule lookups to avoid repeated queries
let scoringRulesCache: Map<string, string> | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Service to efficiently lookup scoring rule UUIDs by subcategory
 * Maps UUID -> subcategory for event type identification
 */
export const getScoringRulesLookup = async (poolId?: string): Promise<Map<string, string>> => {
  // Create a cache key based on pool ID
  const cacheKey = poolId || 'global';
  
  // Return cached version if still valid
  if (scoringRulesCache && Date.now() < cacheExpiry) {
    return scoringRulesCache;
  }

  try {
    let query = supabase
      .from('detailed_scoring_rules')
      .select('id, subcategory')
      .eq('is_active', true);

    // Filter by pool_id if provided
    if (poolId) {
      query = query.eq('pool_id', poolId);
    }

    const { data: scoringRules, error } = await query;

    if (error) throw error;

    // Create UUID -> subcategory lookup map
    const lookup = new Map<string, string>();
    (scoringRules || []).forEach(rule => {
      if (rule.id && rule.subcategory) {
        lookup.set(rule.id, rule.subcategory);
      }
    });

    // Cache the result
    scoringRulesCache = lookup;
    cacheExpiry = Date.now() + CACHE_DURATION;

    console.log('📋 Scoring rules lookup cached:', lookup.size, 'rules loaded');
    return lookup;
  } catch (error) {
    console.error('❌ Error loading scoring rules lookup:', error);
    return new Map(); // Return empty map on error
  }
};

/**
 * Check if an event matches a specific subcategory
 * Handles both UUID (current) and string (legacy) event types
 */
export const isEventOfType = async (eventType: string, targetSubcategory: string, poolId?: string): Promise<boolean> => {
  // Handle legacy string format
  if (eventType?.length <= 20) {
    return eventType === targetSubcategory;
  }

  // Handle UUID format - look up subcategory
  const lookup = await getScoringRulesLookup(poolId);
  const subcategory = lookup.get(eventType);
  return subcategory === targetSubcategory;
};

/**
 * Get subcategory for a given event type UUID
 * Returns the subcategory string or null if not found
 */
export const getEventSubcategory = async (eventType: string, poolId?: string): Promise<string | null> => {
  // Handle legacy string format
  if (eventType?.length <= 20) {
    return eventType;
  }

  // Handle UUID format - look up subcategory
  const lookup = await getScoringRulesLookup(poolId);
  return lookup.get(eventType) || null;
};

/**
 * Check if event is any of the specified subcategories
 */
export const isEventAnyOfTypes = async (eventType: string, targetSubcategories: string[], poolId?: string): Promise<boolean> => {
  const subcategory = await getEventSubcategory(eventType, poolId);
  return subcategory ? targetSubcategories.includes(subcategory) : false;
};

/**
 * Clear the cache (useful for tests or when rules change)
 */
export const clearScoringRulesCache = (): void => {
  scoringRulesCache = null;
  cacheExpiry = 0;
};