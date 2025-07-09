import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Zap, Loader2 } from 'lucide-react';
import { populateSeason27GlobalDefaults } from '@/data/season27Houseguests';
import { supabase } from '@/integrations/supabase/client';

interface ForceBB27PopulationButtonProps {
  onRefresh: () => void;
}

export const ForceBB27PopulationButton: React.FC<ForceBB27PopulationButtonProps> = ({ onRefresh }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const forcePopulation = async () => {
    try {
      setLoading(true);
      
      console.log('🚀 FORCE BB27: Starting forced population...');
      
      // First, clear any existing BB27 global defaults to start fresh
      try {
        const { error: deleteError } = await supabase
          .from('contestants')
          .delete()
          .is('pool_id', null)
          .eq('season_number', 27);
        
        if (deleteError) {
          console.warn('🚀 FORCE BB27: Could not clear existing defaults:', deleteError);
        } else {
          console.log('🚀 FORCE BB27: Cleared existing BB27 global defaults');
        }
      } catch (clearError) {
        console.warn('🚀 FORCE BB27: Error clearing existing defaults:', clearError);
      }
      
      // Also clear default groups to ensure fresh start
      try {
        const { error: groupDeleteError } = await supabase
          .from('contestant_groups')
          .delete()
          .is('pool_id', null);
        
        if (groupDeleteError) {
          console.warn('🚀 FORCE BB27: Could not clear existing groups:', groupDeleteError);
        } else {
          console.log('🚀 FORCE BB27: Cleared existing default groups');
        }
      } catch (clearError) {
        console.warn('🚀 FORCE BB27: Error clearing existing groups:', clearError);
      }
      
      // Force population with fresh start
      const result = await populateSeason27GlobalDefaults();
      
      if (result.success) {
        toast({
          title: "Success!",
          description: `Forced population completed! Added ${result.count} Season 27 contestants.`,
        });
        console.log('🚀 FORCE BB27: Population successful with', result.count, 'contestants');
        onRefresh();
      } else {
        throw new Error(result.error || 'Force population failed');
      }
      
    } catch (error) {
      console.error('🚀 FORCE BB27: Error during forced population:', error);
      toast({
        title: "Force Population Failed",
        description: error.message || "Could not force populate Season 27 cast. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={forcePopulation}
      disabled={loading}
      variant="destructive"
      className="bg-red-600 hover:bg-red-700 text-white"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Force Populating...
        </>
      ) : (
        <>
          <Zap className="h-4 w-4 mr-2" />
          Force Populate BB27 Cast
        </>
      )}
    </Button>
  );
};