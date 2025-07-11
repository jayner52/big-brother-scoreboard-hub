import { useState, useEffect } from 'react';
import { ContestantStats } from '@/types/contestant-stats';
import { useActiveContestants } from './useActiveContestants';
import { useContestantData } from './useContestantData';
import { calculateContestantStats } from '@/utils/contestantStatsCalculator';
import { createBlockSurvivalBonuses } from '@/utils/blockSurvivalUtils';
import { usePool } from '@/contexts/PoolContext';

export const useContestantStats = () => {
  const [contestantStats, setContestantStats] = useState<ContestantStats[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  // REMOVED: evictedContestants - will be reimplemented from scratch
  const { activePool } = usePool();
  const { 
    contestants, 
    contestantGroups, 
    poolEntries, 
    weeklyEvents, 
    specialEvents, 
    loading,
    refetchData
  } = useContestantData(activePool?.id);

  useEffect(() => {
    console.log('🔍 ContestantStats Effect - Loading:', loading, 'Contestants:', contestants.length, 'Pool:', activePool?.id, 'Processing:', isProcessing);
    if (!loading && contestants.length > 0 && activePool?.id && !isProcessing) {
      processContestantStats();
    }
  }, [loading, contestants, weeklyEvents, activePool?.id, isProcessing]); // Removed specialEvents to prevent infinite loop

  const processContestantStats = async () => {
    if (!activePool?.id || isProcessing) {
      console.error('❌ ContestantStats - No active pool ID or already processing');
      return;
    }
    
    setIsProcessing(true);
    try {
      console.log('🔄 ContestantStats - Processing stats for pool:', activePool.id);
      
      // Create special events for block survival bonuses BEFORE calculating stats
      // This function now checks for existing events to prevent duplicates
      console.log('🔄 Creating block survival bonuses...');
      await createBlockSurvivalBonuses(contestants, weeklyEvents);
      
      // Calculate contestant stats using current data (including any newly created events)
      const stats = await calculateContestantStats(
        contestants,
        contestantGroups,
        poolEntries,
        weeklyEvents,
        specialEvents,
        [], // Empty array - eviction tracking now handled internally
        7 // Updated to current game week
      );
      
      console.log('✅ ContestantStats - Generated stats for', stats.length, 'contestants');
      setContestantStats(stats);
    } catch (error) {
      console.error('❌ ContestantStats - Error processing stats:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    contestants,
    contestantGroups,
    contestantStats,
    loading: loading || isProcessing
  };
};