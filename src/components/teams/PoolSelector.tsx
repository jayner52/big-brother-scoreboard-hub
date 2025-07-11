import React from 'react';
import { Pool } from '@/types/pool';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PoolSelectorProps {
  pools: Pool[];
  selectedPoolId: string;
  onPoolSelect: (poolId: string) => void;
  teamCounts: Record<string, number>;
}

export const PoolSelector: React.FC<PoolSelectorProps> = ({
  pools,
  selectedPoolId,
  onPoolSelect,
  teamCounts
}) => {
  if (pools.length <= 1) {
    return null;
  }

  return (
    <div className="w-full mb-6">
      <Tabs value={selectedPoolId} onValueChange={onPoolSelect} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 h-auto p-1">
          {pools.map((pool) => (
            <TabsTrigger
              key={pool.id}
              value={pool.id}
              className="flex items-center gap-2 p-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <span className="truncate">{pool.name}</span>
              <Badge variant="secondary" className="text-xs">
                {teamCounts[pool.id] || 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};