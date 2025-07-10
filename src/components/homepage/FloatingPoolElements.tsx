import React from 'react';
import { PoolFloat } from '@/components/brand/PoolFloat';

export const FloatingPoolElements: React.FC = () => {
  return (
    <>
      <div className="absolute top-20 left-10 opacity-40 animate-bounce">
        <PoolFloat className="w-16 h-16" color="teal" />
      </div>
      <div className="absolute top-40 right-20 opacity-30 animate-bounce" style={{ animationDelay: '1s' }}>
        <PoolFloat className="w-12 h-12" color="yellow" />
      </div>
      <div className="absolute bottom-32 left-20 opacity-50 animate-bounce" style={{ animationDelay: '2s' }}>
        <PoolFloat className="w-20 h-20" color="orange" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-30 animate-bounce" style={{ animationDelay: '0.5s' }}>
        <PoolFloat className="w-14 h-14" color="coral" />
      </div>
    </>
  );
};