
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
  const [draftCountdown, setDraftCountdown] = useState<{
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    expired: boolean;
  } | null>(null);

  useEffect(() => {
    if (activePool?.id) {
      loadEntryCount();
    }
  }, [activePool?.id, poolEntries]);

  useEffect(() => {
    const calculateDraftCountdown = () => {
      if (!activePool?.registration_deadline) return null;
      
      const now = new Date();
      const deadline = new Date(activePool.registration_deadline);
      
      if (deadline <= now) {
        // Deadline has passed
        return {
          label: "Draft Deadline",
          value: "Expired",
          icon: Clock,
          color: 'text-red-600',
          expired: true
        };
      }
      
      // Calculate time remaining
      const diff = deadline.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      let displayValue = "";
      let color = "text-blue-600";
      
      if (days > 0) {
        displayValue = `${days} day${days !== 1 ? 's' : ''}`;
        if (days <= 1) color = "text-orange-600";
      } else if (hours > 0) {
        displayValue = `${hours}h ${minutes}m`;
        color = "text-orange-600";
      } else {
        displayValue = `${minutes} min${minutes !== 1 ? 's' : ''}`;
        color = "text-red-600";
      }
      
      return {
        label: "Draft Closes In",
        value: displayValue,
        icon: Clock,
        color,
        expired: false
      };
    };
    
    setDraftCountdown(calculateDraftCountdown());
    
    // Update every minute for real-time countdown
    const interval = setInterval(() => {
      setDraftCountdown(calculateDraftCountdown());
    }, 60000);
    
    return () => clearInterval(interval);
  }, [activePool]);

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

  // Build the stats array based on countdown status
  const baseStats = [
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
    }
  ];

  // Only show countdown if deadline exists and hasn't expired
  const showCountdown = draftCountdown && !draftCountdown.expired;
  
  const stats = showCountdown ? [
    ...baseStats,
    {
      icon: draftCountdown.icon,
      label: draftCountdown.label,
      value: draftCountdown.value,
      displayValue: draftCountdown.value,
      color: draftCountdown.color,
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200'
    }
  ] : baseStats;

  // Determine grid layout: 3 columns when countdown shows, 2 centered when it doesn't
  const gridClasses = showCountdown 
    ? `grid gap-4 ${stats.length === 3 ? 'grid-cols-1 md:grid-cols-3' : stats.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`
    : 'grid gap-4 grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto';

  return (
    <div className="mb-8 animate-fade-in">
      <div className={gridClasses}>
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
                       {typeof stat.value === 'number' && stat.label !== 'Participants' ? (
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
