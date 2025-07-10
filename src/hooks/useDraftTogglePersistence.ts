import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePool } from '@/contexts/PoolContext';
import { useToast } from '@/hooks/use-toast';

interface DraftSettings {
  draft_open: boolean;
  draft_locked: boolean;
  allow_new_participants: boolean;
  hide_picks_until_draft_closed: boolean;
  registration_deadline?: string;
}

export const useDraftTogglePersistence = () => {
  const { activePool, setActivePool } = usePool();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [settings, setSettings] = useState<DraftSettings>({
    draft_open: false,
    draft_locked: false,
    allow_new_participants: true,
    hide_picks_until_draft_closed: false,
  });

  // Load current settings
  useEffect(() => {
    if (activePool) {
      setSettings({
        draft_open: activePool.draft_open || false,
        draft_locked: activePool.draft_locked || false,
        allow_new_participants: activePool.allow_new_participants !== false,
        hide_picks_until_draft_closed: activePool.hide_picks_until_draft_closed || false,
        registration_deadline: activePool.registration_deadline || undefined
      });
    }
  }, [activePool]);

  const updateSetting = async (key: keyof DraftSettings, value: any) => {
    if (!activePool?.id) {
      toast({
        title: "Error",
        description: "No active pool found",
        variant: "destructive",
      });
      return false;
    }

    setIsUpdating(true);
    
    try {
      const { data, error } = await supabase
        .from('pools')
        .update({ [key]: value })
        .eq('id', activePool.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      
      // Update pool context
      if (setActivePool && data) {
        setActivePool(data);
      }

      // Show success message
      const settingNames = {
        draft_open: 'Draft Access',
        draft_locked: 'Draft Lock',
        allow_new_participants: 'New Participants',
        hide_picks_until_draft_closed: 'Pick Visibility',
        registration_deadline: 'Registration Deadline'
      };

      toast({
        title: "Setting Updated",
        description: `${settingNames[key]} has been ${
          typeof value === 'boolean' 
            ? (value ? 'enabled' : 'disabled')
            : 'updated'
        }`,
      });

      return true;
    } catch (error) {
      console.error('Error updating draft setting:', error);
      toast({
        title: "Error",
        description: `Failed to update ${key.replace(/_/g, ' ')}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDraftToggle = async (draftOpen: boolean) => {
    // If closing the draft, apply cascade settings
    if (!draftOpen) {
      return await handleDraftCloseWithCascade();
    }
    return await updateSetting('draft_open', draftOpen);
  };

  const handleDraftCloseWithCascade = async () => {
    if (!activePool?.id) {
      toast({
        title: "Error",
        description: "No active pool found",
        variant: "destructive",
      });
      return false;
    }

    // Show confirmation for cascade effects
    const confirmed = window.confirm(
      'Closing the draft will automatically:\n\n' +
      '• Disable new participants from joining\n' +
      '• Lock all existing teams (prevent edits)\n' +
      '• Make everyone\'s picks visible\n\n' +
      'Continue?'
    );
    
    if (!confirmed) return false;

    setIsUpdating(true);
    
    try {
      const cascadeSettings = {
        draft_open: false,
        allow_new_participants: false,
        draft_locked: true,
        hide_picks_until_draft_closed: false
      };

      const { data, error } = await supabase
        .from('pools')
        .update(cascadeSettings)
        .eq('id', activePool.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setSettings(prev => ({ ...prev, ...cascadeSettings }));
      
      // Update pool context
      if (setActivePool && data) {
        setActivePool(data);
      }

      toast({
        title: "Draft Closed",
        description: "Draft closed successfully. New participants disabled, teams locked, and picks are now visible.",
      });

      return true;
    } catch (error) {
      console.error('Error closing draft with cascade:', error);
      toast({
        title: "Error",
        description: "Failed to close draft",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDraftLockToggle = async (draftLocked: boolean) => {
    if (draftLocked) {
      // Show confirmation for locking
      const confirmed = window.confirm(
        'Are you sure you want to lock all teams? This action cannot be undone and will prevent all participants from editing their teams.'
      );
      if (!confirmed) return false;
    }
    
    return await updateSetting('draft_locked', draftLocked);
  };

  const handleVisibilityToggle = async (hidePicksUntilDraftClosed: boolean) => {
    return await updateSetting('hide_picks_until_draft_closed', hidePicksUntilDraftClosed);
  };

  const handleAllowNewParticipantsToggle = async (allowNewParticipants: boolean) => {
    return await updateSetting('allow_new_participants', allowNewParticipants);
  };

  const handleRegistrationDeadline = async (deadline: string | null) => {
    return await updateSetting('registration_deadline', deadline);
  };

  // Get current status with real-time sync
  const getCurrentStatus = () => {
    return {
      isDraftOpen: activePool?.draft_open || false,
      isDraftLocked: activePool?.draft_locked || false,
      allowNewParticipants: activePool?.allow_new_participants !== false,
      arePicksHidden: activePool?.hide_picks_until_draft_closed || false,
      registrationDeadline: activePool?.registration_deadline || null,
      isSeasonLocked: activePool?.season_locked || false
    };
  };

  return {
    settings,
    isUpdating,
    handleDraftToggle,
    handleDraftCloseWithCascade,
    handleDraftLockToggle,
    handleAllowNewParticipantsToggle,
    handleVisibilityToggle,
    handleRegistrationDeadline,
    getCurrentStatus
  };
};