import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { usePool } from '@/contexts/PoolContext';
import { supabase } from '@/integrations/supabase/client';

interface WeekData {
  number: number;
  data: any;
  status: 'not_started' | 'in_progress' | 'completed';
}

interface WeekSelectorProps {
  currentWeek: number;
  onWeekChange: (week: number) => void;
}

export const WeekSelector: React.FC<WeekSelectorProps> = ({ currentWeek, onWeekChange }) => {
  const { activePool } = usePool();
  const [weeks, setWeeks] = useState<WeekData[]>([]);

  useEffect(() => {
    if (activePool?.id) {
      loadAllWeeks();
    }
  }, [activePool?.id]);

  const loadAllWeeks = async () => {
    if (!activePool?.id) return;
    
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
        status: getWeekStatus(data)
      });
      
      // Stop loading if we've gone several weeks without data
      if (i > 5 && !data && weekData.slice(-3).every(w => !w.data)) {
        break;
      }
    }
    
    setWeeks(weekData);
  };

  const getWeekStatus = (weekData: any): 'not_started' | 'in_progress' | 'completed' => {
    if (!weekData) return 'not_started';
    if (weekData.is_draft) return 'in_progress';
    return 'completed';
  };

  const getStatusIcons = (week: WeekData) => {
    if (!week.data) return '';
    
    const icons = [];
    // Add icons based on what's filled
    if (week.data.hoh_winner) icons.push('👑');
    if (week.data.nominees && week.data.nominees.length >= 2) icons.push('🎯');
    if (week.data.pov_winner) icons.push('💎');
    if (week.data.pov_used !== null) icons.push('🔄');
    if (week.data.evicted_contestant) icons.push('🚪');
    
    return icons.length > 0 ? ` ${icons.join(' ')}` : '';
  };

  const getStatusEmoji = (status: 'not_started' | 'in_progress' | 'completed') => {
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return '⏳';
      default: return '⭕';
    }
  };

  return (
    <div className="mb-6">
      <Label className="block text-sm font-medium text-gray-700 mb-2">
        Select Week to View/Edit
      </Label>
      <Select
        value={currentWeek.toString()}
        onValueChange={(value) => onWeekChange(Number(value))}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a week" />
        </SelectTrigger>
        <SelectContent>
          {weeks.map(week => (
            <SelectItem key={week.number} value={week.number.toString()}>
              Week {week.number} {getStatusEmoji(week.status)}{getStatusIcons(week)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Legend */}
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600">
        <span>👑 HOH</span>
        <span>🎯 Nominees</span>
        <span>💎 POV</span>
        <span>🔄 Veto Used</span>
        <span>🚪 Evicted</span>
        <span className="ml-auto">
          ✅ Complete | ⏳ In Progress | ⭕ Not Started
        </span>
      </div>
    </div>
  );
};