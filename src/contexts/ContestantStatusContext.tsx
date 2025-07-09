import React, { createContext, useContext, ReactNode } from 'react';
import { ContestantWithBio } from '@/types/admin';

interface ContestantStatusContextType {
  getStatusStyling: (isActive: boolean) => string;
  getStatusBadge: (isActive: boolean) => { variant: 'default' | 'destructive'; text: string };
  getStatusLabel: (isActive: boolean) => string;
  groupContestantsByStatus: (contestants: ContestantWithBio[]) => {
    active: ContestantWithBio[];
    evicted: ContestantWithBio[];
  };
}

const ContestantStatusContext = createContext<ContestantStatusContextType | undefined>(undefined);

export const useContestantStatus = () => {
  const context = useContext(ContestantStatusContext);
  if (!context) {
    throw new Error('useContestantStatus must be used within a ContestantStatusProvider');
  }
  return context;
};

interface ContestantStatusProviderProps {
  children: ReactNode;
}

export const ContestantStatusProvider: React.FC<ContestantStatusProviderProps> = ({ children }) => {
  const getStatusStyling = (isActive: boolean): string => {
    return isActive ? '' : 'text-red-500 line-through';
  };

  const getStatusBadge = (isActive: boolean): { variant: 'default' | 'destructive'; text: string } => {
    return {
      variant: isActive ? 'default' : 'destructive',
      text: isActive ? 'Active' : 'Evicted'
    };
  };

  const getStatusLabel = (isActive: boolean): string => {
    return isActive ? 'Active' : 'Evicted';
  };

  const groupContestantsByStatus = (contestants: ContestantWithBio[]) => {
    return contestants.reduce(
      (groups, contestant) => {
        if (contestant.isActive) {
          groups.active.push(contestant);
        } else {
          groups.evicted.push(contestant);
        }
        return groups;
      },
      { active: [] as ContestantWithBio[], evicted: [] as ContestantWithBio[] }
    );
  };

  const value: ContestantStatusContextType = {
    getStatusStyling,
    getStatusBadge,
    getStatusLabel,
    groupContestantsByStatus,
  };

  return (
    <ContestantStatusContext.Provider value={value}>
      {children}
    </ContestantStatusContext.Provider>
  );
};