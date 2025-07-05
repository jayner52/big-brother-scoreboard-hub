import React from 'react';
import { usePool } from '@/contexts/PoolContext';

export const HeroSection: React.FC = () => {
  const { activePool } = usePool();
  const picksPerTeam = activePool?.picks_per_team || 5;
  
  return (
    <div className="text-center">
      <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent leading-tight py-2">
        Big Brother Fantasy Pool
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto mt-2">
        Draft your team of {picksPerTeam} houseguests and earn points based on their performance!
      </p>
    </div>
  );
};