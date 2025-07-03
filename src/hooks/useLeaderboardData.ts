import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PoolEntry } from '@/types/pool';
import { useWeeklySnapshots } from './useWeeklySnapshots';

export const useLeaderboardData = () => {
  const [poolEntries, setPoolEntries] = useState<PoolEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const { snapshots, completedWeeks, loadSnapshotsForWeek } = useWeeklySnapshots();

  useEffect(() => {
    console.log('Leaderboard data effect:', { completedWeeks: completedWeeks.length, selectedWeek });
    if (completedWeeks.length > 0 && selectedWeek === null) {
      const latestWeek = Math.max(...completedWeeks.map(w => w.week_number));
      console.log('Setting selected week to latest:', latestWeek);
      setSelectedWeek(latestWeek);
      loadSnapshotsForWeek(latestWeek);
    } else if (selectedWeek === null) {
      // Show current standings when no week selected
      console.log('Loading current pool entries');
      loadCurrentPoolEntries();
    }
  }, [completedWeeks.length, selectedWeek]); // Removed loadSnapshotsForWeek from deps to prevent infinite loop

  useEffect(() => {
    if (selectedWeek === null) {
      loadCurrentPoolEntries();
    }
  }, [selectedWeek]);

  // Set up real-time subscription for pool entries
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pool_entries'
        },
        () => {
          // Refresh data when entries change
          if (selectedWeek === null) {
            loadCurrentPoolEntries();
          } else {
            loadSnapshotsForWeek(selectedWeek);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedWeek]); // Removed loadSnapshotsForWeek from deps

  const loadCurrentPoolEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('pool_entries')
        .select('*')
        .order('total_points', { ascending: false });

      if (error) throw error;
      
      const mappedEntries = data?.map(entry => ({
        ...entry,
        bonus_answers: entry.bonus_answers as Record<string, any>,
        created_at: new Date(entry.created_at),
        updated_at: new Date(entry.updated_at)
      })) || [];
      
      setPoolEntries(mappedEntries);
    } catch (error) {
      console.error('Error loading pool entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWeekChange = async (weekStr: string) => {
    setLoading(true);
    
    if (weekStr === 'current') {
      setSelectedWeek(null);
      await loadCurrentPoolEntries();
    } else {
      const week = parseInt(weekStr);
      setSelectedWeek(week);
      
      // Load snapshots for the selected week
      await loadSnapshotsForWeek(week);
      
      // Check if we need to generate snapshots after loading attempt
      const snapshotsResult = await supabase
        .from('weekly_team_snapshots')
        .select('id')
        .eq('week_number', week)
        .limit(1);
      
      if (!snapshotsResult.data || snapshotsResult.data.length === 0) {
        try {
          await supabase.rpc('generate_weekly_snapshots', { week_num: week });
          await loadSnapshotsForWeek(week);
        } catch (error) {
          console.error('Error generating snapshots:', error);
          // Fall back to current standings if snapshot generation fails
          setSelectedWeek(null);
          await loadCurrentPoolEntries();
        }
      }
    }
    
    setLoading(false);
  };

  const displayData = selectedWeek && snapshots.length > 0 ? snapshots : poolEntries;
  const showHistoricalColumns = selectedWeek !== null && snapshots.length > 0;

  return {
    displayData,
    showHistoricalColumns,
    selectedWeek,
    completedWeeks,
    loading,
    handleWeekChange
  };
};