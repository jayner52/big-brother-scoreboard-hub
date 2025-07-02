
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Contestant, PoolEntry, ScoringRules, WeeklyResults } from '@/types/pool';

interface PoolContextType {
  contestants: Contestant[];
  poolEntries: PoolEntry[];
  scoringRules: ScoringRules;
  weeklyResults: WeeklyResults[];
  addPoolEntry: (entry: Omit<PoolEntry, 'id' | 'created_at' | 'updated_at'>) => void;
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
  survival: 5,
};

export const PoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contestants, setContestants] = useState<Contestant[]>(defaultContestants);
  const [poolEntries, setPoolEntries] = useState<PoolEntry[]>([]);
  const [scoringRules] = useState<ScoringRules>(defaultScoringRules);
  const [weeklyResults, setWeeklyResults] = useState<WeeklyResults[]>([]);

  const addPoolEntry = useCallback((entry: Omit<PoolEntry, 'id' | 'created_at' | 'updated_at'>) => {
    const newEntry: PoolEntry = {
      ...entry,
      id: Date.now().toString(),
      created_at: new Date(),
      updated_at: new Date(),
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
    // This is now handled by the AdminScoringPanel component
    // The actual score calculation happens in the database via Supabase
    console.log('Score calculation triggered - handled by admin panel');
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
