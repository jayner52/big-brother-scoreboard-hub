import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePool } from '@/contexts/PoolContext';
import { SPECIAL_EVENTS_CONFIG } from '@/constants/specialEvents';
import { Settings, Zap } from 'lucide-react';

export const SpecialEventsSettings: React.FC = () => {
  const { activePool, updatePool } = usePool();
  const { toast } = useToast();
  const [enabledEvents, setEnabledEvents] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activePool?.enabled_special_events) {
      setEnabledEvents(activePool.enabled_special_events);
    }
  }, [activePool?.enabled_special_events]);

  const toggleEvent = (eventId: string) => {
    setEnabledEvents(prev => 
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const saveConfiguration = async () => {
    if (!activePool) return;

    setSaving(true);
    try {
      const result = await updatePool(activePool.id, {
        enabled_special_events: enabledEvents
      });
      
      const success = result.success;

      if (success) {
        toast({
          title: "Settings Saved",
          description: "Special events configuration updated successfully",
        });
      } else {
        throw new Error('Failed to update pool');
      }
    } catch (error) {
      console.error('Error saving special events configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save special events configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Special Events Configuration
        </CardTitle>
        <CardDescription>
          Select which special events can be tracked during weekly events. These will appear in the weekly events dropdown for scoring.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SPECIAL_EVENTS_CONFIG.toggleable.map(event => (
            <label 
              key={event.id} 
              className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer border transition-colors"
            >
              <input
                type="checkbox"
                checked={enabledEvents.includes(event.id)}
                onChange={() => toggleEvent(event.id)}
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              <span className="text-lg">{event.emoji}</span>
              <div className="flex-1">
                <span className="text-sm font-medium">{event.label}</span>
                {event.points !== undefined && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({event.points > 0 ? '+' : ''}{event.points} pts)
                  </span>
                )}
              </div>
            </label>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {enabledEvents.length} of {SPECIAL_EVENTS_CONFIG.toggleable.length} events enabled
          </p>
          <Button 
            onClick={saveConfiguration} 
            disabled={saving}
            className="bg-primary hover:bg-primary/90"
          >
            <Settings className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>

        <div className="bg-muted/30 p-4 rounded-lg">
          <h4 className="font-medium mb-2">How Special Events Work:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Only enabled events will appear in the weekly events dropdown</li>
            <li>• Automatic events (like jury member, block survival bonuses) are calculated automatically</li>
            <li>• Points are awarded based on default values or custom amounts you set</li>
            <li>• Changes take effect immediately for future weeks</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};