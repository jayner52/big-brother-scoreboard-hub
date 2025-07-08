import React from 'react';
import { Badge } from '@/components/ui/badge';

interface SpecialEvent {
  week_number: number;
  contestant_name: string;
  event_type: string;
  description?: string;
  points_awarded: number;
}

interface CompactSpecialEventsDisplayProps {
  events: SpecialEvent[];
  weekNumber: number;
  className?: string;
}

export const CompactSpecialEventsDisplay: React.FC<CompactSpecialEventsDisplayProps> = ({
  events,
  weekNumber,
  className = ""
}) => {
  const weekEvents = events.filter(event => event.week_number === weekNumber);

  if (weekEvents.length === 0) return null;

  return (
    <div className={`mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 ${className}`}>
      <h4 className="font-semibold mb-2 flex items-center gap-2 text-purple-800">
        <span className="text-purple-600">⚡</span>
        Special Events
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {weekEvents.map((event, index) => (
          <div key={index} className="bg-white/80 p-2 rounded-md border border-purple-200/50 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-purple-900 text-sm">{event.contestant_name}</span>
              <Badge 
                variant={event.points_awarded > 0 ? "default" : event.points_awarded < 0 ? "destructive" : "secondary"} 
                className="text-xs"
              >
                {event.points_awarded > 0 ? '+' : ''}{event.points_awarded} pts
              </Badge>
            </div>
            <div className="text-purple-700 text-xs">
              {event.description || event.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};