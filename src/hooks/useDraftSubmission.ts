import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DraftFormData } from './useDraftForm';
import { usePool } from '@/contexts/PoolContext';

export const useDraftSubmission = () => {
  const { toast } = useToast();
  const { activePool } = usePool();

  const validateForm = (formData: DraftFormData): string | null => {
    if (!formData.participant_name.trim() || !formData.team_name.trim()) {
      return "Please enter your name and team name";
    }

    const requiredPlayers = ['player_1', 'player_2', 'player_3', 'player_4', 'player_5'];
    const missingPlayers = requiredPlayers.filter(player => !formData[player as keyof DraftFormData]);
    
    if (missingPlayers.length > 0) {
      return "Please select all 5 team members";
    }

    if (!activePool) {
      return "Please select a pool to join first";
    }

    return null;
  };

  const submitDraft = async (formData: DraftFormData): Promise<boolean> => {
    const validationError = validateForm(formData);
    if (validationError) {
      toast({
        title: "Error",
        description: validationError,
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit a team",
          variant: "destructive",
        });
        return false;
      }

      if (!activePool) {
        toast({
          title: "Error", 
          description: "No active pool selected",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('pool_entries')
        .insert({
          user_id: user.id,
          pool_id: activePool.id,
          participant_name: formData.participant_name,
          team_name: formData.team_name,
          email: formData.email,
          player_1: formData.player_1,
          player_2: formData.player_2,
          player_3: formData.player_3,
          player_4: formData.player_4,
          player_5: formData.player_5,
          bonus_answers: formData.bonus_answers,
          payment_confirmed: formData.payment_confirmed,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Your team has been submitted to ${activePool.name}`,
      });

      return true;

    } catch (error) {
      console.error('Error submitting team:', error);
      toast({
        title: "Error",
        description: "Failed to submit your team",
        variant: "destructive",
      });
      return false;
    }
  };

  return { submitDraft };
};