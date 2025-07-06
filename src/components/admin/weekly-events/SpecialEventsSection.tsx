import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X, Plus, Zap } from 'lucide-react';
import { ContestantWithBio, WeeklyEventForm, DetailedScoringRule } from '@/types/admin';
import { useWeekAwareContestants } from '@/hooks/useWeekAwareContestants';
import { usePool } from '@/contexts/PoolContext';
import { SPECIAL_EVENTS_CONFIG, getDefaultPointsForEvent } from '@/constants/specialEvents';

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
  const { activePool } = usePool();
  
  // Use week-aware contestants for proper eviction status
  const { allContestants: weekAwareContestants, evictedContestants } = useWeekAwareContestants(eventForm.week);
  const eligibleContestants = weekAwareContestants.length > 0 ? weekAwareContestants : (allContestants || activeContestants);
  
  // Filter enabled special events from pool settings
  const enabledEventIds = (activePool as any)?.enabled_special_events || [];
  const availableEvents = SPECIAL_EVENTS_CONFIG.toggleable.filter(
    event => enabledEventIds.includes(event.id)
  );
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

  if (availableEvents.length === 0) {
    return (
      <div className="p-4 bg-muted/30 rounded-lg border border-dashed">
        <div className="text-center text-muted-foreground">
          <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="font-medium">No Special Events Enabled</p>
          <p className="text-sm">Enable special events in Pool Settings to track them here.</p>
        </div>
      </div>
    );
  }

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
                       {availableEvents.map(event => (
                         <SelectItem key={event.id} value={event.id}>
                           {event.emoji} {event.label}
                           {event.points !== undefined && (
                             <span className="ml-1 text-muted-foreground">
                               ({event.points > 0 ? '+' : ''}{event.points}pts)
                             </span>
                           )}
                         </SelectItem>
                       ))}
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