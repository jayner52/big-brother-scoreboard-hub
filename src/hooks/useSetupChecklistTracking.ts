import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePool } from '@/contexts/PoolContext';
import { useToast } from '@/hooks/use-toast';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  autoCompleted: boolean;
  manuallyCompleted: boolean;
  count?: number;
  action?: () => void;
  actionLabel?: string;
  warning?: string;
  canToggle?: boolean;
}

interface ChecklistOverride {
  task_id: string;
  manually_completed: boolean;
  completed_at: string;
}

export const useSetupChecklistTracking = () => {
  const { activePool } = usePool();
  const { toast } = useToast();
  const [steps, setSteps] = useState<SetupStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);
  const [overrides, setOverrides] = useState<ChecklistOverride[]>([]);

  // Enhanced navigation that handles tabs and accordions
  const navigateToSection = (tabValue: string, accordionSection?: string) => {
    const adminPanel = document.querySelector('[data-admin-panel]');
    if (adminPanel) {
      adminPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // First navigate to the correct tab
      setTimeout(() => {
        const tabTrigger = document.querySelector(`[data-value="${tabValue}"]`);
        if (tabTrigger && !tabTrigger.getAttribute('data-state')?.includes('active')) {
          (tabTrigger as HTMLElement).click();
        }
        
        // Then open accordion if specified
        if (accordionSection) {
          setTimeout(() => {
            const accordionTrigger = document.querySelector(`[data-accordion-section="${accordionSection}"]`);
            if (accordionTrigger && !accordionTrigger.getAttribute('data-state')?.includes('open')) {
              (accordionTrigger as HTMLElement).click();
            }
          }, 300);
        }
      }, 500);
    }
  };

  // Load manual completion overrides
  const loadOverrides = async () => {
    if (!activePool?.id) return;
    
    const { data, error } = await supabase
      .from('pool_checklist_overrides')
      .select('task_id, manually_completed, completed_at')
      .eq('pool_id', activePool.id);
    
    if (!error && data) {
      setOverrides(data);
    }
  };

  // Toggle manual completion
  const toggleManualCompletion = useCallback(async (taskId: string, currentlyCompleted: boolean) => {
    if (!activePool?.id) return;

    try {
      const newStatus = !currentlyCompleted;
      
      const { error } = await supabase
        .from('pool_checklist_overrides')
        .upsert({
          pool_id: activePool.id,
          task_id: taskId,
          manually_completed: newStatus,
          completed_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;

      await loadOverrides();
      await checkSetupStatus();
      
      toast({
        title: newStatus ? "Task marked complete" : "Task marked incomplete",
        description: `You manually ${newStatus ? 'completed' : 'reset'} this task.`,
      });
    } catch (error) {
      console.error('Error toggling task completion:', error);
      toast({
        title: "Error",
        description: "Failed to update task completion status.",
        variant: "destructive",
      });
    }
  }, [activePool?.id, toast]);

  const checkSetupStatus = async () => {
    if (!activePool?.id) {
      setLoading(false);
      return;
    }

    try {
      await loadOverrides();

      // Check contestants count (for review step)
      const { data: contestants } = await supabase
        .from('contestants')
        .select('id', { count: 'exact' })
        .eq('pool_id', activePool.id);

      const contestantCount = contestants?.length || 0;

      // Check contestants with photos
      const { data: contestantsWithPhotos } = await supabase
        .from('contestants')
        .select('id', { count: 'exact' })
        .eq('pool_id', activePool.id)
        .not('photo_url', 'is', null);

      const photosCount = contestantsWithPhotos?.length || 0;

      // Check bonus questions
      const { data: bonusQuestions } = await supabase
        .from('bonus_questions')
        .select('id', { count: 'exact' })
        .eq('pool_id', activePool.id)
        .eq('is_active', true);

      const bonusCount = bonusQuestions?.length || 0;

      // Check pool entries
      const { data: poolEntries } = await supabase
        .from('pool_entries')
        .select('id', { count: 'exact' })
        .eq('pool_id', activePool.id);

      const entriesCount = poolEntries?.length || 0;

      // Helper to get completion status from overrides
      const getCompletionStatus = (taskId: string, autoCompleted: boolean) => {
        const override = overrides.find(o => o.task_id === taskId);
        const manuallyCompleted = override?.manually_completed || false;
        return {
          completed: manuallyCompleted || autoCompleted,
          autoCompleted,
          manuallyCompleted,
        };
      };

      // Define updated steps with new flow
      const updatedSteps: SetupStep[] = [
        {
          id: 'pool-created',
          title: 'Pool Created',
          description: `Your pool "${activePool.name}" is ready to configure.`,
          ...getCompletionStatus('pool-created', true),
          canToggle: false,
        },
        {
          id: 'review-contestants',
          title: 'Review Preloaded Contestants',
          description: `${contestantCount} contestant${contestantCount !== 1 ? 's' : ''} available, ${photosCount} have photos`,
          ...getCompletionStatus('review-contestants', contestantCount >= 16),
          count: contestantCount,
          warning: contestantCount < 16 ? 'Need at least 16 contestants for full season' : undefined,
          action: () => navigateToSection('contestants'),
          actionLabel: 'Review →',
          canToggle: true,
        },
        {
          id: 'draft-config',
          title: 'Configure Draft Settings',
          description: 'Set team size, groups, and draft rules.',
          ...getCompletionStatus('draft-config', activePool.draft_configuration_locked || false),
          warning: !activePool.draft_configuration_locked ? 
            'This cannot be changed after the first person drafts!' : undefined,
          action: () => navigateToSection('settings'),
          actionLabel: 'Configure →',
          canToggle: true,
        },
        {
          id: 'payment-setup',
          title: 'Payment Information',
          description: activePool.has_buy_in ? 
            'Configure how participants will pay the entry fee.' : 
            'No buy-in required for this pool.',
          ...getCompletionStatus('payment-setup', !activePool.has_buy_in || !!activePool.payment_method_1),
          action: activePool.has_buy_in && !activePool.payment_method_1 ? 
            () => navigateToSection('settings') : undefined,
          actionLabel: 'Set up →',
          canToggle: true,
        },
        {
          id: 'bonus-questions',
          title: 'Review Bonus Questions',
          description: `${bonusCount} bonus questions configured`,
          ...getCompletionStatus('bonus-questions', bonusCount >= 5),
          count: bonusCount,
          warning: bonusCount < 5 ? 'Consider adding more bonus questions' : undefined,
          action: () => navigateToSection('bonus'),
          actionLabel: 'Review →',
          canToggle: true,
        },
        {
          id: 'special-events',
          title: 'Configure Special Events',
          description: 'Choose which special events can be tracked.',
          ...getCompletionStatus('special-events', (activePool.enabled_special_events?.length || 0) > 0),
          count: activePool.enabled_special_events?.length || 0,
          action: () => navigateToSection('settings'),
          actionLabel: 'Configure →',
          canToggle: true,
        },
        {
          id: 'pool-timeline',
          title: 'Set Pool Timeline',
          description: 'Configure registration deadline and draft timing.',
          ...getCompletionStatus('pool-timeline', !!activePool.registration_deadline),
          action: () => navigateToSection('settings'),
          actionLabel: 'Set Timeline →',
          canToggle: true,
        },
        {
          id: 'ready-to-invite',
          title: 'Ready to Invite Participants',
          description: `Share your invite code: ${activePool.invite_code}`,
          ...getCompletionStatus('ready-to-invite', entriesCount > 0),
          count: entriesCount,
          action: () => {
            const inviteLink = `${window.location.origin}/invite/${activePool?.invite_code}`;
            navigator.clipboard.writeText(inviteLink).then(() => {
              toast({
                title: "Invite link copied!",
                description: "Share this link with your participants.",
              });
            }).catch(() => {
              // Fallback to copying just the code
              if (activePool?.invite_code) {
                navigator.clipboard.writeText(activePool.invite_code);
                toast({
                  title: "Invite code copied!",
                  description: `Share code: ${activePool.invite_code}`,
                });
              }
            });
          },
          actionLabel: 'Copy Link',
          canToggle: true,
        }
      ];

      setSteps(updatedSteps);
      setCompletedCount(updatedSteps.filter(s => s.completed).length);

    } catch (error) {
      console.error('Error checking setup status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSetupStatus();
  }, [activePool?.id]);

  // Refresh setup status
  const refreshStatus = () => {
    setLoading(true);
    checkSetupStatus();
  };

  return {
    steps,
    completedCount,
    totalSteps: steps.length,
    loading,
    refreshStatus,
    toggleManualCompletion,
    isComplete: completedCount === steps.length
  };
};