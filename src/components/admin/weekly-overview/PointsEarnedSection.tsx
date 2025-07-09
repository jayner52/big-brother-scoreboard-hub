
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useScoringRules } from '@/hooks/useScoringRules';
import { getContestantStatusStyling } from '@/utils/contestantStatusUtils';

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
  // CRITICAL FIX: Use the centralized is_active field as the single source of truth
  const completeContestantScores = allContestants.map(contestant => {
    const existingScore = contestantScores.find(score => score.name === contestant.name);
    
    // SIMPLIFIED LOGIC: Use the database is_active field as the single source of truth
    // The database trigger already handles all eviction scenarios correctly
    const isEvicted = !contestant.is_active;
    
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
              <span className={`truncate text-xs ${getContestantStatusStyling(contestant.isEvicted)}`}>
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
