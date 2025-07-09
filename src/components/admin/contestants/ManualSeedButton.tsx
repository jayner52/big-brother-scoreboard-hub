import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePool } from '@/contexts/PoolContext';

interface ManualSeedButtonProps {
  onSeedComplete: () => void;
  contestantCount: number;
}

export const ManualSeedButton: React.FC<ManualSeedButtonProps> = ({
  onSeedComplete,
  contestantCount
}) => {
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();
  const { activePool } = usePool();

  const handleManualSeed = async () => {
    if (!activePool?.id) {
      toast({
        title: "Error",
        description: "No active pool found",
        variant: "destructive",
      });
      return;
    }

    setIsSeeding(true);
    try {
      console.log('🔧 Manual seeding started for pool:', activePool.id);
      
      // Try the seeding function
      const { error } = await supabase.rpc('seed_new_pool_defaults', { 
        target_pool_id: activePool.id 
      });
      
      if (error) {
        console.error('🔧 Manual seeding error:', error);
        
        // If it's a duplicate key error, that's actually success
        if (error.message.includes('duplicate key')) {
          toast({
            title: "Success",
            description: "Season 27 contestants are already seeded in this pool!",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Success",
          description: "Season 27 contestants seeded successfully!",
        });
      }
      
      // Refresh the contestants list
      onSeedComplete();
      
    } catch (error) {
      console.error('🔧 Manual seeding failed:', error);
      toast({
        title: "Seeding Failed",
        description: "Could not seed Season 27 contestants. Please try again or add contestants manually.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  // Don't show the button if contestants are already loaded
  if (contestantCount >= 17) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Database className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-blue-800">No Contestants Found</h3>
      </div>
      
      <p className="text-sm text-blue-700">
        It looks like Season 27 contestants haven't been loaded into this pool yet. 
        Click the button below to automatically import all 17 Season 27 contestants.
      </p>
      
      <Button 
        onClick={handleManualSeed}
        disabled={isSeeding}
        className="w-full"
        variant="outline"
      >
        {isSeeding ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Seeding Contestants...
          </>
        ) : (
          <>
            <Database className="mr-2 h-4 w-4" />
            Seed Season 27 Contestants
          </>
        )}
      </Button>
      
      <p className="text-xs text-blue-600">
        This will add Adrian Rocha, Amy Wilson, Ava Chen, and 14 other Season 27 contestants to your pool.
      </p>
    </div>
  );
};