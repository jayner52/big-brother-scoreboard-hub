
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Contestant, PoolEntry, ScoringRules, WeeklyResults } from '@/types/pool';

interface PoolContextType {
  contestants: Contestant[];
  poolEntries: PoolEntry[];
  scoringRules: ScoringRules;
  weeklyResults: WeeklyResults[];
  addPoolEntry: (entry: Omit<PoolEntry, 'id' | 'scores' | 'timestamp'>) => void;
  updateContestants: (contestants: Contestant[]) => void;
  addWeeklyResults: (results: WeeklyResults) => void;
  calculateScores: () => void;
  resetPool: () => void;
}

const PoolContext = createContext<PoolContextType | undefined>(undefined);

const defaultContestants: Contestant[] = [
  { id: '1', name: 'Angela', isActive: true },
  { id: '2', name: 'Brooklyn', isActive: true },
  { id: '3', name: 'Cam', isActive: true },
  { id: '4', name: 'Chelsie', isActive: true },
  { id: '5', name: 'Joseph', isActive: true },
  { id: '6', name: 'Kimo', isActive: true },
  { id: '7', name: 'Lisa', isActive: true },
  { id: '8', name: 'Makensy', isActive: true },
  { id: '9', name: 'Quinn', isActive: true },
  { id: '10', name: 'Rubina', isActive: true },
  { id: '11', name: 'T\'Kor', isActive: true },
  { id: '12', name: 'Tucker', isActive: true },
];

const defaultScoringRules: ScoringRules = {
  hoh: 10,
  pov: 5,
  evicted: 20,
  bonus: 5,
};

export const PoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contestants, setContestants] = useState<Contestant[]>(defaultContestants);
  const [poolEntries, setPoolEntries] = useState<PoolEntry[]>([]);
  const [scoringRules] = useState<ScoringRules>(defaultScoringRules);
  const [weeklyResults, setWeeklyResults] = useState<WeeklyResults[]>([]);

  const addPoolEntry = useCallback((entry: Omit<PoolEntry, 'id' | 'scores' | 'timestamp'>) => {
    const newEntry: PoolEntry = {
      ...entry,
      id: Date.now().toString(),
      scores: {
        hohPoints: 0,
        povPoints: 0,
        evictedPoints: 0,
        bonusPoints: 0,
        total: 0,
      },
      timestamp: new Date(),
    };
    setPoolEntries(prev => [...prev, newEntry]);
  }, []);

  const updateContestants = useCallback((newContestants: Contestant[]) => {
    setContestants(newContestants);
  }, []);

  const addWeeklyResults = useCallback((results: WeeklyResults) => {
    setWeeklyResults(prev => [...prev, results]);
  }, []);

  const calculateScores = useCallback(() => {
    setPoolEntries(prev => prev.map(entry => {
      let hohPoints = 0;
      let povPoints = 0;
      let evictedPoints = 0;
      let bonusPoints = 0;

      // Calculate points based on weekly results
      weeklyResults.forEach(week => {
        if (week.hohWinner === entry.picks.week1HOH) {
          hohPoints += scoringRules.hoh;
        }
        if (week.povWinner === entry.picks.week1POV) {
          povPoints += scoringRules.pov;
        }
        if (week.evicted === entry.picks.firstEvicted || week.evicted === entry.picks.week2Evicted) {
          evictedPoints += scoringRules.evicted;
        }
        if (week.bonusWinners?.some(winner => Object.values(entry.picks).includes(winner))) {
          bonusPoints += scoringRules.bonus;
        }
      });

      const total = hohPoints + povPoints + evictedPoints + bonusPoints;

      return {
        ...entry,
        scores: {
          hohPoints,
          povPoints,
          evictedPoints,
          bonusPoints,
          total,
        },
      };
    }));
  }, [weeklyResults, scoringRules]);

  const resetPool = useCallback(() => {
    setPoolEntries([]);
    setWeeklyResults([]);
  }, []);

  return (
    <PoolContext.Provider value={{
      contestants,
      poolEntries,
      scoringRules,
      weeklyResults,
      addPoolEntry,
      updateContestants,
      addWeeklyResults,
      calculateScores,
      resetPool,
    }}>
      {children}
    </PoolContext.Provider>
  );
};

export const usePool = () => {
  const context = useContext(PoolContext);
  if (context === undefined) {
    throw new Error('usePool must be used within a PoolProvider');
  }
  return context;
};
