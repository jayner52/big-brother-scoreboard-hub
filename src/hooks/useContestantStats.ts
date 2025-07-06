import { useState, useEffect } from 'react';
import { ContestantStats } from '@/types/contestant-stats';
import { useActiveContestants } from './useActiveContestants';
import { useContestantData } from './useContestantData';
import { calculateContestantStats } from '@/utils/contestantStatsCalculator';
import { createBlockSurvivalBonuses } from '@/utils/blockSurvivalUtils';
import { usePool } from '@/contexts/PoolContext';

export const useContestantStats = () => {
  const [contestantStats, setContestantStats] = useState<ContestantStats[]>([]);
  const { evictedContestants } = useActiveContestants();
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
  }, [loading, contestants, weeklyEvents, specialEvents, evictedContestants, activePool?.id]);

  const processContestantStats = async () => {
    if (!activePool?.id) {
      console.error('❌ ContestantStats - No active pool ID');
      return;
    }
    
    try {
      console.log('🔄 ContestantStats - Processing stats for pool:', activePool.id);
      
      // Create special events for block survival bonuses
      await createBlockSurvivalBonuses(contestants, weeklyEvents);
      
      // Refetch data to include any newly created special events
      await refetchData();
      
      // Calculate contestant statistics with current game week
      const stats = calculateContestantStats(
        contestants,
        contestantGroups,
        poolEntries,
        weeklyEvents,
        specialEvents,
        evictedContestants,
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