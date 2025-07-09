import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePool } from '@/contexts/PoolContext';
import { supabase } from '@/integrations/supabase/client';
import { Users } from 'lucide-react';
import { populateSeason26Houseguests } from '@/data/season26Houseguests';
import { populateSeason27Houseguests } from '@/data/season27Houseguests';

interface GenerateFullCastButtonProps {
  onRefresh: () => void;
  seasonNumber?: number;
}

export const GenerateFullCastButton: React.FC<GenerateFullCastButtonProps> = ({ 
  onRefresh, 
  seasonNumber = 27 // Default to Season 27 
}) => {
  const { toast } = useToast();
  const { activePool } = usePool();
  const [loading, setLoading] = useState(false);

  const generateFullCast = async () => {
    if (!activePool?.id) return;
    
    try {
      setLoading(true);
      
      let result;
      
      // Route to appropriate season handler
      if (seasonNumber === 26) {
        result = await populateSeason26Houseguests(activePool.id);
      } else if (seasonNumber === 27) {
        result = await populateSeason27Houseguests(activePool.id);
      } else {
        throw new Error(`Season ${seasonNumber} is not supported`);
      }
      
      if (result.success) {
        if (result.count > 0) {
          toast({
            title: "Success!",
            description: `Added ${result.count} Season ${seasonNumber} houseguests!`,
          });
        } else {
          toast({
            title: "All Set!",
            description: `Season ${seasonNumber} houseguests are already loaded`,
          });
        }
        onRefresh();
      } else {
        throw new Error(result.error || 'Failed to populate houseguests');
      }
      
    } catch (error) {
      console.error('Error generating cast:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate houseguests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={generateFullCast}
      disabled={loading}
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      <Users className="h-4 w-4 mr-2" />
      {loading ? 'Populating...' : `Generate Season ${seasonNumber} Cast`}
    </Button>
  );
};