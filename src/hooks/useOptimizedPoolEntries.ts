import { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { calculatePrizes } from '@/utils/prizeCalculation';

interface PoolEntry {
  id: string;
  participant_name: string;
  team_name: string;
  player_1: string;
  player_2: string;
  player_3: string;
  player_4: string;
  player_5: string;
  payment_confirmed: boolean;
  total_points: number;
  created_at: string;
  email: string;
  user_id: string;
  deleted_at?: string;
  deleted_by_user?: boolean;
  final_position?: number;
  prize_amount?: number;
  prize_status?: 'none' | 'pending_info' | 'info_submitted' | 'sent';
}

interface UseOptimizedPoolEntriesOptions {
  poolId: string;
  pageSize?: number;
  includeDeleted?: boolean;
}

export const useOptimizedPoolEntries = ({ 
  poolId, 
  pageSize = 50,
  includeDeleted = false
}: UseOptimizedPoolEntriesOptions) => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<PoolEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [winners, setWinners] = useState<any[]>([]);
  const [paymentDetails, setPaymentDetails] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);

  // Memoize enhanced entries to prevent unnecessary recalculations
  const enhancedEntries = useMemo(() => {
    if (!entries.length) return [];
    
    // This calculation is expensive, so we memoize it
    const prizeInfo = calculatePrizes({ id: poolId } as any, entries.length);
    
    return entries.map((entry, index) => {
      const finalPosition = index + 1;
      const prizeForPosition = prizeInfo.prizes.find(p => p.place === finalPosition);
      const winner = winners.find(w => w.user_id === entry.user_id);
      const paymentDetail = paymentDetails.find(pd => pd.user_id === entry.user_id);
      
      let prizeStatus: 'none' | 'pending_info' | 'info_submitted' | 'sent' = 'none';
      if (winner) {
        if (winner.prize_sent) {
          prizeStatus = 'sent';
        } else if (paymentDetail) {
          prizeStatus = 'info_submitted';
        } else {
          prizeStatus = 'pending_info';
        }
      }

      return {
        ...entry,
        final_position: finalPosition,
        prize_amount: winner ? winner.amount : (prizeForPosition?.amount || 0),
        prize_status: prizeStatus
      };
    });
  }, [entries, winners, paymentDetails, poolId]);

  // Batch load all required data in a single operation
  const loadData = useCallback(async (page = 1) => {
    if (!poolId) return;
    
    try {
      setLoading(true);
      
      const offset = (page - 1) * pageSize;
      
      // Build query based on includeDeleted flag
      let entriesQuery = supabase
        .from('pool_entries')
        .select('*', { count: 'exact' })
        .eq('pool_id', poolId);

      if (!includeDeleted) {
        entriesQuery = entriesQuery.is('deleted_at', null);
      }

      // Single batch query for better performance
      const [
        { data: entriesData, error: entriesError, count },
        { data: winnersData, error: winnersError },
        { data: paymentDetailsData, error: paymentError }
      ] = await Promise.all([
        entriesQuery
          .order('total_points', { ascending: false })
          .range(offset, offset + pageSize - 1),
        supabase
          .from('pool_winners')
          .select('*')
          .eq('pool_id', poolId),
        supabase
          .from('winner_payment_details')
          .select('*')
          .eq('pool_id', poolId)
      ]);

      if (entriesError) throw entriesError;
      if (winnersError) throw winnersError;
      if (paymentError) throw paymentError;

      setEntries(entriesData || []);
      setWinners(winnersData || []);
      setPaymentDetails(paymentDetailsData || []);
      setTotalEntries(count || 0);
      setCurrentPage(page);

    } catch (error) {
      console.error('Error loading pool entries:', error);
      toast({
        title: "Error",
        description: "Failed to load pool entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [poolId, pageSize, includeDeleted, toast]);

  // Optimized update functions with optimistic updates
  const updatePaymentStatus = useCallback(async (entryId: string, confirmed: boolean) => {
    // Optimistic update
    setEntries(prev => prev.map(entry => 
      entry.id === entryId ? { ...entry, payment_confirmed: confirmed } : entry
    ));

    try {
      const { error } = await supabase
        .from('pool_entries')
        .update({ payment_confirmed: confirmed })
        .eq('id', entryId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Payment status ${confirmed ? 'confirmed' : 'marked as pending'}`,
      });
    } catch (error) {
      // Revert optimistic update on error
      setEntries(prev => prev.map(entry => 
        entry.id === entryId ? { ...entry, payment_confirmed: !confirmed } : entry
      ));
      
      console.error('Error updating payment status:', error);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    }
  }, [toast]);

  const deleteEntry = useCallback(async (entryId: string) => {
    // Optimistic update
    const entryToDelete = entries.find(e => e.id === entryId);
    setEntries(prev => prev.filter(entry => entry.id !== entryId));

    try {
      const { error } = await supabase
        .from('pool_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Pool entry deleted successfully",
      });
    } catch (error) {
      // Revert optimistic update on error
      if (entryToDelete) {
        setEntries(prev => [...prev, entryToDelete].sort((a, b) => b.total_points - a.total_points));
      }
      
      console.error('Error deleting entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete pool entry",
        variant: "destructive",
      });
    }
  }, [entries, toast]);

  const undeleteEntry = useCallback(async (entryId: string) => {
    // Optimistic update
    setEntries(prev => prev.map(entry => 
      entry.id === entryId ? { ...entry, deleted_at: null, deleted_by_user: false } : entry
    ));

    try {
      const { error } = await supabase
        .from('pool_entries')
        .update({ 
          deleted_at: null, 
          deleted_by_user: false 
        })
        .eq('id', entryId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Team entry restored successfully",
      });
    } catch (error) {
      // Revert optimistic update on error
      setEntries(prev => prev.map(entry => 
        entry.id === entryId ? { ...entry, deleted_at: new Date().toISOString(), deleted_by_user: true } : entry
      ));
      
      console.error('Error restoring entry:', error);
      toast({
        title: "Error",
        description: "Failed to restore team entry",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    if (poolId) {
      loadData(1);
    }
  }, [poolId, loadData]);

  return {
    entries: enhancedEntries,
    loading,
    currentPage,
    totalEntries,
    pageSize,
    totalPages: Math.ceil(totalEntries / pageSize),
    loadData,
    updatePaymentStatus,
    deleteEntry,
    undeleteEntry,
    goToPage: (page: number) => loadData(page),
    hasNextPage: currentPage * pageSize < totalEntries,
    hasPrevPage: currentPage > 1
  };
};