import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { usePool } from '@/contexts/PoolContext';
import { Plus, X, Zap } from 'lucide-react';

interface SpecialEvent {
  id: string;
  type: string;
  label: string;
  points: number;
  description: string;
}

interface SpecialEventsDropdownProps {
  week: number;
  selectedEvents: string[];
  onEventsChange: (events: string[]) => void;
  contestants: Array<{ id: string; name: string }>;
}

export const SpecialEventsDropdown: React.FC<SpecialEventsDropdownProps> = ({
  week,
  selectedEvents,
  onEventsChange,
  contestants
}) => {
  const { activePool } = usePool();
  const [availableEvents, setAvailableEvents] = useState<SpecialEvent[]>([]);
  const [selectedEventDetails, setSelectedEventDetails] = useState<Array<{
    eventId: string;
    contestantId: string;
    contestantName: string;
    points: number;
  }>>([]);

  useEffect(() => {
    if (activePool?.id) {
      loadAvailableEvents();
    }
  }, [activePool?.id, week]);

  // Load existing events after available events are loaded
  useEffect(() => {
    if (activePool?.id && availableEvents.length > 0) {
      loadExistingSpecialEvents();
    }
  }, [activePool?.id, week, availableEvents]);

  const loadAvailableEvents = async () => {
    if (!activePool?.id) return;

    try {
      // Get all scoring rules for special events
      const { data: scoringRules, error } = await supabase
        .from('detailed_scoring_rules')
        .select('*')
        .eq('is_active', true)
        .eq('category', 'special_events');

      if (error) throw error;

      const events: SpecialEvent[] = (scoringRules || []).map(rule => ({
        id: rule.id,
        type: rule.subcategory || 'custom',
        label: rule.description || rule.subcategory || 'Special Event',
        points: rule.points,
        description: rule.description || ''
      }));

      // Add pool-specific special events
      const poolSpecialEvents = activePool.enabled_special_events || [];
      poolSpecialEvents.forEach((eventType: string) => {
        if (!events.find(e => e.type === eventType)) {
          events.push({
            id: `pool_${eventType}`,
            type: eventType,
            label: formatEventType(eventType),
            points: getDefaultPoints(eventType),
            description: `Pool-specific ${formatEventType(eventType)}`
          });
        }
      });

      console.log('🎯 Special Events - Loaded events:', events);
      setAvailableEvents(events);
    } catch (error) {
      console.error('❌ Special Events - Error loading events:', error);
    }
  };

  const loadExistingSpecialEvents = async () => {
    if (!activePool?.id) return;

    try {
      const { data: existingEvents, error } = await supabase
        .from('special_events')
        .select('*')
        .eq('pool_id', activePool.id)
        .eq('week_number', week);

      if (error) throw error;

      if (existingEvents && existingEvents.length > 0) {
        const eventDetails = existingEvents.map(event => {
          const contestant = contestants.find(c => c.id === event.contestant_id);
          // Find the matching event in availableEvents by type
          const availableEvent = availableEvents.find(e => e.type === event.event_type);
          return {
            eventId: availableEvent?.id || `custom_${event.id}`,
            contestantId: event.contestant_id,
            contestantName: contestant?.name || 'Unknown',
            points: event.points_awarded || 0
          };
        });

        setSelectedEventDetails(eventDetails);
        onEventsChange(eventDetails.map(d => d.eventId));
      }
    } catch (error) {
      console.error('❌ Special Events - Error loading existing events:', error);
    }
  };

  const formatEventType = (eventType: string): string => {
    return eventType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getDefaultPoints = (eventType: string): number => {
    const pointsMap: Record<string, number> = {
      'won_secret_power': 10,
      'used_special_power': 5,
      'won_prize': 5,
      'received_penalty': -5,
      'came_back_evicted': 15,
      'custom_event': 5
    };
    return pointsMap[eventType] || 5;
  };

  const handleAddEvent = (eventId: string, contestantId: string) => {
    const event = availableEvents.find(e => e.id === eventId);
    const contestant = contestants.find(c => c.id === contestantId);
    
    if (!event || !contestant) return;

    const newEventDetail = {
      eventId,
      contestantId,
      contestantName: contestant.name,
      points: event.points
    };

    setSelectedEventDetails(prev => [...prev, newEventDetail]);
    calculatePointsAndUpdateParent([...selectedEventDetails, newEventDetail]);
  };

  const handleRemoveEvent = (index: number) => {
    const newDetails = selectedEventDetails.filter((_, i) => i !== index);
    setSelectedEventDetails(newDetails);
    calculatePointsAndUpdateParent(newDetails);
  };

  const calculatePointsAndUpdateParent = async (eventDetails: typeof selectedEventDetails) => {
    if (!activePool?.id) return;

    try {
      // Apply special events and calculate points
      for (const detail of eventDetails) {
        // Save to special_events table
        const { error: specialEventError } = await supabase
          .from('special_events')
          .upsert({
            pool_id: activePool.id,
            contestant_id: detail.contestantId,
            event_type: availableEvents.find(e => e.id === detail.eventId)?.type || 'custom',
            description: `Week ${week} - ${availableEvents.find(e => e.id === detail.eventId)?.label}`,
            week_number: week,
            points_awarded: detail.points
          });

        if (specialEventError) throw specialEventError;

        // ALSO save to weekly_events table with the UUID event_type so the trigger can work
        const eventRule = availableEvents.find(e => e.id === detail.eventId);
        if (eventRule && ['self_evicted', 'removed_production', 'came_back_evicted'].includes(eventRule.type)) {
          const { error: weeklyEventError } = await supabase
            .from('weekly_events')
            .upsert({
              pool_id: activePool.id,
              contestant_id: detail.contestantId,
              event_type: detail.eventId, // Use the UUID from detailed_scoring_rules
              week_number: week,
              points_awarded: detail.points,
              event_details: { special_event_type: eventRule.type }
            });

          if (weeklyEventError) throw weeklyEventError;
        }
      }

      // Update parent with event IDs
      const eventIds = eventDetails.map(d => d.eventId);
      onEventsChange(eventIds);

      console.log('✅ Special Events - Applied events:', eventDetails);
    } catch (error) {
      console.error('❌ Special Events - Error applying events:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Special Events - Week {week}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Event */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
          <Select onValueChange={(eventId) => {
            const [event, contestant] = eventId.split('|');
            if (event && contestant) {
              handleAddEvent(event, contestant);
            }
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select special event..." />
            </SelectTrigger>
            <SelectContent>
              {availableEvents.map(event => 
                contestants.map(contestant => (
                  <SelectItem 
                    key={`${event.id}|${contestant.id}`} 
                    value={`${event.id}|${contestant.id}`}
                  >
                    {contestant.name} - {event.label} ({event.points > 0 ? '+' : ''}{event.points} pts)
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Events */}
        {selectedEventDetails.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Applied Special Events:</h4>
            {selectedEventDetails.map((detail, index) => {
              const event = availableEvents.find(e => e.id === detail.eventId);
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {detail.contestantName}
                    </Badge>
                    <span className="text-sm font-medium">{event?.label}</span>
                    <Badge 
                      variant={detail.points >= 0 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {detail.points > 0 ? '+' : ''}{detail.points} pts
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEvent(index)}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Available Events Legend */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-sm text-muted-foreground mb-2">Available Special Events:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {availableEvents.map(event => (
              <div key={event.id} className="flex items-center justify-between p-2 bg-muted/20 rounded text-xs">
                <span>{event.label}</span>
                <Badge variant="outline" className="text-xs">
                  {event.points > 0 ? '+' : ''}{event.points} pts
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};