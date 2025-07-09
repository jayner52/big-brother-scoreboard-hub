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
      
      // Update current game week with a single attempt
      const { error } = await supabase.rpc('update_current_game_week', { 
        new_week_number: nextWeek 
      });
      
      if (error) {
        console.error('Failed to update current game week:', error);
        toast({
          title: "Week Advancement Failed",
          description: `Week ${completedWeek} submitted successfully, but failed to advance to Week ${nextWeek}. The week data was saved correctly.`,
          variant: "destructive",
        });
        return false;
      }
      
      console.log(`✅ Successfully advanced: Week ${completedWeek} → Week ${nextWeek}`);
      return true;
      
    } catch (error) {
      console.error('Unexpected error during week advancement:', error);
      toast({
        title: "Week Advancement Error",
        description: `Week ${completedWeek} submitted but week advancement failed. The week data was saved correctly.`,
        variant: "destructive",
      });
      return false;
    }
  };

  return { advanceWeek };
};