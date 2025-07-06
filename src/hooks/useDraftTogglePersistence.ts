import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePool } from '@/contexts/PoolContext';
import { useToast } from '@/hooks/use-toast';

interface DraftSettings {
  draft_open: boolean;
  draft_locked: boolean;
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
    hide_picks_until_draft_closed: false,
  });

  // Load current settings
  useEffect(() => {
    if (activePool) {
      setSettings({
        draft_open: activePool.draft_open || false,
        draft_locked: activePool.draft_locked || false,
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
    return await updateSetting('draft_open', draftOpen);
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

  const handleRegistrationDeadline = async (deadline: string | null) => {
    return await updateSetting('registration_deadline', deadline);
  };

  // Get current status with real-time sync
  const getCurrentStatus = () => {
    return {
      isDraftOpen: activePool?.draft_open || false,
      isDraftLocked: activePool?.draft_locked || false,
      arePicksHidden: activePool?.hide_picks_until_draft_closed || false,
      registrationDeadline: activePool?.registration_deadline || null,
      isSeasonLocked: activePool?.season_locked || false
    };
  };

  return {
    settings,
    isUpdating,
    handleDraftToggle,
    handleDraftLockToggle,
    handleVisibilityToggle,
    handleRegistrationDeadline,
    getCurrentStatus
  };
};