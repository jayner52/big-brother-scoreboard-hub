import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useWeekAdvancement = () => {
  const { toast } = useToast();

  const advanceWeek = async (completedWeek: number, poolId: string) => {
    try {
      // Get all completed weeks to calculate the proper next week
      const { data: allWeeklyResults } = await supabase
        .from('weekly_results')
        .select('week_number, is_draft')
        .eq('is_draft', false)
        .eq('pool_id', poolId)
        .order('week_number', { ascending: true });
      
      const completedWeeks = allWeeklyResults?.map(w => w.week_number) || [];
      const nextWeek = Math.max(...completedWeeks, completedWeek) + 1;
      
      console.log(`Advancing from Week ${completedWeek} to Week ${nextWeek}`);
      
      // Try to update current game week with retry
      let retryCount = 0;
      const maxRetries = 3;
      let weekUpdateError = null;
      
      while (retryCount < maxRetries) {
        const { error } = await supabase.rpc('update_current_game_week', { 
          new_week_number: nextWeek 
        });
        
        if (!error) {
          weekUpdateError = null;
          break;
        }
        
        weekUpdateError = error;
        retryCount++;
        console.warn(`Week advancement attempt ${retryCount} failed:`, error);
        
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
      
      if (weekUpdateError) {
        console.error('Failed to update current game week after retries:', weekUpdateError);
        toast({
          title: "Week Advancement Failed",
          description: `Week ${completedWeek} submitted successfully, but failed to advance to Week ${nextWeek}. Please refresh and check current week.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Week Completed!",
          description: `Week ${completedWeek} completed! Advanced to Week ${nextWeek}`,
        });
        console.log(`✅ Successfully advanced: Week ${completedWeek} → Week ${nextWeek}`);
      }
      
    } catch (error) {
      console.error('Unexpected error during week advancement:', error);
      toast({
        title: "Week Advancement Error",
        description: `Week ${completedWeek} submitted but week advancement failed. Please refresh the page.`,
        variant: "destructive",
      });
    }
  };

  return { advanceWeek };
};