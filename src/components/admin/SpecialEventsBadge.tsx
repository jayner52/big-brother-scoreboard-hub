import React from 'react';
import { Badge } from '@/components/ui/badge';

interface SpecialEventsBadgeProps {
  events: Array<{
    event_type: string;
    description?: string;
    points_awarded?: number;
  }>;
}

export const SpecialEventsBadge: React.FC<SpecialEventsBadgeProps> = ({ events }) => {
  if (events.length === 0) return null;

  const eventCounts = events.reduce((acc, event) => {
    const type = event.event_type;
    const shortName = getShortEventName(type);
    acc[shortName] = (acc[shortName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-wrap gap-1">
      {Object.entries(eventCounts).map(([eventName, count]) => (
        <Badge key={eventName} variant="outline" className="text-xs">
          {eventName} {count > 1 && `(x${count})`}
        </Badge>
      ))}
    </div>
  );
};

const getShortEventName = (eventType: string): string => {
  const eventMap: Record<string, string> = {
    'comeback': 'Comeback',
    'costume_punishment': 'Costume',
    'punishment': 'Punishment', 
    'safety': 'Safety',
    'showmance': 'Showmance',
    'leaves_early': 'Left Early',
    'given_power': 'Given Power',
    'given_prize': 'Given Prize',
    'special_power': 'Special Power',
    'wins_prize': 'Prize',
    'wins_cash': 'Cash Prize',
    'wins_vacation': 'Vacation'
  };
  
  return eventMap[eventType] || eventType.replace(/_/g, ' ');
};