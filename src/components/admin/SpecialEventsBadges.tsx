import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SpecialEventsBadgesProps {
  events: Array<{
    event_type: string;
    description?: string;
    points_awarded?: number;
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
          const { emoji, tooltip } = getEventBadgeInfo(eventType);
          
          return (
            <Tooltip key={eventType}>
              <TooltipTrigger>
                <Badge 
                  variant="outline" 
                  className="text-xs flex items-center gap-1"
                >
                  <span className="text-sm">{emoji}</span>
                  {count > 1 && `${count}x`}
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

const getEventBadgeInfo = (eventType: string) => {
  const eventMap: Record<string, { emoji: string, tooltip: string }> = {
    // Showmance events
    'in_showmance': { emoji: '💕', tooltip: 'In Showmance' },
    'showmance': { emoji: '💕', tooltip: 'Showmance' },
    
    // Competition events
    'bb_arena_winner': { emoji: '🏟️', tooltip: 'BB Arena Winner' },
    'hoh_winner': { emoji: '👑', tooltip: 'Head of Household' },
    'pov_winner': { emoji: '🔑', tooltip: 'Power of Veto Winner' },
    
    // Prize and punishment events
    'wins_prize': { emoji: '🎁', tooltip: 'Won Prize' },
    'given_prize': { emoji: '🎁', tooltip: 'Given Prize' },
    'prize_won': { emoji: '🎁', tooltip: 'Prize Won' },
    'wins_cash': { emoji: '💰', tooltip: 'Won Cash Prize' },
    'punishment': { emoji: '⚡', tooltip: 'Punishment' },
    'costume_punishment': { emoji: '🎭', tooltip: 'Costume Punishment' },
    'receives_punishment': { emoji: '⚡', tooltip: 'Received Punishment' },
    
    // Power and safety events
    'power_from_hg': { emoji: '🔮', tooltip: 'Power from Houseguest' },
    'given_power': { emoji: '🔮', tooltip: 'Given Power' },
    'special_power': { emoji: '🔮', tooltip: 'Special Power' },
    'granted_safety': { emoji: '🛡️', tooltip: 'Granted Safety' },
    'safety': { emoji: '🛡️', tooltip: 'Safety Prize' },
    
    // Game milestones
    'jury_member': { emoji: '⚖️', tooltip: 'Jury Member' },
    'americas_favorite': { emoji: '⭐', tooltip: "America's Favorite" },
    'winner': { emoji: '🏆', tooltip: 'Winner' },
    'runner_up': { emoji: '🥈', tooltip: 'Runner-up' },
    
    // Survival bonuses
    'block_survival_2_weeks': { emoji: '💪', tooltip: '2-Week Block Survival' },
    'block_survival_4_weeks': { emoji: '🏰', tooltip: '4-Week Block Survival' },
    'no_comp_4_weeks': { emoji: '😴', tooltip: '4 Weeks No Comp Wins' },
    
    // Return/comeback events
    'comeback': { emoji: '🔄', tooltip: 'Comeback Player' },
    'comes_back': { emoji: '🔄', tooltip: 'Comes Back' },
    
    // Exit events
    'leaves_early': { emoji: '🚪', tooltip: 'Left Early' },
    'leaves_not_eviction': { emoji: '🚪', tooltip: 'Left Not by Eviction' },
    
    // Default/custom
    'custom': { emoji: '✨', tooltip: 'Custom Event' }
  };
  
  return eventMap[eventType] || {
    emoji: '📝',
    tooltip: eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  };
};