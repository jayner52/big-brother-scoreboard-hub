import { useState, useEffect } from 'react';
import { ContestantStats } from '@/types/contestant-stats';
import { useActiveContestants } from './useActiveContestants';
import { useContestantData } from './useContestantData';
import { calculateContestantStats } from '@/utils/contestantStatsCalculator';
import { createBlockSurvivalBonuses } from '@/utils/blockSurvivalUtils';
import { usePool } from '@/contexts/PoolContext';

export const useContestantStats = () => {
  const [contestantStats, setContestantStats] = useState<ContestantStats[]>([]);
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
    console.log('🔍 ContestantStats Effect - Loading:', loading, 'Contestants:', contestants.length, 'Pool:', activePool?.id);
    if (!loading && contestants.length > 0 && activePool?.id) {
      processContestantStats();
    }
  }, [loading, contestants, weeklyEvents, specialEvents, activePool?.id]); // REMOVED: evictedContestants dependency

  const processContestantStats = async () => {
    if (!activePool?.id) {
      console.error('❌ ContestantStats - No active pool ID');
      return;
    }
    
    try {
      console.log('🔄 ContestantStats - Processing stats for pool:', activePool.id);
      
      // Create special events for block survival bonuses BEFORE calculating stats
      console.log('🔄 Creating block survival bonuses...');
      await createBlockSurvivalBonuses(contestants, weeklyEvents);
      
      // Refetch data to include any newly created special events
      console.log('🔄 Refetching data after creating bonuses...');
      await refetchData();
      
      // Calculate contestant stats using proper UUID matching
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
    }
  };

  return {
    contestants,
    contestantGroups,
    contestantStats,
    loading
  };
};