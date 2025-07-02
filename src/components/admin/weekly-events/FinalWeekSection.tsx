import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Crown, Trophy, Heart } from 'lucide-react';
import { ContestantWithBio, WeeklyEventForm } from '@/types/admin';

interface FinalWeekSectionProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
  activeContestants: ContestantWithBio[];
}

export const FinalWeekSection: React.FC<FinalWeekSectionProps> = ({
  eventForm,
  setEventForm,
  activeContestants,
}) => {
  if (!eventForm.isFinalWeek) {
    return null;
  }

  return (
    <div className="space-y-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-lg font-semibold text-yellow-800">Final Week Awards</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Winner */}
        <div>
          <Label className="flex items-center gap-2 mb-2">
            <Crown className="h-4 w-4 text-yellow-500" />
            Winner
            <Badge variant="secondary">15 pts</Badge>
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
                  {contestant.name}
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
            <Badge variant="secondary">10 pts</Badge>
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
                    {contestant.name}
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
            <Badge variant="secondary">5 pts</Badge>
          </Label>
          <Select 
            value={eventForm.americasFavorite || ''} 
            onValueChange={(value) => setEventForm(prev => ({ ...prev, americasFavorite: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select AFP" />
            </SelectTrigger>
            <SelectContent>
              {/* AFP can be any contestant from the entire season */}
              {activeContestants.map(contestant => (
                <SelectItem key={contestant.id} value={contestant.name}>
                  {contestant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-700">
          <strong>Final Week Rules:</strong> No nominations or POV ceremony. 
          Only set winner, runner-up, and America's Favorite Player. 
          Points will be awarded automatically based on placements.
        </p>
      </div>
    </div>
  );
};