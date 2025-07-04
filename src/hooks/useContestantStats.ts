import { useState, useEffect } from 'react';
import { ContestantStats } from '@/types/contestant-stats';
import { useActiveContestants } from './useActiveContestants';
import { useContestantData } from './useContestantData';
import { calculateContestantStats } from '@/utils/contestantStatsCalculator';
import { createBlockSurvivalBonuses } from '@/utils/blockSurvivalUtils';

export const useContestantStats = () => {
  const [contestantStats, setContestantStats] = useState<ContestantStats[]>([]);
  const { evictedContestants } = useActiveContestants();
  const { 
    contestants, 
    contestantGroups, 
    poolEntries, 
    weeklyEvents, 
    specialEvents, 
    loading,
    refetchData
  } = useContestantData();

  useEffect(() => {
    if (!loading && contestants.length > 0) {
      processContestantStats();
    }
  }, [loading, contestants, weeklyEvents, specialEvents, evictedContestants]);

  const processContestantStats = async () => {
    try {
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
        5 // Current game week
      );
      
      setContestantStats(stats);
    } catch (error) {
      console.error('Error processing contestant stats:', error);
    }
  };

  return {
    contestants,
    contestantGroups,
    contestantStats,
    loading
  };
};