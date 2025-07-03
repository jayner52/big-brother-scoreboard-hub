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
      // Get the highest week number that exists
      const { data: weeklyData } = await supabase
        .from('weekly_results')
        .select('week_number')
        .order('week_number', { ascending: false })
        .limit(1);
      
      const week = weeklyData?.[0]?.week_number ? weeklyData[0].week_number : 1;
      setCurrentWeekState(week);
    } catch (error) {
      console.error('Error loading current week:', error);
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