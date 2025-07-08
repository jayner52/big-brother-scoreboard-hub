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
    
    // Load up to 14 weeks (expected season length)
    for (let i = 1; i <= 14; i++) {
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
      
      // Continue loading all 14 weeks regardless of data presence
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

    console.log('🔍 Week', week.number, 'data:', week.data);
    
    const icons = [];
    const isDoubleEviction = week.data.is_double_eviction;
    const isTripleEviction = week.data.is_triple_eviction;
    
    // First round icons
    icons.push(
      <Crown 
        key="hoh"
        className={`h-3 w-3 ${week.data.hoh_winner ? 'text-yellow-500' : 'text-gray-300'}`} 
      />
    );
    
    // Nominees - Target icons (red if filled)
    const nominees = week.data.nominees || [];
    const nomineesCount = nominees.filter(n => n && n.trim()).length;
    console.log('🔍 Week', week.number, 'nominees array:', nominees, 'filtered count:', nomineesCount);
    const maxNominees = Math.max(2, nomineesCount);
    
    for (let i = 0; i < Math.min(maxNominees, 4); i++) {
      icons.push(
        <Target 
          key={`nominee-${i}`}
          className={`h-3 w-3 ${i < nomineesCount ? 'text-red-500' : 'text-gray-300'}`} 
        />
      );
    }
    
    // POV Winner - Award (green if filled)
    icons.push(
      <Award 
        key="pov"
        className={`h-3 w-3 ${week.data.pov_winner ? 'text-green-500' : 'text-gray-300'}`} 
      />
    );
    
    // Veto Used - RotateCcw (blue if used)
    icons.push(
      <RotateCcw 
        key="veto"
        className={`h-3 w-3 ${week.data.pov_used ? 'text-blue-500' : 'text-gray-300'}`} 
      />
    );
    
    // Evicted - DoorOpen (brown if someone evicted)
    const hasEviction = week.data.evicted_contestant;
    icons.push(
      <DoorOpen 
        key="evicted"
        className={`h-3 w-3 ${hasEviction ? 'text-amber-700' : 'text-gray-300'}`} 
      />
    );

    // Final Week Awards - only show if this is a final week
    const isFinalWeek = week.data.winner || week.data.runner_up || week.data.americas_favorite_player;
    if (isFinalWeek) {
      // Winner - Trophy (gold if filled)
      if (week.data.winner) {
        icons.push(
          <span key="winner" className="text-xs" title="Winner">🏆</span>
        );
      }
      
      // Runner-up - Medal (silver if filled)  
      if (week.data.runner_up) {
        icons.push(
          <span key="runner-up" className="text-xs" title="Runner-up">🥈</span>
        );
      }
      
      // America's Favorite - Heart (red if filled)
      if (week.data.americas_favorite_player) {
        icons.push(
          <span key="afp" className="text-xs" title="America's Favorite Player">❤️</span>
        );
      }
    }

    // Add double/triple eviction indicators
    if (isDoubleEviction || isTripleEviction) {
      // Add DE/TE indicator
      icons.push(
        <span key="de-indicator" className="text-xs font-bold text-purple-600 mx-1">
          {isTripleEviction ? 'TE' : 'DE'}
        </span>
      );

      // Second round icons
      icons.push(
        <Crown 
          key="hoh2"
          className={`h-3 w-3 ${week.data.second_hoh_winner ? 'text-yellow-500' : 'text-gray-300'}`} 
        />
      );
      
      const secondNomineesCount = week.data.second_nominees?.length || 0;
      for (let i = 0; i < Math.min(2, Math.max(2, secondNomineesCount)); i++) {
        icons.push(
          <Target 
            key={`nominee2-${i}`}
            className={`h-3 w-3 ${i < secondNomineesCount ? 'text-red-500' : 'text-gray-300'}`} 
          />
        );
      }
      
      icons.push(
        <Award 
          key="pov2"
          className={`h-3 w-3 ${week.data.second_pov_winner ? 'text-green-500' : 'text-gray-300'}`} 
        />
      );
      
      icons.push(
        <RotateCcw 
          key="veto2"
          className={`h-3 w-3 ${week.data.second_pov_used ? 'text-blue-500' : 'text-gray-300'}`} 
        />
      );
      
      const hasSecondEviction = week.data.second_evicted_contestant;
      icons.push(
        <DoorOpen 
          key="evicted2"
          className={`h-3 w-3 ${hasSecondEviction ? 'text-amber-700' : 'text-gray-300'}`} 
        />
      );

      // Third round icons for triple eviction
      if (isTripleEviction) {
        icons.push(
          <Crown 
            key="hoh3"
            className={`h-3 w-3 ${week.data.third_hoh_winner ? 'text-yellow-500' : 'text-gray-300'}`} 
          />
        );
        
        const thirdNomineesCount = week.data.third_nominees?.length || 0;
        for (let i = 0; i < Math.min(2, Math.max(2, thirdNomineesCount)); i++) {
          icons.push(
            <Target 
              key={`nominee3-${i}`}
              className={`h-3 w-3 ${i < thirdNomineesCount ? 'text-red-500' : 'text-gray-300'}`} 
            />
          );
        }
        
        icons.push(
          <Award 
            key="pov3"
            className={`h-3 w-3 ${week.data.third_pov_winner ? 'text-green-500' : 'text-gray-300'}`} 
          />
        );
        
        icons.push(
          <RotateCcw 
            key="veto3"
            className={`h-3 w-3 ${week.data.third_pov_used ? 'text-blue-500' : 'text-gray-300'}`} 
          />
        );
        
        const hasThirdEviction = week.data.third_evicted_contestant;
        icons.push(
          <DoorOpen 
            key="evicted3"
            className={`h-3 w-3 ${hasThirdEviction ? 'text-amber-700' : 'text-gray-300'}`} 
          />
        );
      }
    }

    return <div className="flex gap-1 ml-2 flex-wrap">{icons}</div>;
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