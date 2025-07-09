
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Zap } from 'lucide-react';
import { useScoringRules } from '@/hooks/useScoringRules';
import { ContestantWithBio, WeeklyEventForm } from '@/types/admin';
import { usePool } from '@/contexts/PoolContext';
import { useToast } from '@/hooks/use-toast';
import { CustomEventSelector } from './CustomEventSelector';
import { CustomEventsLibrary } from './special-events/CustomEventsLibrary';
import { SpecialEventCard } from './special-events/SpecialEventCard';
import { StatusChangeInfo } from './special-events/StatusChangeInfo';
import { supabase } from '@/integrations/supabase/client';

type SpecialEventFormData = {
  id?: string;
  contestant: string;
  eventType: string | undefined;
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
  const { scoringRules } = useScoringRules();
  const [showCustomEventForm, setShowCustomEventForm] = useState(false);
  // Get available special events from active scoring rules (including custom permanent)
  const availableEvents = scoringRules.filter(rule => 
    rule.category === 'special_events' && 
    rule.is_active &&
    rule.subcategory !== 'won_bb_arena' // Exclude automatic events only
  );

  console.log('🎯 Available Events:', availableEvents);

  // Get all contestants for events like "came back after evicted"
  const evictedContestants = activeContestants.filter(c => !c.isActive);
  
  const addSpecialEvent = () => {
    const newEvent: SpecialEventFormData = {
      id: Date.now().toString(),
      contestant: '',
      eventType: undefined,
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
    console.log('🔧 updateSpecialEvent called:', { index, field, value, currentEventType: eventForm.specialEvents[index]?.eventType });
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
      newEvents[index].customPoints = undefined; // Use default from scoring rules
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

  const handleCustomEventAdd = async (eventData: { description: string; emoji: string; points: number }) => {
    try {
      // Add to permanent scoring rules with emoji
      const { error } = await supabase
        .from('detailed_scoring_rules')
        .insert({
          category: 'special_events',
          subcategory: 'custom_permanent',
          description: eventData.description,
          emoji: eventData.emoji,
          points: eventData.points,
          is_active: true
        });

      if (error) throw error;

      // Reload scoring rules (will be handled by the hook automatically)

      // Find the incomplete custom event in the form and complete it
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
      
      toast({
        title: "Success!",
        description: "Custom special event created and added to your library",
      });
    } catch (error) {
      console.error('Error adding custom event:', error);
      toast({
        title: "Error",
        description: "Failed to add custom event",
        variant: "destructive",
      });
    }
  };

  const deleteCustomScoringRule = async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from('detailed_scoring_rules')
        .update({ is_active: false })
        .eq('id', ruleId);

      if (error) throw error;

      // Scoring rules will be reloaded automatically by the hook
      
      toast({
        title: "Success!",
        description: "Custom special event deleted",
      });
    } catch (error) {
      console.error('Error deleting custom event:', error);
      toast({
        title: "Error",
        description: "Failed to delete custom event",
        variant: "destructive",
      });
    }
  };

  // Get available contestants for each event type
  const getAvailableContestants = (eventType: string | undefined) => {
    console.log('🔍 getAvailableContestants called with:', { eventType });
    
    if (!eventType || eventType === '') {
      console.log('🔍 No eventType provided, returning empty array');
      return [];
    }
    
    switch (eventType) {
      case 'came_back_evicted':
        console.log('🔍 Returning evicted contestants for came_back_evicted:', evictedContestants.length);
        return evictedContestants; // Only show evicted contestants
      case 'self_evicted':
      case 'removed_production':
        const activeOnly = activeContestants.filter(c => c.isActive);
        console.log('🔍 Returning active contestants for self/removed eviction:', activeOnly.length);
        return activeOnly; // Only active contestants can be evicted
      default:
        console.log('🔍 Returning all active contestants for default case:', activeContestants.length);
        return activeContestants; // All contestants
    }
  };

  const getEventDisplayName = (event: SpecialEventFormData) => {
    if (event.eventType === 'custom_event' && event.customDescription) {
      return `${event.customEmoji} ${event.customDescription}`;
    }
    // Match by ID first (for custom permanent events), then by subcategory
    const eventRule = availableEvents.find(rule => 
      rule.id === event.eventType || rule.subcategory === event.eventType
    );
    if (eventRule) {
      // For custom permanent rules, show emoji + description
      if (eventRule.subcategory === 'custom_permanent' && eventRule.emoji) {
        return `${eventRule.emoji} ${eventRule.description}`;
      }
      return eventRule.description;
    }
    return event.eventType;
  };

  const getEventPoints = (event: SpecialEventFormData) => {
    if (event.eventType === 'custom_event') {
      return event.customPoints || 1;
    }
    if (event.customPoints !== undefined) {
      return event.customPoints;
    }
    // Match by ID first (for custom permanent events), then by subcategory
    const eventRule = availableEvents.find(rule => 
      rule.id === event.eventType || rule.subcategory === event.eventType
    );
    return eventRule?.points || 1;
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
            No special events are available. 
            Go to Admin → Pool Settings → Custom Scoring Rules to activate special events.
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
        {/* Custom Events Library - Hidden in Weekly Events Logging per LovableConfig */}

        {/* Special Events for this week */}
        {eventForm.specialEvents.map((event, index) => (
          <SpecialEventCard
            key={event.id}
            event={event}
            index={index}
            availableEvents={availableEvents}
            activeContestants={activeContestants}
            getAvailableContestants={getAvailableContestants}
            updateSpecialEvent={updateSpecialEvent}
            removeSpecialEvent={removeSpecialEvent}
            getEventDisplayName={getEventDisplayName}
            getEventPoints={getEventPoints}
            onShowCustomEventForm={() => setShowCustomEventForm(true)}
          />
        ))}

        {/* Add Event Button */}
        <Button
          variant="outline"
          onClick={addSpecialEvent}
          className="w-full"
          disabled={eventForm.specialEvents.length > 0 && eventForm.specialEvents[eventForm.specialEvents.length - 1] && (!eventForm.specialEvents[eventForm.specialEvents.length - 1].contestant || !eventForm.specialEvents[eventForm.specialEvents.length - 1].eventType)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Special Event
        </Button>

        {/* Status Change Info */}
        <StatusChangeInfo specialEvents={eventForm.specialEvents} />

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
