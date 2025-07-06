import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X, Plus, Zap } from 'lucide-react';
import { ContestantWithBio, WeeklyEventForm, DetailedScoringRule } from '@/types/admin';
import { useWeekAwareContestants } from '@/hooks/useWeekAwareContestants';

interface SpecialEventsSectionProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
  activeContestants: ContestantWithBio[];
  scoringRules: DetailedScoringRule[];
  allContestants?: ContestantWithBio[];
}

export const SpecialEventsSection: React.FC<SpecialEventsSectionProps> = ({
  eventForm,
  setEventForm,
  activeContestants,
  scoringRules,
  allContestants,
}) => {
  // Use week-aware contestants for proper eviction status
  const { allContestants: weekAwareContestants, evictedContestants } = useWeekAwareContestants(eventForm.week);
  const eligibleContestants = weekAwareContestants.length > 0 ? weekAwareContestants : (allContestants || activeContestants);
  const addSpecialEvent = () => {
    setEventForm(prev => ({
      ...prev,
      specialEvents: [...prev.specialEvents, { contestant: '', eventType: '', description: '', customPoints: undefined }]
    }));
  };

  // Handle special events with houseguest revival
  const updateSpecialEvent = (index: number, field: string, value: string | number) => {
    setEventForm(prev => {
      const newForm = {
        ...prev,
        specialEvents: prev.specialEvents.map((event, i) => 
          i === index ? { ...event, [field]: value } : event
        )
      };

      // Auto-handle houseguest revival when "came_back_after_evicted" is selected
      if (field === 'eventType' && value === 'came_back_after_evicted') {
        const contestantName = newForm.specialEvents[index].contestant;
        if (contestantName) {
          console.log('🔄 SpecialEvents - Auto-reviving houseguest:', contestantName);
          // This would trigger houseguest revival in the submission handler
        }
      }

      return newForm;
    });
  };

  const removeSpecialEvent = (index: number) => {
    setEventForm(prev => ({
      ...prev,
      specialEvents: prev.specialEvents.filter((_, i) => i !== index)
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="font-semibold flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Special Events
        </Label>
        <Button size="sm" variant="outline" onClick={addSpecialEvent}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {eventForm.specialEvents.map((event, index) => {
          const isCustomEvent = event.eventType === 'custom';
          
          return (
            <Card key={index} className="p-3">
              <div className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-3">
                  <Label className="text-xs">Houseguest</Label>
                  <Select 
                    value={event.contestant} 
                    onValueChange={(value) => updateSpecialEvent(index, 'contestant', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                     <SelectContent>
                       {eligibleContestants
                         .filter((contestant, index, self) => 
                           // Remove duplicates based on contestant ID
                           index === self.findIndex(c => c.id === contestant.id)
                         )
                         .map(contestant => {
                           const isEvicted = evictedContestants.includes(contestant.name);
                           return (
                             <SelectItem key={contestant.id} value={contestant.name}>
                               {contestant.name} {isEvicted && '(Evicted)'}
                             </SelectItem>
                           );
                         })}
                     </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">Event Type</Label>
                  <Select 
                    value={event.eventType} 
                    onValueChange={(value) => updateSpecialEvent(index, 'eventType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="custom">Custom Event</SelectItem>
                       <SelectItem value="won_secret_power">Won Secret Power/Advantage (+3pts)</SelectItem>
                       <SelectItem value="received_penalty_vote">Received Penalty Vote/Nomination (-2pts)</SelectItem>
                       <SelectItem value="came_back_after_evicted">Returned to House After Eviction (+5pts)</SelectItem>
                       <SelectItem value="self_evicted">Self-Evicted/Quit Game (-5pts)</SelectItem>
                       <SelectItem value="removed_from_game">Removed by Production (-5pts)</SelectItem>
                       <SelectItem value="won_safety">Won Safety for the Week (+2pts)</SelectItem>
                       <SelectItem value="used_special_power">Used Power/Advantage (+1pt)</SelectItem>
                       <SelectItem value="won_luxury_comp">Won Luxury Competition (+2pts)</SelectItem>
                       <SelectItem value="lost_luxury_comp">Lost Luxury Competition (-1pt)</SelectItem>
                       <SelectItem value="punishment">Received Punishment (-1pt)</SelectItem>
                       <SelectItem value="prize_won">Won Prize (+1pt)</SelectItem>
                     </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">{isCustomEvent ? 'Event Name' : 'Description'}</Label>
                  <Input
                    value={event.description || ''}
                    onChange={(e) => updateSpecialEvent(index, 'description', e.target.value)}
                    placeholder={isCustomEvent ? 'Event name' : 'Optional details'}
                  />
                </div>
                {isCustomEvent && (
                  <div className="col-span-2">
                    <Label className="text-xs">Points</Label>
                    <Input
                      type="number"
                      value={event.customPoints || ''}
                      onChange={(e) => updateSpecialEvent(index, 'customPoints', parseInt(e.target.value) || 0)}
                      placeholder="Points"
                    />
                  </div>
                )}
                <div className={isCustomEvent ? "col-span-1" : "col-span-1"}>
                  <Button size="sm" variant="destructive" onClick={() => removeSpecialEvent(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};