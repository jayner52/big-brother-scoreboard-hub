import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Heart, Gift, Crown, Award, Ban, Swords, Star, Trophy } from 'lucide-react';

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
          const { icon: Icon, color, tooltip } = getEventBadgeInfo(eventType);
          
          return (
            <Tooltip key={eventType}>
              <TooltipTrigger>
                <Badge 
                  variant="outline" 
                  className={`text-xs flex items-center gap-1 ${color}`}
                >
                  <Icon className="h-3 w-3" />
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
  const eventMap: Record<string, { icon: React.ComponentType<any>, color: string, tooltip: string }> = {
    'showmance': {
      icon: Heart,
      color: 'bg-pink-100 text-pink-700 border-pink-300',
      tooltip: 'Showmance'
    },
    'bb_arena_winner': {
      icon: Swords,
      color: 'bg-purple-100 text-purple-700 border-purple-300',
      tooltip: 'BB Arena Winner'
    },
    'comeback': {
      icon: Trophy,
      color: 'bg-green-100 text-green-700 border-green-300',
      tooltip: 'Comeback Player'
    },
    'costume_punishment': {
      icon: Crown,
      color: 'bg-orange-100 text-orange-700 border-orange-300',
      tooltip: 'Costume Punishment'
    },
    'punishment': {
      icon: Ban,
      color: 'bg-red-100 text-red-700 border-red-300',
      tooltip: 'Punishment'
    },
    'safety': {
      icon: Award,
      color: 'bg-blue-100 text-blue-700 border-blue-300',
      tooltip: 'Safety Prize'
    },
    'given_power': {
      icon: Star,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      tooltip: 'Given Power'
    },
    'given_prize': {
      icon: Gift,
      color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      tooltip: 'Given Prize'
    },
    'wins_prize': {
      icon: Gift,
      color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      tooltip: 'Won Prize'
    },
    'wins_cash': {
      icon: Trophy,
      color: 'bg-amber-100 text-amber-700 border-amber-300',
      tooltip: 'Won Cash Prize'
    },
    'leaves_early': {
      icon: Ban,
      color: 'bg-gray-100 text-gray-700 border-gray-300',
      tooltip: 'Left Early'
    }
  };
  
  return eventMap[eventType] || {
    icon: Star,
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    tooltip: eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  };
};