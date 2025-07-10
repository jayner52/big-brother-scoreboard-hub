
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePool } from '@/contexts/PoolContext';

export const useSpecialEventStatusSync = () => {
  const { activePool } = usePool();

  const syncContestantStatuses = async () => {
    if (!activePool?.id) return;

    try {
      console.log('🔄 Syncing contestant statuses for pool:', activePool.id);
      
      // Call the database function to update eviction statuses
      const { error } = await supabase.rpc('update_contestant_eviction_status', {
        target_pool_id: activePool.id
      });

      if (error) {
        console.error('❌ Error syncing contestant statuses:', error);
      } else {
        console.log('✅ Contestant statuses synchronized successfully');
      }
    } catch (error) {
      console.error('❌ Failed to sync contestant statuses:', error);
    }
  };

  // Listen for changes to special events and trigger sync
  useEffect(() => {
    if (!activePool?.id) return;

    const channel = supabase
      .channel('special-events-status-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'special_events',
          filter: `pool_id=eq.${activePool.id}`
        },
        (payload) => {
          console.log('🔄 Special event change detected, syncing statuses:', payload);
          syncContestantStatuses();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weekly_events',
          filter: `pool_id=eq.${activePool.id}`
        },
        (payload) => {
          console.log('🔄 Weekly event change detected, syncing statuses:', payload);
          syncContestantStatuses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activePool?.id]);

  return { syncContestantStatuses };
};
