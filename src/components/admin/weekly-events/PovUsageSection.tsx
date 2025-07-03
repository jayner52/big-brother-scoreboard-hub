import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ContestantWithBio, WeeklyEventForm } from '@/types/admin';

interface PovUsageSectionProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
  activeContestants: ContestantWithBio[];
}

export const PovUsageSection: React.FC<PovUsageSectionProps> = ({
  eventForm,
  setEventForm,
  activeContestants,
}) => {
  if (!eventForm.povWinner || eventForm.povWinner === 'no-winner') {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          checked={eventForm.povUsed}
          onCheckedChange={(checked) => setEventForm(prev => ({ 
            ...prev, 
            povUsed: checked,
            povUsedOn: checked ? prev.povUsedOn : '',
            replacementNominee: checked ? prev.replacementNominee : ''
          }))}
        />
        <Label>POV was used</Label>
      </div>

      {eventForm.povUsed && (
        <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div>
            <Label className="font-semibold flex items-center gap-2">
              POV Used On
              <Badge variant="secondary">+1 pt (saved by veto)</Badge>
            </Label>
            <Select 
              value={eventForm.povUsedOn || ''} 
              onValueChange={(value) => setEventForm(prev => ({ ...prev, povUsedOn: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Who was saved by POV?" />
              </SelectTrigger>
              <SelectContent>
                {eventForm.nominees
                  .filter(nominee => nominee)
                  .map(nominee => (
                    <SelectItem key={nominee} value={nominee}>
                      {nominee}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="font-semibold">Replacement Nominee</Label>
            <Select 
              value={eventForm.replacementNominee || ''} 
              onValueChange={(value) => setEventForm(prev => ({ ...prev, replacementNominee: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select replacement nominee" />
              </SelectTrigger>
              <SelectContent>
                {activeContestants
                  .filter(c => 
                    !eventForm.nominees.includes(c.name) && 
                    c.name !== eventForm.povWinner &&
                    c.name !== eventForm.povUsedOn &&
                    c.name !== eventForm.hohWinner
                  )
                  .map(contestant => (
                    <SelectItem key={contestant.id} value={contestant.name}>
                      {contestant.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Cannot be HOH winner, POV winner, or person saved by POV
            </p>
          </div>
        </div>
      )}
    </div>
  );
};