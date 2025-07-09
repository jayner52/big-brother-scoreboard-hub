
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useScoringRules } from '@/hooks/useScoringRules';
import { useWeekAwareContestants } from '@/hooks/useWeekAwareContestants';
import { usePool } from '@/contexts/PoolContext';

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
  const { activePool } = usePool();
  const { allContestants: weekAwareContestants, evictedContestants } = useWeekAwareContestants(weekNumber);

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

  // Apply eviction styling based on week-aware contestant status
  const completeContestantScores = (weekAwareContestants.length > 0 ? weekAwareContestants : allContestants).map(contestant => {
    const existingScore = contestantScores.find(score => score.name === contestant.name);
    
    // Check if contestant has special events this week
    const hasSpecialEvent = specialEvents.some(event => 
      event.week_number === weekNumber && event.contestant_name === contestant.name
    );
    
    // Use week-aware eviction status
    const isEvictedThisWeek = evictedContestants.includes(contestant.name);
    
    return {
      name: contestant.name,
      weeklyTotal: existingScore?.weeklyTotal || 0,
      cumulativeTotal: existingScore?.cumulativeTotal || 0,
      isEvicted: isEvictedThisWeek,
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
            <div key={contestant.name} className={`flex flex-col justify-between p-2 rounded relative ${
              contestant.isEvicted ? 'bg-destructive/10 border border-destructive/20' : 'bg-background border border-border'
            } ${contestant.hasSpecialEvent ? 'ring-2 ring-purple-200' : ''}`}>
               <span className={`truncate text-xs ${contestant.isEvicted ? 'text-red-600 font-medium line-through' : ''}`}>
                 {contestant.name}
                 {contestant.isEvicted && <span className="text-red-500 text-xs ml-1">(Evicted)</span>}
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
