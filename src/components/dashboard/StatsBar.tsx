import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Calendar, Clock } from 'lucide-react';
import { usePool } from '@/contexts/PoolContext';
import { useCurrentWeek } from '@/contexts/CurrentWeekContext';
import { calculatePrizes, formatPrize } from '@/utils/prizeCalculation';
import { supabase } from '@/integrations/supabase/client';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ 
  value, 
  duration = 1000, 
  prefix = '', 
  suffix = '' 
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(easeOutCubic * value);
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  return (
    <span className="animate-number font-bold">
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
};

export const StatsBar: React.FC = () => {
  const { activePool, poolEntries } = usePool();
  const { currentWeek } = useCurrentWeek();
  const [totalEntries, setTotalEntries] = useState(0);
  const [dynamicCountdown, setDynamicCountdown] = useState<{
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  } | null>(null);

  useEffect(() => {
    if (activePool?.id) {
      loadEntryCount();
    }
  }, [activePool?.id, poolEntries]);

  useEffect(() => {
    const calculateDynamicCountdown = () => {
      if (!activePool) return null;
      
      const now = new Date();
      
      // Priority 1: Registration deadline countdown (if draft is open and deadline exists)
      if (activePool.draft_open && activePool.registration_deadline) {
        const deadline = new Date(activePool.registration_deadline);
        if (deadline > now) {
          const diff = deadline.getTime() - now.getTime();
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          
          let displayValue = "";
          if (days > 0) {
            displayValue = `${days} day${days !== 1 ? 's' : ''}`;
          } else if (hours > 0) {
            displayValue = `${hours} hour${hours !== 1 ? 's' : ''}`;
          } else {
            displayValue = "< 1 hour";
          }
          
          return {
            label: "Draft Closes In",
            value: displayValue,
            icon: Users,
            color: days < 1 ? 'text-red-600' : 'text-orange-600'
          };
        }
      }
      
      // Priority 2: Next eviction countdown (Thursdays at 8pm ET)
      if (!activePool.season_complete && !activePool.draft_open) {
        const nextThursday = new Date();
        const daysUntilThursday = (4 - nextThursday.getDay() + 7) % 7;
        if (daysUntilThursday === 0 && nextThursday.getHours() >= 20) {
          // It's already Thursday after 8pm, so next Thursday
          nextThursday.setDate(nextThursday.getDate() + 7);
        } else {
          nextThursday.setDate(nextThursday.getDate() + daysUntilThursday);
        }
        nextThursday.setHours(20, 0, 0, 0); // 8pm ET
        
        const diff = nextThursday.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        return {
          label: "Next Eviction",
          value: days === 0 ? "Tonight" : `${days} day${days !== 1 ? 's' : ''}`,
          icon: Clock,
          color: 'text-purple-600'
        };
      }
      
      // Priority 3: Season status
      if (activePool.season_complete) {
        return {
          label: "Season Status",
          value: "Complete",
          icon: Trophy,
          color: 'text-green-600'
        };
      }
      
      // Default: Current week
      return {
        label: "Current Week",
        value: `Week ${currentWeek || 1}`,
        icon: Calendar,
        color: 'text-blue-600'
      };
    };
    
    setDynamicCountdown(calculateDynamicCountdown());
    
    // Update every minute for real-time countdown
    const interval = setInterval(() => {
      setDynamicCountdown(calculateDynamicCountdown());
    }, 60000);
    
    return () => clearInterval(interval);
  }, [activePool, currentWeek]);

  const loadEntryCount = async () => {
    if (!activePool?.id) return;
    
    try {
      const { count } = await supabase
        .from('pool_entries')
        .select('id', { count: 'exact' })
        .eq('pool_id', activePool.id);
      
      setTotalEntries(count || 0);
    } catch (error) {
      console.error('Error loading entry count:', error);
      setTotalEntries(poolEntries.length || 0);
    }
  };

  if (!activePool) return null;

  const prizeCalculation = calculatePrizes(activePool, totalEntries);
  const totalPrizePool = prizeCalculation.totalPrizePool;
  const currency = activePool?.entry_fee_currency || 'CAD';

  const stats = [
    ...(totalEntries >= 5 ? [{
      icon: Trophy,
      label: 'Prize Pool',
      value: totalPrizePool,
      displayValue: formatPrize(totalPrizePool, currency),
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    }] : []),
    {
      icon: Users,
      label: 'Participants',
      value: totalEntries,
      displayValue: totalEntries.toString(),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      icon: Calendar,
      label: 'Current Week',
      value: currentWeek || 1,
      displayValue: `Week ${currentWeek || 1}`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    ...(dynamicCountdown ? [{
      icon: dynamicCountdown.icon,
      label: dynamicCountdown.label,
      value: dynamicCountdown.value,
      displayValue: dynamicCountdown.value,
      color: dynamicCountdown.color,
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200'
    }] : [])
  ];

  return (
    <div className="mb-8 animate-fade-in">
      <div className={`grid gap-4 ${stats.length === 4 ? 'grid-cols-2 lg:grid-cols-4' : stats.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.label} 
              className={`${stat.bgColor} ${stat.borderColor} border-2 hover:shadow-lg transition-all duration-300 animate-slide-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.borderColor} border`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-muted-foreground truncate">
                      {stat.label}
                    </p>
                     <div className={`text-xl font-bold ${stat.color} truncate`}>
                       {typeof stat.value === 'number' && stat.label !== 'Current Week' && !stat.label.includes('Draft') && !stat.label.includes('Eviction') && !stat.label.includes('Season') ? (
                         <AnimatedNumber 
                           value={stat.value} 
                           prefix={stat.label === 'Prize Pool' ? currency === 'USD' ? '$' : '$' : ''}
                         />
                       ) : (
                         stat.displayValue
                       )}
                     </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};