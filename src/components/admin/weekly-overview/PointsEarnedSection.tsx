
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useScoringRules } from '@/hooks/useScoringRules';

interface ContestantScore {
  name: string;
  weeklyTotal: number;
  cumulativeTotal: number;
}

interface Contestant {
  name: string;
  is_active: boolean;
}

interface SpecialEvent {
  week_number: number;
  contestant_name: string;
  event_type: string;
  description?: string;
  points_awarded: number;
}

interface PointsEarnedSectionProps {
  weekNumber: number;
  contestantScores?: ContestantScore[];
  nominees?: string[];
  replacementNominee?: string | null;
  povUsed?: boolean;
  povUsedOn?: string | null;
  specialEvents?: SpecialEvent[];
  allContestants?: Contestant[];
  evictedThisWeek?: string[];
}

export const PointsEarnedSection: React.FC<PointsEarnedSectionProps> = ({
  weekNumber,
  contestantScores = [],
  nominees = [],
  replacementNominee,
  povUsed,
  povUsedOn,
  specialEvents = [],
  allContestants = [],
  evictedThisWeek = []
}) => {
  const { scoringRules } = useScoringRules();

  // Helper function to check if an event is a quit event by looking up scoring rules
  const isQuitEvent = (eventType: string) => {
    // First try to find by subcategory (for legacy string-based events)
    let rule = scoringRules.find(r => r.subcategory === eventType);
    // If not found, try to find by ID (for UUID-based events)
    if (!rule) {
      rule = scoringRules.find(r => r.id === eventType);
    }
    return rule && (rule.subcategory === 'self_evicted' || rule.subcategory === 'removed_production');
  };

  // Create a complete list showing all contestants with their points or 0
  const completeContestantScores = allContestants.map(contestant => {
    const existingScore = contestantScores.find(score => score.name === contestant.name);
    
    // Check if contestant is evicted - either passed in evictedThisWeek or marked inactive due to special events
    const isEvictedThisWeek = evictedThisWeek.includes(contestant.name);
    
    // Check if contestant quit this week using the proper event type checking
    const quitThisWeek = specialEvents.some(event => 
      event.week_number === weekNumber && 
      event.contestant_name === contestant.name &&
      isQuitEvent(event.event_type)
    );
    
    // Check if contestant has quit in any previous week using the proper event type checking
    const hasQuitEvent = specialEvents.some(event => 
      event.week_number <= weekNumber && 
      event.contestant_name === contestant.name &&
      isQuitEvent(event.event_type)
    );
    
    // A contestant is considered evicted if:
    // 1. They were evicted this week (traditional eviction)
    // 2. They quit this week (self_evicted or removed_production)
    // 3. They quit in a previous week
    // 4. They are marked as inactive in the database
    const isEvicted = isEvictedThisWeek || quitThisWeek || hasQuitEvent || !contestant.is_active;
    
    // Check if contestant has special events this week
    const hasSpecialEvent = specialEvents.some(event => 
      event.week_number === weekNumber && event.contestant_name === contestant.name
    );
    
    return {
      name: contestant.name,
      weeklyTotal: existingScore?.weeklyTotal || 0,
      cumulativeTotal: existingScore?.cumulativeTotal || 0,
      isEvicted,
      hasSpecialEvent
    };
  });

  return (
    <div>
      <h4 className="font-medium mb-2">Points Earned This Week</h4>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-sm">
        {completeContestantScores
          .sort((a, b) => b.weeklyTotal - a.weeklyTotal)
          .map((contestant) => (
            <div key={contestant.name} className={`flex flex-col justify-between bg-gray-50 p-2 rounded relative ${
              contestant.hasSpecialEvent ? 'ring-2 ring-purple-200 bg-purple-50' : ''
            }`}>
              <span className={`truncate text-xs ${contestant.isEvicted ? 'text-red-600 line-through' : ''}`}>
                {contestant.name}
                {contestant.hasSpecialEvent && <span className="text-purple-600 ml-1">⚡</span>}
              </span>
              <span className={`font-bold text-sm ${
                contestant.weeklyTotal > 0 ? 'text-green-600' : 
                contestant.weeklyTotal < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {contestant.weeklyTotal > 0 ? '+' : ''}{contestant.weeklyTotal}
              </span>
            </div>
          ))}
      </div>
      
      {/* Nominees details */}
      {nominees.length > 0 && (
        <div className="text-xs text-gray-500 mt-2">
          <div>
            Nominees: {nominees.map((nominee, index) => {
              const isSavedByVeto = povUsed && povUsedOn === nominee;
              const isSavedByArena = specialEvents.some(event => 
                event.week_number === weekNumber && 
                event.event_type === 'bb_arena_winner' && 
                event.contestant_name === nominee
              );
              return (
                <span key={index}>
                  {index > 0 && ', '}
                  {isSavedByVeto || isSavedByArena ? (
                    <span className="line-through">{nominee}</span>
                  ) : (
                    nominee
                  )}
                </span>
              );
            })}
            {replacementNominee && (
              <span>, Replacement: {replacementNominee}</span>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
