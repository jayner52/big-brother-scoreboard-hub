
import React from 'react';
import { Badge } from '@/components/ui/badge';

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
  // Create a complete list showing all contestants with their points or 0
  const completeContestantScores = allContestants.map(contestant => {
    const existingScore = contestantScores.find(score => score.name === contestant.name);
    const isEvicted = evictedThisWeek.includes(contestant.name);
    
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

      {/* Special Events Summary for this week */}
      {specialEvents.filter(event => event.week_number === weekNumber).length > 0 && (
        <div className="mt-3 p-2 bg-purple-50 rounded border border-purple-200">
          <div className="text-xs font-medium text-purple-800 mb-1">Special Events:</div>
          <div className="flex flex-wrap gap-1">
            {specialEvents
              .filter(event => event.week_number === weekNumber)
              .map((event, index) => (
                <Badge key={index} variant="outline" className="text-xs border-purple-300 text-purple-700">
                  {event.contestant_name}: {event.points_awarded > 0 ? '+' : ''}{event.points_awarded}
                </Badge>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
