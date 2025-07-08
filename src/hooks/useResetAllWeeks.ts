import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePool } from '@/contexts/PoolContext';

export const useResetAllWeeks = () => {
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();
  const { activePool } = usePool();

  const resetAllWeeks = async () => {
    if (!activePool?.id) return;

    setIsResetting(true);
    try {
      // Delete all weekly data
      await Promise.all([
        supabase.from('weekly_events').delete().eq('pool_id', activePool.id),
        supabase.from('special_events').delete().eq('pool_id', activePool.id),
        supabase.from('weekly_results').delete().eq('pool_id', activePool.id),
        supabase.from('weekly_team_snapshots').delete().eq('pool_id', activePool.id)
      ]);

      // Reset all contestant statuses
      await supabase
        .from('contestants')
        .update({
          is_active: true,
          current_hoh: false,
          current_pov_winner: false,
          currently_nominated: false,
          pov_used_on: false,
          americas_favorite: false,
          final_placement: null,
          times_on_block_at_eviction: 0,
          times_saved_by_veto: 0,
          last_competition_win_week: null,
          consecutive_weeks_no_wins: 0,
          block_survival_bonus_2_weeks: false,
          block_survival_bonus_4_weeks: false,
          floater_achievement_earned: false
        })
        .eq('pool_id', activePool.id);

      // Reset current game week to 1
      await supabase.rpc('update_current_game_week', { new_week_number: 1 });

      // Reset pool status
      await supabase
        .from('pools')
        .update({
          season_complete: false,
          finale_week_enabled: false,
          season_locked: false
        })
        .eq('id', activePool.id);

      toast({
        title: "Reset Complete",
        description: "All weekly data has been reset successfully",
      });

      return true;
    } catch (error) {
      console.error('Error resetting weeks:', error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset weekly data. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsResetting(false);
    }
  };

  return {
    resetAllWeeks,
    isResetting
  };
};