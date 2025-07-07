import React from 'react';

interface ContestantScore {
  name: string;
  weeklyTotal: number;
  cumulativeTotal: number;
}

interface PointsEarnedSectionProps {
  weekNumber: number;
  contestantScores?: ContestantScore[];
  nominees?: string[];
  replacementNominee?: string | null;
  povUsed?: boolean;
  povUsedOn?: string | null;
  specialEvents?: any[];
}

export const PointsEarnedSection: React.FC<PointsEarnedSectionProps> = ({
  weekNumber,
  contestantScores = [],
  nominees = [],
  replacementNominee,
  povUsed,
  povUsedOn,
  specialEvents = []
}) => {
  return (
    <div>
      <h4 className="font-medium mb-2">Points Earned This Week</h4>
      {contestantScores.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-sm">
          {contestantScores
            .sort((a, b) => b.weeklyTotal - a.weeklyTotal)
            .map((contestant) => (
              <div key={contestant.name} className="flex justify-between bg-gray-50 p-2 rounded">
                <span className="truncate">{contestant.name}</span>
                <span className={`font-bold ${
                  contestant.weeklyTotal > 0 ? 'text-green-600' : 
                  contestant.weeklyTotal < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {contestant.weeklyTotal > 0 ? '+' : ''}{contestant.weeklyTotal}
                </span>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
          No points recorded this week
        </div>
      )}
      
      {/* Nominees details */}
      {nominees.length > 0 && (
        <div className="text-xs text-gray-500 mt-2">
          <div>
            Nominees: {nominees.map((nominee, index) => {
              const isSavedByVeto = povUsed && povUsedOn === nominee;
              const isSavedByArena = specialEvents.some(event => 
                event.week_number === weekNumber && 
                event.event_type === 'bb_arena_winner' && 
                (event.contestants as any)?.name === nominee
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