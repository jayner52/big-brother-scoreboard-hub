import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DraftFormData } from './useDraftForm';
import { usePool } from '@/contexts/PoolContext';
import { useDraftEdit } from './useDraftEdit';

export const useDraftSubmission = () => {
  const { toast } = useToast();
  const { activePool } = usePool();
  const { isEditMode, editEntryData, clearEditData } = useDraftEdit();

  const validateForm = (formData: DraftFormData): string | null => {
    if (!formData.participant_name.trim() || !formData.team_name.trim()) {
      return "Please enter your name and team name";
    }

    if (!activePool) {
      return "Please select a pool to join first";
    }

    const picksPerTeam = activePool.picks_per_team || 5;
    const missingPlayers = [];
    
    for (let i = 1; i <= picksPerTeam; i++) {
      const playerKey = `player_${i}` as keyof DraftFormData;
      if (!formData[playerKey]) {
        missingPlayers.push(`player_${i}`);
      }
    }
    
    if (missingPlayers.length > 0) {
      return `Please select all ${picksPerTeam} team members`;
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

      if (isEditMode && editEntryData) {
        // Update existing entry with dynamic player data
        const picksPerTeam = activePool.picks_per_team || 5;
        const playerData: any = {};
        
        // Fill all required player slots
        for (let i = 1; i <= picksPerTeam; i++) {
          const playerKey = `player_${i}` as keyof DraftFormData;
          playerData[playerKey] = formData[playerKey] || '';
        }

        const { error } = await supabase
          .from('pool_entries')
          .update({
            participant_name: formData.participant_name,
            team_name: formData.team_name,
            email: formData.email,
            ...playerData,
            bonus_answers: formData.bonus_answers,
            payment_confirmed: formData.payment_confirmed,
          })
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

        // Create dynamic player data based on pool settings
        const picksPerTeam = activePool.picks_per_team || 5;
        const playerData: any = {};
        
        // Fill all required player slots
        for (let i = 1; i <= picksPerTeam; i++) {
          const playerKey = `player_${i}` as keyof DraftFormData;
          playerData[playerKey] = formData[playerKey] || '';
        }

        const { error } = await supabase
          .from('pool_entries')
          .insert({
            user_id: user.id,
            pool_id: activePool.id,
            participant_name: formData.participant_name,
            team_name: formData.team_name,
            email: formData.email,
            ...playerData,
            bonus_answers: formData.bonus_answers,
            payment_confirmed: formData.payment_confirmed,
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