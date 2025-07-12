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

  const submitDraft = async (formData: DynamicDraftFormData, picksPerTeam: number = 5, editingTeamId?: string | null): Promise<boolean> => {
    console.log('🚀 DRAFT SUBMISSION START:', { 
      picksPerTeam, 
      formData: { 
        participant_name: formData.participant_name,
        team_name: formData.team_name,
        playerCount: Object.keys(formData).filter(k => k.startsWith('player_')).length
      },
      activePool: activePool?.id
    });

    // CRITICAL: Check if draft is locked before allowing submission
    if (!activePool) {
      console.error('🚀 No active pool - submission blocked');
      toast({
        title: "Error",
        description: "No active pool selected",
        variant: "destructive",
      });
      return false;
    }

    // Check draft lock conditions
    const lockReasons = [];
    
    if (activePool.draft_open === false) {
      lockReasons.push("Draft has been closed by administrator");
    }
    
    if (activePool.allow_new_participants === false) {
      lockReasons.push("New participants are not currently allowed");
    }
    
    if (activePool.registration_deadline) {
      const deadline = new Date(activePool.registration_deadline);
      if (new Date() > deadline) {
        lockReasons.push("Registration deadline has passed");
      }
    }

    if (lockReasons.length > 0) {
      console.error('🚀 Draft locked - submission blocked:', lockReasons);
      toast({
        title: "Draft Locked",
        description: lockReasons.join('. '),
        variant: "destructive",
      });
      return false;
    }

    const validationError = validateForm(formData, picksPerTeam);
    if (validationError) {
      console.error('🚀 Validation failed:', validationError);
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
        console.error('🚀 No authenticated user');
        toast({
          title: "Error",
          description: "You must be logged in to submit a team",
          variant: "destructive",
        });
        return false;
      }

      console.log('🚀 User authenticated:', user.id);

      // ENHANCED: Dynamic player data handling with proper team size management
      const playerData: any = {};
      
      // Handle all player fields up to max supported (12)
      for (let i = 1; i <= 12; i++) {
        const playerKey = `player_${i}`;
        if (i <= picksPerTeam) {
          // Active player slots - use form data or null
          playerData[playerKey] = formData[playerKey]?.trim() || null;
        } else {
          // Inactive slots - explicitly set to null to clear old data
          playerData[playerKey] = null;
        }
      }

      console.log('🚀 Player data prepared:', { 
        picksPerTeam, 
        activeFields: Object.keys(playerData).filter(k => playerData[k] !== null).length,
        totalFields: Object.keys(playerData).length
      });

      const submissionData = {
        participant_name: formData.participant_name.trim(),
        team_name: formData.team_name.trim(),
        email: formData.email.trim(),
        ...playerData,
        bonus_answers: formData.bonus_answers || {},
        payment_confirmed: formData.payment_confirmed || false,
      };

      console.log('🚀 Final submission data:', submissionData);

      if (editingTeamId || (isEditMode && editEntryData)) {
        // Update existing entry
        const entryId = editingTeamId || editEntryData?.id;
        console.log('🚀 Updating existing entry:', entryId);
        
        const { error } = await supabase
          .from('pool_entries')
          .update(submissionData)
          .eq('id', entryId);

        if (error) {
          console.error('🚀 Update error:', error);
          throw error;
        }

        console.log('🚀 Entry updated successfully');
        toast({
          title: "Success!",
          description: "Your team has been updated successfully",
        });

        clearEditData();
        return true;
      } else {
        // Create new entry
        if (!activePool) {
          console.error('🚀 No active pool selected');
          toast({
            title: "Error", 
            description: "No active pool selected",
            variant: "destructive",
          });
          return false;
        }

        console.log('🚀 Creating new entry for pool:', activePool.id);

        const { error } = await supabase
          .from('pool_entries')
          .insert({
            user_id: user.id,
            pool_id: activePool.id,
            ...submissionData,
          });

        if (error) {
          console.error('🚀 Insert error:', error);
          throw error;
        }

        console.log('🚀 Entry created successfully');
        toast({
          title: "Success!",
          description: `Your team has been submitted to ${activePool.name}`,
        });

        return true;
      }

    } catch (error) {
      console.error('🚀 SUBMISSION ERROR:', error);
      
      // Enhanced error handling with specific messages
      let errorMessage = "Failed to submit your team";
      if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as any).message;
        if (message.includes('duplicate key')) {
          errorMessage = "You already have a team in this pool";
        } else if (message.includes('foreign key')) {
          errorMessage = "Invalid pool or houseguest selection";
        } else if (message.includes('not null')) {
          errorMessage = "Missing required information";
        }
      }
      
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  return { submitDraft };
};