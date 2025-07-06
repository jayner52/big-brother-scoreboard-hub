import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Crown, Target, Award, RotateCcw, DoorOpen } from 'lucide-react';
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

  const getStatusText = (status: 'not_started' | 'in_progress' | 'completed') => {
    switch (status) {
      case 'completed': return 'Complete';
      case 'in_progress': return 'In Progress';
      default: return 'Not Started';
    }
  };

  const renderWeekIcons = (week: WeekData) => {
    if (!week.data) {
      // Show empty icons for not started weeks
      return (
        <div className="flex gap-1 ml-2">
          <Crown className="h-3 w-3 text-gray-300" />
          <Target className="h-3 w-3 text-gray-300" />
          <Target className="h-3 w-3 text-gray-300" />
          <Award className="h-3 w-3 text-gray-300" />
          <RotateCcw className="h-3 w-3 text-gray-300" />
          <DoorOpen className="h-3 w-3 text-gray-300" />
        </div>
      );
    }

    const icons = [];
    
    // HOH Winner - Crown (yellow if filled, gray if empty)
    icons.push(
      <Crown 
        key="hoh"
        className={`h-3 w-3 ${week.data.hoh_winner ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
      />
    );
    
    // Nominees - Target icons (red if filled, based on count)
    const nomineesCount = week.data.nominees?.length || 0;
    const maxNominees = Math.max(2, nomineesCount); // Show at least 2, up to actual count
    
    for (let i = 0; i < Math.min(maxNominees, 4); i++) {
      icons.push(
        <Target 
          key={`nominee-${i}`}
          className={`h-3 w-3 ${i < nomineesCount ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} 
        />
      );
    }
    
    // POV Winner - Award (green if filled, gray if empty)
    icons.push(
      <Award 
        key="pov"
        className={`h-3 w-3 ${week.data.pov_winner ? 'text-green-500 fill-green-500' : 'text-gray-300'}`} 
      />
    );
    
    // Veto Used - RotateCcw (blue if used, gray if not)
    icons.push(
      <RotateCcw 
        key="veto"
        className={`h-3 w-3 ${week.data.pov_used ? 'text-blue-500 fill-blue-500' : 'text-gray-300'}`} 
      />
    );
    
    // Evicted - DoorOpen (red if someone evicted, gray if not)
    const hasEviction = week.data.evicted_contestant || week.data.second_evicted_contestant || week.data.third_evicted_contestant;
    icons.push(
      <DoorOpen 
        key="evicted"
        className={`h-3 w-3 ${hasEviction ? 'text-red-600 fill-red-600' : 'text-gray-300'}`} 
      />
    );

    return <div className="flex gap-1 ml-2">{icons}</div>;
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
              <div className="flex items-center justify-between w-full">
                <span>Week {week.number} - {getStatusText(week.status)}</span>
                {renderWeekIcons(week)}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};