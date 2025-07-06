import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PoolEntry } from '@/types/pool';
import { usePool } from '@/contexts/PoolContext';

export const useSimpleLeaderboard = () => {
  const [poolEntries, setPoolEntries] = useState<PoolEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { activePool } = usePool();

  useEffect(() => {
    if (activePool?.id) {
      loadLeaderboard();
    }
  }, [activePool?.id]);

  // Set up real-time subscription
  useEffect(() => {
    if (!activePool?.id) return;

    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pool_entries',
          filter: `pool_id=eq.${activePool.id}`
        },
        () => {
          console.log('🔄 Pool entries changed, reloading leaderboard');
          loadLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activePool?.id]);

  const loadLeaderboard = async () => {
    if (!activePool?.id) {
      console.log('❌ No active pool to load leaderboard for');
      setPoolEntries([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Loading leaderboard for pool:', activePool.id);

      const { data, error: queryError } = await supabase
        .from('pool_entries')
        .select('*')
        .eq('pool_id', activePool.id)
        .order('total_points', { ascending: false });

      if (queryError) {
        console.error('❌ Leaderboard query error:', queryError);
        throw queryError;
      }

      console.log('✅ Leaderboard loaded:', data?.length || 0, 'entries');
      
      const mappedEntries = data?.map(entry => ({
        ...entry,
        bonus_answers: entry.bonus_answers as Record<string, any>,
        created_at: new Date(entry.created_at),
        updated_at: new Date(entry.updated_at)
      })) || [];

      setPoolEntries(mappedEntries);
    } catch (err) {
      console.error('❌ Failed to load leaderboard:', err);
      setError('Failed to load leaderboard');
      setPoolEntries([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    poolEntries,
    loading,
    error,
    reload: loadLeaderboard
  };
};