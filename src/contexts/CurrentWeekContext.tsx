import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface CurrentWeekContextType {
  currentWeek: number;
  setCurrentWeek: (week: number) => void;
  isCurrentWeekLoading: boolean;
  error: string | null;
  refreshCurrentWeek: () => Promise<void>;
  minWeek: number;
  maxWeek: number;
}

const CurrentWeekContext = createContext<CurrentWeekContextType | undefined>(undefined);

export const useCurrentWeek = () => {
  const context = useContext(CurrentWeekContext);
  if (!context) {
    throw new Error('useCurrentWeek must be used within a CurrentWeekProvider');
  }
  return context;
};

const MIN_WEEK = 1;
const MAX_WEEK = 20; // Adjust based on your season length

export const CurrentWeekProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentWeek, setCurrentWeekState] = useState(MIN_WEEK);
  const [isCurrentWeekLoading, setIsCurrentWeekLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weeklyResultsChannel, setWeeklyResultsChannel] = useState<RealtimeChannel | null>(null);

  const loadCurrentWeek = useCallback(async () => {
    try {
      setError(null);
      setIsCurrentWeekLoading(true);
      
      // Get current user's active pool first
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) return;

      const { data: membership } = await supabase
        .from('pool_memberships')
        .select('pool_id')
        .eq('user_id', session.session.user.id)
        .eq('active', true)
        .limit(1)
        .single();

      if (!membership) {
        console.log('CurrentWeekContext: No active pool membership found');
        setCurrentWeekState(MIN_WEEK);
        return;
      }

      console.log('CurrentWeekContext: Loading weeks for pool:', membership.pool_id);
      
      // Get all completed weeks for THIS POOL ONLY to calculate the current week
      const { data: weeklyData, error: fetchError } = await supabase
        .from('weekly_results')
        .select('week_number')
        .eq('is_draft', false)
        .eq('pool_id', membership.pool_id)
        .order('week_number', { ascending: false });
      
      if (fetchError) {
        throw new Error(`Failed to load weekly results: ${fetchError.message}`);
      }
      
      // Calculate current week as the highest completed week + 1
      const completedWeeks = weeklyData?.map(w => w.week_number) || [];
      const calculatedWeek = completedWeeks.length > 0 
        ? Math.min(Math.max(...completedWeeks) + 1, MAX_WEEK)
        : MIN_WEEK;
      
      console.log(`CurrentWeekContext: Pool ${membership.pool_id} - Completed weeks: [${completedWeeks.join(', ')}], Current week: ${calculatedWeek}`);
      setCurrentWeekState(calculatedWeek);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error loading current week';
      console.error('❌ CurrentWeekContext - Error loading current week:', errorMessage);
      setError(errorMessage);
      // Keep the existing week on error rather than defaulting to 1
    } finally {
      setIsCurrentWeekLoading(false);
    }
  }, []);

  // Set up real-time subscription for weekly results changes
  useEffect(() => {
    loadCurrentWeek();

    // Subscribe to changes in weekly_results table for the current pool
    const channel = supabase
      .channel('weekly-results-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weekly_results',
          filter: 'is_draft=eq.false'
        },
        (payload) => {
          console.log('CurrentWeekContext: Weekly results changed:', payload);
          // Refresh current week when any non-draft weekly result is added/updated/deleted
          loadCurrentWeek();
        }
      )
      .subscribe();

    setWeeklyResultsChannel(channel);

    // Cleanup subscription
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [loadCurrentWeek]);

  const setCurrentWeek = useCallback((week: number) => {
    // Validate week number
    if (week < MIN_WEEK || week > MAX_WEEK) {
      console.warn(`Attempted to set invalid week ${week}. Must be between ${MIN_WEEK} and ${MAX_WEEK}`);
      return;
    }
    setCurrentWeekState(week);
  }, []);

  const refreshCurrentWeek = useCallback(async () => {
    await loadCurrentWeek();
  }, [loadCurrentWeek]);

  const contextValue: CurrentWeekContextType = {
    currentWeek,
    setCurrentWeek,
    isCurrentWeekLoading,
    error,
    refreshCurrentWeek,
    minWeek: MIN_WEEK,
    maxWeek: MAX_WEEK
  };

  return (
    <CurrentWeekContext.Provider value={contextValue}>
      {children}
    </CurrentWeekContext.Provider>
  );
};