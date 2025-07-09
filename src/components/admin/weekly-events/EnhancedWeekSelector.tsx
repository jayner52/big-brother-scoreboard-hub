import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { usePool } from '@/contexts/PoolContext';
import { supabase } from '@/integrations/supabase/client';

interface WeekData {
  number: number;
  data: any;
  status: 'not_started' | 'in_progress' | 'completed';
}

interface WeekStatusIconsProps {
  weekData: any;
  weekNumber: number;
  currentWeek: number;
}

const WeekStatusIcons: React.FC<WeekStatusIconsProps> = ({ weekData, weekNumber, currentWeek }) => {
  const getIcons = () => {
    const icons = [];
    const isCompleted = weekNumber < currentWeek;
    const isInProgress = weekNumber === currentWeek;
    
    // Helper to check if field has valid data
    const hasValidData = (field: any) => {
      return field && field !== '' && field !== 'no-houseguest' && field !== 'no-eviction';
    };
    
    // Regular week icons
    const addRegularWeekIcons = (data: any) => {
      // HOH - Crown
      icons.push({
        type: 'hoh',
        emoji: '👑',
        filled: hasValidData(data?.hoh_winner)
      });
      
      // Nominees - Target icons (always show 2 minimum)
      const nominees = data?.nominees || [];
      const nomineesCount = Math.max(2, nominees.length);
      
      for (let i = 0; i < Math.min(nomineesCount, 4); i++) {
        icons.push({
          type: `nom${i + 1}`,
          emoji: '🎯',
          filled: i < nominees.length && hasValidData(nominees[i])
        });
      }
      
      // POV - Diamond
      icons.push({
        type: 'pov',
        emoji: '💎',
        filled: hasValidData(data?.pov_winner)
      });
      
      // Veto Used - Arrows
      if (data?.pov_used === true) {
        icons.push({
          type: 'veto',
          emoji: '🔄',
          filled: true
        });
      } else if (data?.pov_used === false || data?.pov_winner) {
        icons.push({
          type: 'veto',
          emoji: '🔄',
          filled: false
        });
      }
      
      // Evicted - Door
      const hasEviction = hasValidData(data?.evicted_contestant) || 
                         hasValidData(data?.second_evicted_contestant) || 
                         hasValidData(data?.third_evicted_contestant);
      icons.push({
        type: 'evicted',
        emoji: '🚪',
        filled: hasEviction
      });
    };
    
    // Add icons based on eviction type
    if (weekData?.is_triple_eviction) {
      // Triple eviction - 3 rounds
      addRegularWeekIcons(weekData);
      icons.push({ type: 'divider', text: 'TE', color: 'text-purple-600' });
      addRegularWeekIcons(weekData);
      icons.push({ type: 'divider', text: 'TE', color: 'text-purple-600' });
      addRegularWeekIcons(weekData);
    } else if (weekData?.is_double_eviction) {
      // Double eviction - 2 rounds
      addRegularWeekIcons(weekData);
      icons.push({ type: 'divider', text: 'DE', color: 'text-red-600' });
      addRegularWeekIcons(weekData);
    } else {
      // Regular week
      addRegularWeekIcons(weekData);
    }
    
    return icons;
  };
  
  const icons = getIcons();
  
  return (
    <span className="inline-flex items-center gap-0.5 ml-2">
      {icons.map((icon, idx) => {
        if (icon.type === 'divider') {
          return (
            <span key={idx} className={`mx-1 text-xs font-bold ${icon.color}`}>
              {icon.text}
            </span>
          );
        }
        
        return (
          <span
            key={idx}
            className={`text-sm transition-opacity ${
              icon.filled ? 'opacity-100' : 'opacity-30'
            }`}
            title={`${icon.type}: ${icon.filled ? 'Complete' : 'Pending'}`}
          >
            {icon.emoji}
          </span>
        );
      })}
    </span>
  );
};

interface EnhancedWeekSelectorProps {
  currentWeek: number;
  onWeekChange: (week: number) => void;
}

export const EnhancedWeekSelector: React.FC<EnhancedWeekSelectorProps> = ({ 
  currentWeek, 
  onWeekChange 
}) => {
  const { activePool } = usePool();
  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activePool?.id) {
      loadAllWeeks();
      
      // Subscribe to real-time updates
      const channel = supabase
        .channel('weekly-results-live')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'weekly_results',
          filter: `pool_id=eq.${activePool.id}`
        }, (payload) => {
          console.log('Weekly results changed:', payload);
          // Reload weeks when any change happens
          loadAllWeeks();
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activePool?.id]);

  const loadAllWeeks = async () => {
    if (!activePool?.id) return;
    
    setLoading(true);
    try {
      const weekData: WeekData[] = [];
      
      // Load up to 20 weeks or until we have enough data
      for (let i = 1; i <= 20; i++) {
        const { data } = await supabase
          .from('weekly_results')
          .select('*')
          .eq('pool_id', activePool.id)
          .eq('week_number', i)
          .maybeSingle();
        
        weekData.push({
          number: i,
          data: data,
          status: getWeekStatus(data, i)
        });
        
        // Stop loading if we've gone several weeks without data
        if (i > 5 && !data && weekData.slice(-3).every(w => !w.data)) {
          break;
        }
      }
      
      setWeeks(weekData);
    } catch (error) {
      console.error('Error loading weeks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekStatus = (weekData: any, weekNumber: number): 'not_started' | 'in_progress' | 'completed' => {
    if (!weekData) return 'not_started';
    if (weekData.is_draft) return 'in_progress';
    if (weekNumber < currentWeek) return 'completed';
    return 'completed';
  };

  const getStatusText = (status: 'not_started' | 'in_progress' | 'completed') => {
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return '⏳';
      default: return '⭕';
    }
  };

  const getStatusLabel = (status: 'not_started' | 'in_progress' | 'completed') => {
    switch (status) {
      case 'completed': return 'Complete';
      case 'in_progress': return 'In Progress';
      default: return 'Not Started';
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading weeks...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="block text-sm font-medium mb-2">
          Select Week to View/Edit
        </Label>
        <Select
          value={currentWeek.toString()}
          onValueChange={(value) => onWeekChange(Number(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a week" />
          </SelectTrigger>
          <SelectContent className="max-h-80 overflow-y-auto">
            {weeks.map(week => (
              <SelectItem 
                key={week.number} 
                value={week.number.toString()}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Week {week.number}</span>
                    <Badge 
                      variant={week.status === 'completed' ? 'default' : 
                               week.status === 'in_progress' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {getStatusLabel(week.status)}
                    </Badge>
                  </div>
                  <WeekStatusIcons 
                    weekData={week.data} 
                    weekNumber={week.number}
                    currentWeek={currentWeek}
                  />
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Legend */}
      <div className="bg-muted/30 p-3 rounded-lg">
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span>👑</span> HOH
          </span>
          <span className="flex items-center gap-1">
            <span>🎯</span> Nominees
          </span>
          <span className="flex items-center gap-1">
            <span>💎</span> POV
          </span>
          <span className="flex items-center gap-1">
            <span>🔄</span> Veto Used
          </span>
          <span className="flex items-center gap-1">
            <span>🚪</span> Evicted
          </span>
          <div className="ml-auto flex gap-3">
            <span>✅ Complete</span>
            <span>⏳ In Progress</span>
            <span>⭕ Not Started</span>
          </div>
        </div>
      </div>
    </div>
  );
};