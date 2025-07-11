
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useScoringRules } from '@/hooks/useScoringRules';
import { getScoringRuleEmoji } from '@/utils/scoringCategoryEmojis';
import { useActivePool } from '@/hooks/useActivePool';

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
  const activePool = useActivePool();
  const { scoringRules } = useScoringRules(activePool?.id);
  const weekEvents = events.filter(event => event.week_number === weekNumber);

  if (weekEvents.length === 0) return null;

  // Function to get event display details from scoring rules
  const getEventDetails = (eventType: string, description?: string, points?: number) => {
    // First try to find by subcategory (for standard events)
    let rule = scoringRules.find(r => r.subcategory === eventType && r.category === 'special_events');
    
    // If not found, try to find by ID (for UUID-based events)
    if (!rule) {
      rule = scoringRules.find(r => r.id === eventType);
    }
    
    if (rule) {
      const emoji = getScoringRuleEmoji(rule.category, rule.subcategory, rule.emoji);
      return {
        name: rule.description,
        points: rule.points,
        emoji
      };
    }
    
    // Fallback for custom or unmatched events
    return {
      name: description || eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      points: points || 0,
      emoji: '✨'
    };
  };

  return (
    <div className={`mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 ${className}`}>
      <h4 className="font-semibold mb-2 flex items-center gap-2 text-purple-800">
        <span className="text-purple-600">⚡</span>
        Special Events
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {weekEvents.map((event, index) => {
          const eventDetails = getEventDetails(event.event_type, event.description, event.points_awarded);
          
          return (
            <div key={index} className="bg-white/80 p-2 rounded-md border border-purple-200/50 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-purple-900 text-sm">{event.contestant_name}</span>
                <Badge 
                  variant={eventDetails.points > 0 ? "default" : eventDetails.points < 0 ? "destructive" : "secondary"} 
                  className="text-xs"
                >
                  {eventDetails.points > 0 ? '+' : ''}{eventDetails.points} pts
                </Badge>
              </div>
              <div className="text-purple-700 text-xs flex items-center gap-1">
                <span>{eventDetails.emoji}</span>
                <span>{eventDetails.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
