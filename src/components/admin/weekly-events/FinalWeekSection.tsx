import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Crown, Trophy, Heart, Zap } from 'lucide-react';
import { ContestantWithBio, WeeklyEventForm } from '@/types/admin';
import { useScoringRules } from '@/hooks/useScoringRules';
import { SpecialEventsDropdown } from '../special-events/SpecialEventsDropdown';
import { PointsEarnedSection } from '../weekly-overview/PointsEarnedSection';
import { useActivePool } from '@/hooks/useActivePool';

interface FinalWeekSectionProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
  activeContestants: ContestantWithBio[];
  contestants: ContestantWithBio[];
  pointsPreview?: Record<string, number>;
  evictedThisWeek?: string[];
}

export const FinalWeekSection: React.FC<FinalWeekSectionProps> = ({
  eventForm,
  setEventForm,
  activeContestants,
  contestants,
  pointsPreview = {},
  evictedThisWeek = [],
}) => {
  const activePool = useActivePool();
  const { getWinnerPoints, getRunnerUpPoints, getHohPoints, getPointsForEvent } = useScoringRules(activePool?.id);
  
  if (!eventForm.isFinalWeek) {
    return null;
  }

  return (
    <div className="space-y-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-lg font-semibold text-yellow-800">Final Week Awards</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Final HoH Winner */}
        <div>
          <Label className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-purple-500" />
            Final HoH Winner
            <Badge variant="secondary">{getHohPoints()} pts</Badge>
          </Label>
          <Select 
            value={eventForm.hohWinner || ''} 
            onValueChange={(value) => setEventForm(prev => ({ ...prev, hohWinner: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select final HoH" />
            </SelectTrigger>
            <SelectContent>
              {activeContestants.map(contestant => (
                <SelectItem key={contestant.id} value={contestant.name}>
                  <span className="flex items-center justify-between w-full">
                    <span>{contestant.name}</span>
                    {!contestant.isActive && (
                      <Badge variant="outline" className="text-xs ml-2">Evicted</Badge>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Winner */}
        <div>
          <Label className="flex items-center gap-2 mb-2">
            <Crown className="h-4 w-4 text-yellow-500" />
            Winner
            <Badge variant="secondary">{getWinnerPoints()} pts</Badge>
          </Label>
          <Select 
            value={eventForm.winner || ''} 
            onValueChange={(value) => setEventForm(prev => ({ ...prev, winner: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select winner" />
            </SelectTrigger>
            <SelectContent>
              {activeContestants.map(contestant => (
                <SelectItem key={contestant.id} value={contestant.name}>
                  <span className="flex items-center justify-between w-full">
                    <span>{contestant.name}</span>
                    {!contestant.isActive && (
                      <Badge variant="outline" className="text-xs ml-2">Evicted</Badge>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Runner Up */}
        <div>
          <Label className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-gray-500" />
            Runner-up
            <Badge variant="secondary">{getRunnerUpPoints()} pts</Badge>
          </Label>
          <Select 
            value={eventForm.runnerUp || ''} 
            onValueChange={(value) => setEventForm(prev => ({ ...prev, runnerUp: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select runner-up" />
            </SelectTrigger>
            <SelectContent>
              {activeContestants
                .filter(c => c.name !== eventForm.winner)
                .map(contestant => (
                  <SelectItem key={contestant.id} value={contestant.name}>
                    <span className="flex items-center justify-between w-full">
                      <span>{contestant.name}</span>
                      {!contestant.isActive && (
                        <Badge variant="outline" className="text-xs ml-2">Evicted</Badge>
                      )}
                    </span>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* America's Favorite */}
        <div>
          <Label className="flex items-center gap-2 mb-2">
            <Heart className="h-4 w-4 text-red-500" />
            America's Favorite
            <Badge variant="secondary">{getPointsForEvent('americas_favorite')} pts</Badge>
          </Label>
          <Select 
            value={eventForm.americasFavorite || ''} 
            onValueChange={(value) => setEventForm(prev => ({ ...prev, americasFavorite: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select AFP" />
            </SelectTrigger>
            <SelectContent>
              {/* AFP can be any contestant from the entire season - include all contestants */}
              {contestants.map(contestant => (
                <SelectItem key={contestant.id} value={contestant.name}>
                  <span className="flex items-center justify-between w-full">
                    <span>{contestant.name}</span>
                    {!contestant.isActive && (
                      <Badge variant="outline" className="text-xs ml-2">Evicted</Badge>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-700">
          <strong>Final Week Rules:</strong> Set Final HoH winner (Part 3), winner, runner-up, and America's Favorite Player. 
          Points will be awarded automatically based on placements.
        </p>
      </div>

      {/* Special Events Section for Final Week */}
      <div className="mt-4">
        <h4 className="text-md font-semibold text-yellow-800 mb-2">Special Events</h4>
        <p className="text-sm text-yellow-700 mb-4">
          Add any special events that occurred during the final week (jury buybacks, special powers, etc.)
        </p>
        {/* Import and use SpecialEventsDropdown */}
        <SpecialEventsDropdown
          week={16}
          selectedEvents={[]}
          onEventsChange={() => {}}
          contestants={activeContestants}
        />
      </div>

      {/* Points Section for Final Week */}
      <PointsEarnedSection 
        weekNumber={eventForm.week}
        contestantScores={Object.entries(pointsPreview).map(([name, points]) => ({
          name,
          weeklyTotal: points,
          cumulativeTotal: points // For final week, weekly and cumulative are the same
        }))}
        nominees={[]}
        replacementNominee={null}
        povUsed={false}
        povUsedOn={null}
        specialEvents={[]}
        allContestants={contestants.map(c => ({ name: c.name, is_active: c.isActive }))}
        evictedThisWeek={evictedThisWeek}
      />
    </div>
  );
};