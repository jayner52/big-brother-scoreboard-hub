import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WeeklySnapshot {
  id: string;
  pool_entry_id: string;
  week_number: number;
  weekly_points: number;
  bonus_points: number;
  total_points: number;
  rank_position: number;
  points_change: number;
  rank_change: number;
  created_at: string;
}

export interface CompletedWeek {
  week_number: number;
  created_at: string;
}

export const useWeeklySnapshots = () => {
  const [snapshots, setSnapshots] = useState<WeeklySnapshot[]>([]);
  const [completedWeeks, setCompletedWeeks] = useState<CompletedWeek[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCompletedWeeks = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_results')
        .select('week_number, created_at')
        .eq('is_draft', false)
        .order('week_number', { ascending: false });

      if (error) throw error;
      setCompletedWeeks(data || []);
    } catch (error) {
      console.error('Error loading completed weeks:', error);
    }
  };

  const loadSnapshotsForWeek = async (weekNumber: number) => {
    try {
      // Get current user's active pool
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) return;

      const { data: membership } = await supabase
        .from('pool_memberships')
        .select('pool_id')
        .eq('user_id', session.session.user.id)
        .eq('active', true)
        .limit(1)
        .single();

      if (!membership) return;

      const { data, error } = await supabase
        .from('weekly_team_snapshots')
        .select(`
          *,
          pool_entries!inner(team_name, participant_name, player_1, player_2, player_3, player_4, player_5, payment_confirmed)
        `)
        .eq('week_number', weekNumber)
        .eq('pool_id', membership.pool_id)
        .order('rank_position', { ascending: true });

      if (error) throw error;
      setSnapshots(data || []);
    } catch (error) {
      console.error('Error loading weekly snapshots:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSnapshotForWeek = async (weekNumber: number) => {
    try {
      const { error } = await supabase.rpc('generate_weekly_snapshots', {
        week_num: weekNumber
      });

      if (error) throw error;
      await loadSnapshotsForWeek(weekNumber);
    } catch (error) {
      console.error('Error generating snapshot:', error);
    }
  };

  useEffect(() => {
    loadCompletedWeeks();
  }, []);

  return {
    snapshots,
    completedWeeks,
    loading,
    loadSnapshotsForWeek,
    generateSnapshotForWeek,
    refreshCompletedWeeks: loadCompletedWeeks
  };
};