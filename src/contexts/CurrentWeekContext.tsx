import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CurrentWeekContextType {
  currentWeek: number;
  setCurrentWeek: (week: number) => void;
  isCurrentWeekLoading: boolean;
}

const CurrentWeekContext = createContext<CurrentWeekContextType | undefined>(undefined);

export const useCurrentWeek = () => {
  const context = useContext(CurrentWeekContext);
  if (!context) {
    throw new Error('useCurrentWeek must be used within a CurrentWeekProvider');
  }
  return context;
};

export const CurrentWeekProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentWeek, setCurrentWeekState] = useState(1);
  const [isCurrentWeekLoading, setIsCurrentWeekLoading] = useState(true);

  useEffect(() => {
    loadCurrentWeek();
  }, []);

  const loadCurrentWeek = async () => {
    try {
      // Get all completed weeks to calculate the current week as max(completed_weeks) + 1
      const { data: weeklyData } = await supabase
        .from('weekly_results')
        .select('week_number, is_draft')
        .eq('is_draft', false)
        .order('week_number', { ascending: false });
      
      // Calculate current week as the highest completed week + 1
      const completedWeeks = weeklyData?.map(w => w.week_number) || [];
      const currentWeek = completedWeeks.length > 0 ? Math.max(...completedWeeks) + 1 : 1;
      
      console.log(`CurrentWeekContext: Completed weeks: [${completedWeeks.join(', ')}], Current week: ${currentWeek}`);
      setCurrentWeekState(currentWeek);
    } catch (error) {
      console.error('Error loading current week:', error);
      setCurrentWeekState(1);
    } finally {
      setIsCurrentWeekLoading(false);
    }
  };

  const setCurrentWeek = (week: number) => {
    setCurrentWeekState(week);
  };

  return (
    <CurrentWeekContext.Provider value={{
      currentWeek,
      setCurrentWeek,
      isCurrentWeekLoading
    }}>
      {children}
    </CurrentWeekContext.Provider>
  );
};