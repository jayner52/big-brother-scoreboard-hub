import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ResultTile } from './ResultTile';
import { PointsEarnedSection } from './PointsEarnedSection';
import { Users } from 'lucide-react';

interface WeekSummary {
  week_number: number;
  hoh_winner: string | null;
  pov_winner: string | null;
  evicted_contestant: string | null;
  is_double_eviction: boolean | null;
  second_hoh_winner: string | null;
  second_pov_winner: string | null;
  second_evicted_contestant: string | null;
  pov_used: boolean | null;
  pov_used_on: string | null;
  nominees: string[] | null;
  replacement_nominee: string | null;
  second_nominees?: string[] | null;
  second_pov_used?: boolean | null;
  second_pov_used_on?: string | null;
  second_replacement_nominee?: string | null;
}

interface ContestantScore {
  name: string;
  weeklyTotal: number;
  cumulativeTotal: number;
}

interface DoubleEvictionDisplayProps {
  week: WeekSummary;
  contestantScores?: ContestantScore[];
  specialEvents?: any[];
}

export const DoubleEvictionDisplay: React.FC<DoubleEvictionDisplayProps> = ({
  week,
  contestantScores = [],
  specialEvents = []
}) => {
  const formatNominees = (nominees: string[] | null, povUsed: boolean | null, povUsedOn: string | null) => {
    if (!nominees || nominees.length === 0) return "N/A";
    
    let displayNominees = [...nominees];
    if (povUsed && povUsedOn && nominees.includes(povUsedOn)) {
      // Show replacement nominee if POV was used
      const savedIndex = displayNominees.indexOf(povUsedOn);
      displayNominees[savedIndex] = `${povUsedOn} (saved)`;
      if (week.replacement_nominee) {
        displayNominees.push(week.replacement_nominee);
      }
    }
    
    return displayNominees.join(' & ');
  };

  const formatSecondNominees = (nominees: string[] | null, povUsed: boolean | null, povUsedOn: string | null) => {
    if (!nominees || nominees.length === 0) return "N/A";
    
    let displayNominees = [...nominees];
    if (povUsed && povUsedOn && nominees.includes(povUsedOn)) {
      const savedIndex = displayNominees.indexOf(povUsedOn);
      displayNominees[savedIndex] = `${povUsedOn} (saved)`;
      if (week.second_replacement_nominee) {
        displayNominees.push(week.second_replacement_nominee);
      }
    }
    
    return displayNominees.join(' & ');
  };

  return (
    <div className="space-y-6">
      {/* Double Eviction Banner */}
      <div className="text-center py-2 px-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-bold">
        ⚡ DOUBLE EVICTION NIGHT ⚡
      </div>

      {/* First Eviction Block */}
      <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50/30">
        <h4 className="font-semibold text-lg mb-3 text-red-800">First Eviction</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ResultTile 
            label="HOH" 
            value={week.hoh_winner || "N/A"} 
            iconType="hoh" 
            colorScheme="yellow"
          />
          <ResultTile 
            label="Nominees" 
            value={formatNominees(week.nominees, week.pov_used, week.pov_used_on)}
            iconType="nominees"
            colorScheme="orange"
          />
          <ResultTile 
            label="POV" 
            value={week.pov_winner || "N/A"} 
            iconType="pov" 
            colorScheme="green"
            subtitle={week.pov_used ? `Used on ${week.pov_used_on}${week.replacement_nominee ? ` → ${week.replacement_nominee}` : ''}` : undefined}
          />
          <ResultTile 
            label="Evicted" 
            value={week.evicted_contestant || "N/A"} 
            iconType="evicted" 
            colorScheme="red"
          />
        </div>
      </div>

      {/* Second Eviction Block */}
      <div className="border-2 border-red-300 rounded-lg p-4 bg-red-100/30">
        <h4 className="font-semibold text-lg mb-3 text-red-900">Second Eviction</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ResultTile 
            label="HOH" 
            value={week.second_hoh_winner || "N/A"} 
            iconType="hoh" 
            colorScheme="yellow"
          />
          <ResultTile 
            label="Nominees" 
            value={formatSecondNominees(week.second_nominees, week.second_pov_used, week.second_pov_used_on)}
            iconType="nominees"
            colorScheme="orange"
          />
          <ResultTile 
            label="POV" 
            value={week.second_pov_winner || "N/A"} 
            iconType="pov" 
            colorScheme="green"
            subtitle={week.second_pov_used ? `Used on ${week.second_pov_used_on}${week.second_replacement_nominee ? ` → ${week.second_replacement_nominee}` : ''}` : undefined}
          />
          <ResultTile 
            label="Evicted" 
            value={week.second_evicted_contestant || "N/A"} 
            iconType="evicted" 
            colorScheme="red"
          />
        </div>
      </div>

      {/* Points Section - Always show */}
      <PointsEarnedSection 
        weekNumber={week.week_number}
        contestantScores={contestantScores}
        nominees={[...(week.nominees || []), ...(week.second_nominees || [])]}
        replacementNominee={week.replacement_nominee}
        povUsed={week.pov_used}
        povUsedOn={week.pov_used_on}
        specialEvents={specialEvents}
      />
    </div>
  );
};