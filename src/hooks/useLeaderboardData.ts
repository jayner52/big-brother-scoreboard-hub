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
    // Always default to current standings to show all teams
    if (selectedWeek === null) {
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
      console.log('🔍 LEADERBOARD DEBUG - Loading current pool entries...');
      
      // Get current user's active pool
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        console.log('❌ LEADERBOARD DEBUG - User not authenticated');
        setPoolEntries([]);
        return;
      }

      console.log('🔍 LEADERBOARD DEBUG - User ID:', session.session.user.id);

      const { data: membership } = await supabase
        .from('pool_memberships')
        .select('pool_id')
        .eq('user_id', session.session.user.id)
        .eq('active', true)
        .limit(1)
        .single();

      if (!membership) {
        console.log('❌ LEADERBOARD DEBUG - No active pool membership found');
        setPoolEntries([]);
        return;
      }

      console.log('🔍 LEADERBOARD DEBUG - Active pool ID:', membership.pool_id);
      
      const { data, error } = await supabase
        .from('pool_entries')
        .select('*')
        .eq('pool_id', membership.pool_id)
        .order('total_points', { ascending: false });

      if (error) {
        console.error('❌ LEADERBOARD DEBUG - Query error:', error);
        throw error;
      }
      
      console.log('✅ LEADERBOARD DEBUG - Raw pool entries data:', {
        entryCount: data?.length || 0,
        sampleEntry: data?.[0] ? {
          id: data[0].id,
          team_name: data[0].team_name,
          participant_name: data[0].participant_name,
          total_points: data[0].total_points
        } : null
      });
      
      if (!data || data.length === 0) {
        console.log('⚠️ LEADERBOARD DEBUG - No pool entries found for pool:', membership.pool_id);
        setPoolEntries([]);
        return;
      }
      
      const mappedEntries = data.map(entry => ({
        ...entry,
        bonus_answers: entry.bonus_answers as Record<string, any>,
        created_at: new Date(entry.created_at),
        updated_at: new Date(entry.updated_at)
      }));
      
      console.log('✅ LEADERBOARD DEBUG - Mapped entries count:', mappedEntries.length);
      console.log('✅ LEADERBOARD DEBUG - Sample mapped entry:', {
        team_name: mappedEntries[0]?.team_name,
        total_points: mappedEntries[0]?.total_points,
        participant_name: mappedEntries[0]?.participant_name
      });
      
      setPoolEntries(mappedEntries);
    } catch (error) {
      console.error('❌ LEADERBOARD DEBUG - Error loading pool entries:', error);
      setPoolEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWeekChange = async (weekStr: string) => {
    setLoading(true);
    console.log('🔍 LEADERBOARD DEBUG - Week change requested:', weekStr);
    
    if (weekStr === 'current') {
      setSelectedWeek(null);
      await loadCurrentPoolEntries();
    } else {
      const week = parseInt(weekStr);
      setSelectedWeek(week);
      
      // Get current user's active pool first
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        console.log('❌ LEADERBOARD DEBUG - User not authenticated for week change');
        setLoading(false);
        return;
      }

      const { data: membership } = await supabase
        .from('pool_memberships')
        .select('pool_id')
        .eq('user_id', session.session.user.id)
        .eq('active', true)
        .limit(1)
        .single();

      if (!membership) {
        console.log('❌ LEADERBOARD DEBUG - No pool membership for week change');
        setLoading(false);
        return;
      }

      console.log('🔍 LEADERBOARD DEBUG - Checking snapshots for week', week, 'pool', membership.pool_id);

      // First check if snapshots exist for this week and pool
      const { data: existingSnapshots } = await supabase
        .from('weekly_team_snapshots')
        .select('id')
        .eq('week_number', week)
        .eq('pool_id', membership.pool_id)
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
    handleWeekChange
  };
};