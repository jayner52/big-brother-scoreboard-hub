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
  const [daysUntilFinale, setDaysUntilFinale] = useState<number | null>(null);

  useEffect(() => {
    if (activePool?.id) {
      loadEntryCount();
    }
  }, [activePool?.id, poolEntries]);

  useEffect(() => {
    // Calculate days until finale (assuming season ends around week 13-14)
    const finaleWeek = 14; // Typical BB season length
    const daysPerWeek = 7;
    const currentWeekNum = currentWeek || 1;
    const weeksRemaining = Math.max(0, finaleWeek - currentWeekNum);
    setDaysUntilFinale(weeksRemaining * daysPerWeek);
  }, [currentWeek]);

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
    {
      icon: Clock,
      label: 'Days to Finale',
      value: daysUntilFinale || 0,
      displayValue: daysUntilFinale ? `${daysUntilFinale} days` : 'TBD',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200'
    }
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
                      {typeof stat.value === 'number' && stat.label !== 'Current Week' && stat.label !== 'Days to Finale' ? (
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