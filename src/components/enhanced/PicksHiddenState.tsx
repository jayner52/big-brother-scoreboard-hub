import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { EyeOff, Clock } from 'lucide-react';

interface PicksHiddenStateProps {
  poolName?: string;
}

export const PicksHiddenState: React.FC<PicksHiddenStateProps> = ({ poolName }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardContent className="p-12 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <EyeOff className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              Team Picks Are Hidden
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Team selections are currently hidden to maintain draft suspense. 
              Check back after the draft period ends to see everyone's picks!
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Picks will be revealed when drafting closes</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};