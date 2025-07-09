
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useScoringRules } from '@/hooks/useScoringRules';
import { getScoringRuleEmoji } from '@/utils/scoringCategoryEmojis';

interface SpecialEventsBadgesProps {
  events: Array<{
    event_type: string;
    description?: string;
    points_awarded?: number;
    emoji?: string;
  }>;
}

export const SpecialEventsBadges: React.FC<SpecialEventsBadgesProps> = ({ events }) => {
  const { scoringRules } = useScoringRules();
  
  if (events.length === 0) return null;

  // Filter out regular weekly events that shouldn't show as special event badges
  const excludedEventTypes = [
    'hoh_winner',
    'pov_winner', 
    'nominee',
    'replacement_nominee',
    'evicted',
    'survival',
    'pov_used_on'
  ];

  const specialEventsOnly = events.filter(event => {
    // First check if it's a UUID (new format)
    if (event.event_type.length > 20) {
      // Find the scoring rule to get the subcategory
      const rule = scoringRules.find(r => r.id === event.event_type);
      return rule && !excludedEventTypes.includes(rule.subcategory);
    }
    // Legacy string format
    return !excludedEventTypes.includes(event.event_type);
  });

  if (specialEventsOnly.length === 0) return null;

  const eventCounts = specialEventsOnly.reduce((acc, event) => {
    const type = event.event_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1">
        {Object.entries(eventCounts).map(([eventType, count]) => {
          // Find the first event with this type to get the emoji
          const eventData = specialEventsOnly.find(e => e.event_type === eventType);
          
          let emoji = '✨'; // Default fallback
          let tooltip = 'Special Event';
          
          // Try to get emoji from scoring rules (for UUID event types)
          const rule = scoringRules.find(r => r.id === eventType);
          if (rule) {
            emoji = getScoringRuleEmoji(rule.category, rule.subcategory, rule.emoji);
            tooltip = rule.description || rule.subcategory.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          } else if (eventData?.emoji) {
            // Use custom emoji if available
            emoji = eventData.emoji;
            tooltip = eventData.description || eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          }
          
          return (
            <Tooltip key={eventType}>
              <TooltipTrigger>
                <Badge 
                  variant="outline" 
                  className="text-xs flex items-center justify-center gap-1 min-w-[2rem] h-6"
                >
                  <span className="text-sm flex items-center justify-center">{emoji}</span>
                  {count > 1 && <span className="text-xs">{count}x</span>}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};
