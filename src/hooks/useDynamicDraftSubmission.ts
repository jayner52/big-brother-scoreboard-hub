import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DynamicDraftFormData } from './useDynamicDraftForm';
import { usePool } from '@/contexts/PoolContext';
import { useDraftEdit } from './useDraftEdit';

export const useDynamicDraftSubmission = () => {
  const { toast } = useToast();
  const { activePool } = usePool();
  const { isEditMode, editEntryData, clearEditData } = useDraftEdit();

  const validateForm = (formData: DynamicDraftFormData, picksPerTeam: number): string | null => {
    if (!formData.participant_name.trim() || !formData.team_name.trim()) {
      return "Please enter your name and team name";
    }

    // Dynamic validation for required players
    for (let i = 1; i <= picksPerTeam; i++) {
      const playerKey = `player_${i}`;
      if (!formData[playerKey] || !formData[playerKey].trim()) {
        return `Please select all ${picksPerTeam} team members`;
      }
    }

    if (!activePool) {
      return "Please select a pool to join first";
    }

    return null;
  };

  const submitDraft = async (formData: DynamicDraftFormData, picksPerTeam: number = 5): Promise<boolean> => {
    const validationError = validateForm(formData, picksPerTeam);
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

      // Prepare player data - fill in all 5 slots for database compatibility
      const playerData: any = {
        player_1: formData.player_1 || '',
        player_2: formData.player_2 || '',
        player_3: formData.player_3 || '',
        player_4: formData.player_4 || '',
        player_5: formData.player_5 || '',
      };

      // Add additional players if they exist (dynamic picks)
      for (let i = 1; i <= picksPerTeam; i++) {
        const playerKey = `player_${i}`;
        if (formData[playerKey]) {
          playerData[playerKey] = formData[playerKey];
        }
      }

      const submissionData = {
        participant_name: formData.participant_name,
        team_name: formData.team_name,
        email: formData.email,
        ...playerData,
        bonus_answers: formData.bonus_answers,
        payment_confirmed: formData.payment_confirmed,
      };

      if (isEditMode && editEntryData) {
        // Update existing entry
        const { error } = await supabase
          .from('pool_entries')
          .update(submissionData)
          .eq('id', editEntryData.id);

        if (error) throw error;

        toast({
          title: "Success!",
          description: "Your team has been updated successfully",
        });

        clearEditData();
        return true;
      } else {
        // Create new entry
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
            ...submissionData,
          });

        if (error) throw error;

        toast({
          title: "Success!",
          description: `Your team has been submitted to ${activePool.name}`,
        });

        return true;
      }

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