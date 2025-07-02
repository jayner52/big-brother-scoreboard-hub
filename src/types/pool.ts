
export interface Contestant {
  id: string;
  name: string;
  isActive: boolean;
}

export interface PoolEntry {
  id: string;
  participantName: string;
  picks: {
    winner: string;
    firstEvicted: string;
    week1HOH: string;
    week1POV: string;
    week2Evicted: string;
  };
  scores: {
    hohPoints: number;
    povPoints: number;
    evictedPoints: number;
    bonusPoints: number;
    total: number;
  };
  timestamp: Date;
}

export interface ScoringRules {
  hoh: number;
  pov: number;
  evicted: number;
  bonus: number;
}

export interface WeeklyResults {
  week: number;
  hohWinner?: string;
  povWinner?: string;
  evicted?: string;
  bonusWinners?: string[];
}
