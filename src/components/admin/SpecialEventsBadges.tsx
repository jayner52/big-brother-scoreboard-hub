import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getSpecialEventIcon } from '@/utils/specialEventIcons';

interface SpecialEventsBadgesProps {
  events: Array<{
    event_type: string;
    description?: string;
    points_awarded?: number;
    emoji?: string;
  }>;
}

export const SpecialEventsBadges: React.FC<SpecialEventsBadgesProps> = ({ events }) => {
  if (events.length === 0) return null;

  const eventCounts = events.reduce((acc, event) => {
    const type = event.event_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1">
        {Object.entries(eventCounts).map(([eventType, count]) => {
          // Prioritize custom emoji from database over default icons
          const eventWithEmoji = events.find(e => e.event_type === eventType && e.emoji);
          const emoji = eventWithEmoji?.emoji || getSpecialEventIcon(eventType);
          const tooltip = getEventTooltip(eventType);
          
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

const getEventTooltip = (eventType: string): string => {
  const tooltipMap: Record<string, string> = {
    // Showmance events
    'in_showmance': 'In Showmance',
    'showmance': 'Showmance',
    
    // Competition events
    'bb_arena_winner': 'BB Arena Winner',
    'hoh_winner': 'Head of Household',
    'pov_winner': 'Power of Veto Winner',
    
    // Prize and punishment events
    'wins_prize': 'Won Prize',
    'given_prize': 'Given Prize',
    'prize_won': 'Prize Won',
    'wins_cash': 'Won Cash Prize',
    'punishment': 'Punishment',
    'costume_punishment': 'Costume Punishment',
    'receives_punishment': 'Received Punishment',
    
    // Power and safety events
    'power_from_hg': 'Power from Houseguest',
    'given_power': 'Given Power',
    'special_power': 'Special Power',
    'granted_safety': 'Granted Safety',
    'safety': 'Safety Prize',
    
    // Game milestones
    'jury_member': 'Jury Member',
    'americas_favorite': "America's Favorite",
    'winner': 'Winner',
    'runner_up': 'Runner-up',
    
    // Survival bonuses
    'block_survival_2_weeks': '2-Week Block Survival',
    'block_survival_4_weeks': '4-Week Block Survival',
    'no_comp_4_weeks': '4 Weeks No Comp Wins',
    
    // Return/comeback events
    'comeback': 'Comeback Player',
    'comes_back': 'Comes Back',
    
    // Exit events
    'leaves_early': 'Left Early',
    'leaves_not_eviction': 'Left Not by Eviction',
    
    // Default/custom
    'custom': 'Custom Event'
  };
  
  return tooltipMap[eventType] || eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};