import { useToast } from '@/hooks/use-toast';
import { recalculateAllTeamPoints } from '@/utils/pointsRecalculation';

export const useAutoPointsRecalculation = () => {
  const { toast } = useToast();

  const triggerRecalculation = async (reason?: string) => {
    try {
      await recalculateAllTeamPoints();
      console.log(`Auto-recalculation completed: ${reason || 'Data changed'}`);
    } catch (error) {
      console.error('Auto-recalculation failed:', error);
      toast({
        title: "Background Update Failed",
        description: "Points calculation error - please refresh the page",
        variant: "destructive",
      });
    }
  };

  return {
    triggerRecalculation
  };
};