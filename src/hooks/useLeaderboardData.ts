import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PoolEntry } from '@/types/pool';
import { useWeeklySnapshots } from './useWeeklySnapshots';
import { usePool } from '@/contexts/PoolContext';

export const useLeaderboardData = () => {
  const { activePool, poolEntries } = usePool();
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [contestants, setContestants] = useState<Array<{ name: string; is_active: boolean }>>([]);
  const { snapshots, completedWeeks, loadSnapshotsForWeek } = useWeeklySnapshots();

  useEffect(() => {
    const loadContestants = async () => {
      if (!activePool?.id) return;
      
      const { data: contestantsData } = await supabase
        .from('contestants')
        .select('name, is_active')
        .eq('pool_id', activePool.id)
        .order('name');
      
      setContestants(contestantsData || []);
    };

    loadContestants();
    
    console.log('🔍 LEADERBOARD DEBUG - Pool context data:', {
      activePoolId: activePool?.id,
      activePoolName: activePool?.name,
      poolEntriesCount: poolEntries.length,
      completedWeeks: completedWeeks.length,
      selectedWeek
    });
    setLoading(false);
  }, [activePool, poolEntries, completedWeeks.length, selectedWeek]);

  const handleWeekChange = async (weekStr: string) => {
    if (!activePool) {
      console.log('❌ LEADERBOARD DEBUG - No active pool for week change');
      return;
    }

    setLoading(true);
    console.log('🔍 LEADERBOARD DEBUG - Week change requested:', weekStr);
    
    if (weekStr === 'current') {
      setSelectedWeek(null);
    } else {
      const week = parseInt(weekStr);
      setSelectedWeek(week);

      console.log('🔍 LEADERBOARD DEBUG - Checking snapshots for week', week, 'pool', activePool.id);

      // First check if snapshots exist for this week and pool
      const { data: existingSnapshots } = await supabase
        .from('weekly_team_snapshots')
        .select('id')
        .eq('week_number', week)
        .eq('pool_id', activePool.id)
        .limit(1);
      
      if (!existingSnapshots || existingSnapshots.length === 0) {
        console.log('🔄 LEADERBOARD DEBUG - No snapshots found for week', week, 'generating...');
        try {
          await supabase.rpc('generate_weekly_snapshots', { week_num: week });
          console.log('✅ LEADERBOARD DEBUG - Snapshots generated for week', week);
        } catch (error) {
          console.error('❌ LEADERBOARD DEBUG - Error generating snapshots for week', week, ':', error);
        }
      }
      
      // Load snapshots for the selected week
      await loadSnapshotsForWeek(week);
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
    handleWeekChange,
    contestants
  };
};