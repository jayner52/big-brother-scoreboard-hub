import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Zap } from 'lucide-react';
import { SPECIAL_EVENTS_CONFIG, getDefaultPointsForEvent } from '@/constants/specialEvents';
import { ContestantWithBio, WeeklyEventForm } from '@/types/admin';
import { usePool } from '@/contexts/PoolContext';
import { useToast } from '@/hooks/use-toast';
import { CustomEventSelector } from './CustomEventSelector';

type SpecialEventFormData = {
  id?: string;
  contestant: string;
  eventType: string;
  description?: string;
  customPoints?: number;
  customDescription?: string;
  customEmoji?: string;
};

interface SpecialEventsSectionProps {
  eventForm: WeeklyEventForm;
  setEventForm: (form: WeeklyEventForm) => void;
  activeContestants: ContestantWithBio[];
}

export const SpecialEventsSection: React.FC<SpecialEventsSectionProps> = ({
  eventForm,
  setEventForm,
  activeContestants
}) => {
  const { activePool } = usePool();
  const { toast } = useToast();
  const [showCustomEventForm, setShowCustomEventForm] = useState(false);

  // Get enabled special events from pool settings
  const enabledEvents = activePool?.enabled_special_events || [];
  const availableEvents = SPECIAL_EVENTS_CONFIG.toggleable.filter(event => 
    enabledEvents.includes(event.id)
  );

  // Get all contestants for events like "came back after evicted"
  const evictedContestants = activeContestants.filter(c => !c.isActive);
  
  const addSpecialEvent = () => {
    const newEvent: SpecialEventFormData = {
      id: Date.now().toString(),
      contestant: '',
      eventType: '',
      customPoints: undefined,
      customDescription: '',
      customEmoji: '✨'
    };
    
    setEventForm({
      ...eventForm,
      specialEvents: [...eventForm.specialEvents, newEvent]
    });
  };

  const removeSpecialEvent = (index: number) => {
    const newEvents = eventForm.specialEvents.filter((_, i) => i !== index);
    setEventForm({
      ...eventForm,
      specialEvents: newEvents
    });
  };

  const updateSpecialEvent = (index: number, field: keyof SpecialEventFormData, value: any) => {
    const newEvents = [...eventForm.specialEvents];
    newEvents[index] = { ...newEvents[index], [field]: value };

    // Reset custom fields if switching away from custom event
    if (field === 'eventType' && value !== 'custom_event') {
      newEvents[index].customPoints = undefined;
      newEvents[index].customDescription = '';
      newEvents[index].customEmoji = '✨';
    }

    // Set default points when event type changes
    if (field === 'eventType' && value !== 'custom_event') {
      newEvents[index].customPoints = undefined; // Use default from config
    }

    // Validate contestant selection for specific events
    if (field === 'eventType') {
      const contestant = newEvents[index].contestant;
      if (value === 'came_back_evicted' && contestant) {
        const contestantData = activeContestants.find(c => c.name === contestant);
        if (contestantData?.isActive) {
          toast({
            title: "Invalid Selection",
            description: "Can only apply 'Came Back After Evicted' to contestants who were previously evicted",
            variant: "destructive"
          });
          newEvents[index].contestant = '';
        }
      }
    }

    if (field === 'contestant') {
      const eventType = newEvents[index].eventType;
      if (eventType === 'came_back_evicted') {
        const contestantData = activeContestants.find(c => c.name === value);
        if (contestantData?.isActive) {
          toast({
            title: "Invalid Selection", 
            description: "Can only apply 'Came Back After Evicted' to contestants who were previously evicted",
            variant: "destructive"
          });
          return; // Don't update if invalid
        }
      }
    }

    setEventForm({
      ...eventForm,
      specialEvents: newEvents
    });
  };

  const handleCustomEventAdd = (eventData: { description: string; emoji: string; points: number }) => {
    const newEvents = [...eventForm.specialEvents];
    const targetEventIndex = newEvents.findIndex(e => e.eventType === 'custom_event' && !e.contestant);
    
    if (targetEventIndex >= 0) {
      newEvents[targetEventIndex] = {
        ...newEvents[targetEventIndex],
        customDescription: eventData.description,
        customEmoji: eventData.emoji,
        customPoints: eventData.points
      };
      
      setEventForm({
        ...eventForm,
        specialEvents: newEvents
      });
    }
    
    setShowCustomEventForm(false);
  };

  // Get available contestants for each event type
  const getAvailableContestants = (eventType: string) => {
    switch (eventType) {
      case 'came_back_evicted':
        return evictedContestants; // Only show evicted contestants
      case 'self_evicted':
      case 'removed_production':
        return activeContestants.filter(c => c.isActive); // Only active contestants can be evicted
      default:
        return activeContestants; // All contestants
    }
  };

  const getEventDisplayName = (event: SpecialEventFormData) => {
    if (event.eventType === 'custom_event' && event.customDescription) {
      return `${event.customEmoji} ${event.customDescription}`;
    }
    const eventConfig = availableEvents.find(e => e.id === event.eventType);
    return eventConfig ? `${eventConfig.emoji} ${eventConfig.label}` : event.eventType;
  };

  const getEventPoints = (event: SpecialEventFormData) => {
    if (event.eventType === 'custom_event') {
      return event.customPoints || 1;
    }
    return event.customPoints !== undefined ? event.customPoints : getDefaultPointsForEvent(event.eventType);
  };

  if (availableEvents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Special Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No special events are enabled in this pool's settings. 
            Go to Admin → Pool Settings → Special Events to enable events.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Special Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {eventForm.specialEvents.map((event, index) => (
          <div key={event.id} className="flex flex-col gap-3 p-4 border rounded-lg">
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
                    {availableEvents.map(eventType => (
                      <SelectItem key={eventType.id} value={eventType.id}>
                        <span className="flex items-center gap-2">
                          <span>{eventType.emoji}</span>
                          <span>{eventType.label}</span>
                          <Badge variant="secondary" className="text-xs ml-2">
                            {eventType.points !== undefined ? `${eventType.points > 0 ? '+' : ''}${eventType.points}` : '±'}
                          </Badge>
                        </span>
                      </SelectItem>
                    ))}
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
                      onClick={() => setShowCustomEventForm(true)}
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

            {/* Custom Points Override */}
            {event.eventType && event.eventType !== 'custom_event' && (
              <div>
                <Label>Custom Points (optional)</Label>
                <Input
                  type="number"
                  placeholder={`Default: ${getDefaultPointsForEvent(event.eventType)}`}
                  value={event.customPoints || ''}
                  onChange={(e) => updateSpecialEvent(index, 'customPoints', parseInt(e.target.value) || undefined)}
                />
              </div>
            )}

            {/* Event Summary */}
            {event.contestant && event.eventType && (
              <div className="flex items-center justify-between p-2 bg-muted/20 rounded text-sm">
                <span>
                  <strong>{event.contestant}</strong> → {getEventDisplayName(event)}
                </span>
                <Badge variant={getEventPoints(event) > 0 ? "default" : "destructive"}>
                  {getEventPoints(event) > 0 ? '+' : ''}{getEventPoints(event)} pts
                </Badge>
              </div>
            )}
          </div>
        ))}

        {/* Add Event Button */}
        <Button
          variant="outline"
          onClick={addSpecialEvent}
          className="w-full"
          disabled={eventForm.specialEvents.some(e => !e.contestant || !e.eventType)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Special Event
        </Button>

        {/* Status Change Info */}
        {eventForm.specialEvents.some(e => ['self_evicted', 'removed_production', 'came_back_evicted'].includes(e.eventType)) && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
            <p className="font-medium text-yellow-800 mb-1">⚠️ Status Change Events</p>
            <ul className="text-yellow-700 space-y-1">
              {eventForm.specialEvents.filter(e => e.eventType === 'self_evicted' || e.eventType === 'removed_production').length > 0 && (
                <li>• Self-evicted/Removed contestants will have their status changed to evicted and lose survival points for this week</li>
              )}
              {eventForm.specialEvents.filter(e => e.eventType === 'came_back_evicted').length > 0 && (
                <li>• Contestants who came back will have their status reactivated</li>
              )}
            </ul>
          </div>
        )}

        {/* Custom Event Modal */}
        {showCustomEventForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="max-w-lg w-full">
              <CustomEventSelector
                onAddCustomEvent={handleCustomEventAdd}
                onCancel={() => setShowCustomEventForm(false)}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};