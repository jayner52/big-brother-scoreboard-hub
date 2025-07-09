import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Zap } from 'lucide-react';
import { useScoringRules } from '@/hooks/useScoringRules';
import { ContestantWithBio, WeeklyEventForm } from '@/types/admin';
import { getScoringRuleEmoji } from '@/utils/scoringCategoryEmojis';

interface SimpleSpecialEvent {
  id: string;
  eventType: string; // scoring rule ID
  contestant: string;
}

interface SimpleSpecialEventsSectionProps {
  eventForm: WeeklyEventForm;
  setEventForm: (form: WeeklyEventForm) => void;
  activeContestants: ContestantWithBio[];
}

export const SimpleSpecialEventsSection: React.FC<SimpleSpecialEventsSectionProps> = ({
  eventForm,
  setEventForm,
  activeContestants
}) => {
  const { scoringRules } = useScoringRules();

  // Get special events from scoring rules
  const availableEvents = scoringRules.filter(rule => 
    rule.category === 'special_events' && 
    rule.is_active
  );

  // Convert complex form data to simple format for this component
  const simpleEvents: SimpleSpecialEvent[] = (eventForm.specialEvents || []).map((event, index) => ({
    id: event.id || `event-${index}`,
    eventType: event.eventType || '',
    contestant: event.contestant || ''
  }));

  const addEvent = () => {
    const newEvent: SimpleSpecialEvent = {
      id: `event-${Date.now()}`,
      eventType: '',
      contestant: ''
    };
    
    updateEvents([...simpleEvents, newEvent]);
  };

  const removeEvent = (index: number) => {
    const newEvents = simpleEvents.filter((_, i) => i !== index);
    updateEvents(newEvents);
  };

  const updateEvent = (index: number, field: keyof SimpleSpecialEvent, value: string) => {
    const newEvents = [...simpleEvents];
    newEvents[index] = { ...newEvents[index], [field]: value };
    updateEvents(newEvents);
  };

  // Convert simple events back to complex format for the form
  const updateEvents = (events: SimpleSpecialEvent[]) => {
    const complexEvents = events.map(event => ({
      id: event.id,
      contestant: event.contestant,
      eventType: event.eventType,
      description: '',
      customPoints: undefined,
      customDescription: '',
      customEmoji: ''
    }));

    setEventForm({
      ...eventForm,
      specialEvents: complexEvents
    });
  };

  const getEventDetails = (eventTypeId: string) => {
    const rule = availableEvents.find(r => r.id === eventTypeId);
    if (!rule) return { name: '', points: 0, emoji: '' };
    
    const emoji = getScoringRuleEmoji(rule.category, rule.subcategory, rule.emoji);
    return {
      name: rule.description,
      points: rule.points,
      emoji
    };
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
            No special events are available. Go to Pool Settings → Custom Scoring to enable special events.
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
        {/* Event List */}
        {simpleEvents.map((event, index) => {
          const eventDetails = getEventDetails(event.eventType);
          
          return (
            <div key={event.id} className="flex flex-col gap-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  Event #{index + 1}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEvent(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Event Type Selector */}
                <div>
                  <Label>Event Type</Label>
                  <Select
                    value={event.eventType}
                    onValueChange={(value) => updateEvent(index, 'eventType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEvents.map((rule) => {
                        const emoji = getScoringRuleEmoji(rule.category, rule.subcategory, rule.emoji);
                        return (
                          <SelectItem key={rule.id} value={rule.id}>
                            <div className="flex items-center gap-2">
                              <span>{emoji}</span>
                              <span>{rule.description}</span>
                              <Badge variant="secondary" className="text-xs ml-auto">
                                {rule.points > 0 ? '+' : ''}{rule.points} pts
                              </Badge>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Contestant Selector */}
                <div>
                  <Label>Contestant</Label>
                  <Select
                    value={event.contestant}
                    onValueChange={(value) => updateEvent(index, 'contestant', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select contestant" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeContestants.map(contestant => (
                        <SelectItem key={contestant.name} value={contestant.name}>
                          <div className="flex items-center justify-between w-full">
                            <span>{contestant.name}</span>
                            {!contestant.isActive && (
                              <Badge variant="outline" className="text-xs ml-2">Evicted</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Event Summary */}
              {event.contestant && event.eventType && (
                <div className="flex items-center justify-between p-2 bg-muted/20 rounded text-sm">
                  <span>
                    <strong>{event.contestant}</strong> → {eventDetails.emoji} {eventDetails.name}
                  </span>
                  <Badge variant={eventDetails.points > 0 ? "default" : eventDetails.points < 0 ? "destructive" : "secondary"}>
                    {eventDetails.points > 0 ? '+' : ''}{eventDetails.points} pts
                  </Badge>
                </div>
              )}
            </div>
          );
        })}

        {/* Add Event Button */}
        <Button
          variant="outline"
          onClick={addEvent}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Special Event
        </Button>

        {/* Applied Events Summary */}
        {simpleEvents.length > 0 && simpleEvents.some(e => e.contestant && e.eventType) && (
          <div className="mt-4 p-3 bg-primary/5 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Applied Events Summary:</h4>
            <div className="space-y-1">
              {simpleEvents
                .filter(e => e.contestant && e.eventType)
                .map((event, index) => {
                  const details = getEventDetails(event.eventType);
                  return (
                    <div key={`${event.id}-summary`} className="text-xs flex items-center justify-between">
                      <span>{event.contestant} → {details.emoji} {details.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {details.points > 0 ? '+' : ''}{details.points} pts
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};