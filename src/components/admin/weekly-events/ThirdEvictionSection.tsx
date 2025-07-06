import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { WeeklyEventForm } from '@/types/admin';
import { ContestantWithBio } from '@/types/admin';

interface ThirdEvictionSectionProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
  activeContestants: ContestantWithBio[];
  contestants: ContestantWithBio[];
}

export const ThirdEvictionSection: React.FC<ThirdEvictionSectionProps> = ({
  eventForm,
  setEventForm,
  activeContestants,
  contestants,
}) => {
  const remainingContestants = activeContestants.filter(c => 
    c.name !== eventForm.evicted && 
    c.name !== eventForm.secondEvicted
  );

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-800">Third Eviction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Third HOH Winner */}
        <div>
          <Label htmlFor="third-hoh">Third Head of Household Winner</Label>
          <Select
            value={eventForm.thirdHohWinner || ''}
            onValueChange={(value) => setEventForm(prev => ({ ...prev, thirdHohWinner: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select HOH winner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-winner">No Winner</SelectItem>
              {remainingContestants.map((contestant) => (
                <SelectItem key={contestant.id} value={contestant.name}>
                  {contestant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Third Nominees */}
        <div>
          <Label>Third Nominees</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="third-nominee-1">Nominee 1</Label>
              <Select
                value={eventForm.thirdNominees?.[0] || ''}
                onValueChange={(value) => setEventForm(prev => ({
                  ...prev,
                  thirdNominees: [value, prev.thirdNominees?.[1] || '']
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select nominee" />
                </SelectTrigger>
                <SelectContent>
                  {remainingContestants.map((contestant) => (
                    <SelectItem key={contestant.id} value={contestant.name}>
                      {contestant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="third-nominee-2">Nominee 2</Label>
              <Select
                value={eventForm.thirdNominees?.[1] || ''}
                onValueChange={(value) => setEventForm(prev => ({
                  ...prev,
                  thirdNominees: [prev.thirdNominees?.[0] || '', value]
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select nominee" />
                </SelectTrigger>
                <SelectContent>
                  {remainingContestants.map((contestant) => (
                    <SelectItem key={contestant.id} value={contestant.name}>
                      {contestant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Third POV Winner */}
        <div>
          <Label htmlFor="third-pov">Third Power of Veto Winner</Label>
          <Select
            value={eventForm.thirdPovWinner || ''}
            onValueChange={(value) => setEventForm(prev => ({ ...prev, thirdPovWinner: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select POV winner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-winner">No Winner</SelectItem>
              {remainingContestants.map((contestant) => (
                <SelectItem key={contestant.id} value={contestant.name}>
                  {contestant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Third POV Usage */}
        {eventForm.thirdPovWinner && eventForm.thirdPovWinner !== 'no-winner' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={eventForm.thirdPovUsed || false}
                onCheckedChange={(checked) => setEventForm(prev => ({ 
                  ...prev, 
                  thirdPovUsed: checked,
                  thirdPovUsedOn: checked ? prev.thirdPovUsedOn : '',
                  thirdReplacementNominee: checked ? prev.thirdReplacementNominee : ''
                }))}
              />
              <Label>POV was used</Label>
            </div>

            {eventForm.thirdPovUsed && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="third-pov-used-on">POV used on</Label>
                  <Select
                    value={eventForm.thirdPovUsedOn || ''}
                    onValueChange={(value) => setEventForm(prev => ({ ...prev, thirdPovUsedOn: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select houseguest" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventForm.thirdNominees?.filter(n => n).map((nominee) => (
                        <SelectItem key={nominee} value={nominee}>
                          {nominee}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="third-replacement-nominee">Replacement Nominee</Label>
                  <Select
                    value={eventForm.thirdReplacementNominee || ''}
                    onValueChange={(value) => setEventForm(prev => ({ ...prev, thirdReplacementNominee: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select replacement" />
                    </SelectTrigger>
                    <SelectContent>
                      {remainingContestants
                        .filter(c => !eventForm.thirdNominees?.includes(c.name) || c.name === eventForm.thirdPovUsedOn)
                        .map((contestant) => (
                          <SelectItem key={contestant.id} value={contestant.name}>
                            {contestant.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Third Evicted Houseguest */}
        <div>
          <Label htmlFor="third-evicted">Third Evicted Houseguest</Label>
          <Select
            value={eventForm.thirdEvicted || ''}
            onValueChange={(value) => setEventForm(prev => ({ ...prev, thirdEvicted: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select evicted houseguest" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-eviction">No Eviction</SelectItem>
              {remainingContestants.map((contestant) => (
                <SelectItem key={contestant.id} value={contestant.name}>
                  {contestant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};