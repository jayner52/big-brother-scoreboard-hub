import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';
import { ContestantWithBio } from '@/types/admin';
import { getScoringRuleEmoji } from '@/utils/scoringCategoryEmojis';

type SpecialEventFormData = {
  id?: string;
  contestant: string;
  eventType: string;
  description?: string;
  customPoints?: number;
  customDescription?: string;
  customEmoji?: string;
};

interface SpecialEventCardProps {
  event: SpecialEventFormData;
  index: number;
  availableEvents: any[];
  activeContestants: ContestantWithBio[];
  getAvailableContestants: (eventType: string) => ContestantWithBio[];
  updateSpecialEvent: (index: number, field: keyof SpecialEventFormData, value: any) => void;
  removeSpecialEvent: (index: number) => void;
  getEventDisplayName: (event: SpecialEventFormData) => string;
  getEventPoints: (event: SpecialEventFormData) => number;
  onShowCustomEventForm: () => void;
}

export const SpecialEventCard: React.FC<SpecialEventCardProps> = ({
  event,
  index,
  availableEvents,
  activeContestants,
  getAvailableContestants,
  updateSpecialEvent,
  removeSpecialEvent,
  getEventDisplayName,
  getEventPoints,
  onShowCustomEventForm
}) => {
  return (
    <div className="flex flex-col gap-3 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs">
          Event #{index + 1}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeSpecialEvent(index)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>Event Type</Label>
          <Select
            value={event.eventType}
            onValueChange={(value) => updateSpecialEvent(index, 'eventType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              {availableEvents.map(eventRule => {
                const emoji = getScoringRuleEmoji(eventRule.category, eventRule.subcategory, eventRule.emoji);
                return (
                  <SelectItem key={eventRule.subcategory || eventRule.id} value={eventRule.subcategory || eventRule.id}>
                    <span className="flex items-center gap-2">
                      <span className="text-sm">{emoji}</span>
                      <span>{eventRule.description}</span>
                      <Badge variant="secondary" className="text-xs ml-2">
                        {eventRule.points > 0 ? '+' : ''}{eventRule.points} pts
                      </Badge>
                    </span>
                  </SelectItem>
                );
              })}
              <SelectItem value="custom_event">
                <span className="flex items-center gap-2">
                  <span className="text-sm">✨</span>
                  <span>Create Custom Event</span>
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Contestant</Label>
          <Select
            value={event.contestant}
            onValueChange={(value) => updateSpecialEvent(index, 'contestant', value)}
            disabled={!event.eventType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select contestant" />
            </SelectTrigger>
            <SelectContent>
              {getAvailableContestants(event.eventType).map(contestant => (
                <SelectItem key={contestant.name} value={contestant.name}>
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

      {/* Custom Event Fields */}
      {event.eventType === 'custom_event' && (
        <div className="space-y-3 p-3 bg-muted/30 rounded">
          {!event.customDescription ? (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={onShowCustomEventForm}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Configure Custom Event
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {event.customEmoji} {event.customDescription}
                </Badge>
                <Badge variant={event.customPoints && event.customPoints > 0 ? "default" : "destructive"}>
                  {event.customPoints && event.customPoints > 0 ? '+' : ''}{event.customPoints || 0} pts
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  updateSpecialEvent(index, 'customDescription', '');
                  updateSpecialEvent(index, 'customEmoji', '✨');
                  updateSpecialEvent(index, 'customPoints', 1);
                }}
                className="text-xs"
              >
                Reconfigure
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Event Summary */}
      {event.contestant && event.eventType && (
        <div className="flex items-center justify-between p-2 bg-muted/20 rounded text-sm">
          <span>
            <strong>{event.contestant}</strong> → {getEventDisplayName(event)}
          </span>
          <Badge variant={getEventPoints(event) > 0 ? "default" : getEventPoints(event) < 0 ? "destructive" : "secondary"}>
            {getEventPoints(event) > 0 ? '+' : ''}{getEventPoints(event)} pts
          </Badge>
        </div>
      )}
    </div>
  );
};