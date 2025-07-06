import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePool } from '@/contexts/PoolContext';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  count?: number;
  action?: () => void;
  actionLabel?: string;
  warning?: string;
}

export const useSetupChecklistTracking = () => {
  const { activePool } = usePool();
  const [steps, setSteps] = useState<SetupStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);

  const checkSetupStatus = async () => {
    if (!activePool?.id) {
      setLoading(false);
      return;
    }

    try {
      // Check contestants count
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

      const scrollToAdminSection = (section?: string) => {
        const adminPanel = document.querySelector('[data-admin-panel]');
        if (adminPanel) {
          adminPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
          
          if (section) {
            setTimeout(() => {
              const trigger = document.querySelector(`[data-value="${section}"]`);
              if (trigger && !trigger.getAttribute('data-state')?.includes('open')) {
                (trigger as HTMLElement).click();
              }
            }, 500);
          }
        }
      };

      // Define steps with dynamic completion status
      const updatedSteps: SetupStep[] = [
        {
          id: 'pool-created',
          title: 'Pool Created',
          description: `Your pool "${activePool.name}" is ready to configure.`,
          completed: true,
        },
        {
          id: 'contestants-added',
          title: 'Add Contestants',
          description: `${contestantCount} contestant${contestantCount !== 1 ? 's' : ''} added`,
          completed: contestantCount >= 16,
          count: contestantCount,
          warning: contestantCount < 16 ? 'Need at least 16 contestants for full season' : undefined,
          action: () => scrollToAdminSection('contestants'),
          actionLabel: 'Add Contestants →'
        },
        {
          id: 'photos-populated',
          title: 'Contestant Photos',
          description: `${photosCount}/${contestantCount} contestants have photos`,
          completed: photosCount === contestantCount && contestantCount > 0,
          count: photosCount,
          warning: photosCount < contestantCount ? 'Some contestants missing photos' : undefined,
          action: contestantCount > 0 && photosCount < contestantCount ? 
            () => scrollToAdminSection('contestants') : undefined,
          actionLabel: 'Add Photos →'
        },
        {
          id: 'draft-config',
          title: 'Configure Draft Settings',
          description: 'Set the number of contestant groups and picks per team.',
          completed: activePool.draft_configuration_locked || false,
          warning: !activePool.draft_configuration_locked ? 
            'This cannot be changed after the first person drafts!' : undefined,
          action: () => scrollToAdminSection('pool-settings'),
          actionLabel: 'Configure →'
        },
        {
          id: 'payment-setup',
          title: 'Payment Information',
          description: activePool.has_buy_in ? 
            'Configure how participants will pay the entry fee.' : 
            'No buy-in required for this pool.',
          completed: !activePool.has_buy_in || !!activePool.payment_method_1,
          action: activePool.has_buy_in && !activePool.payment_method_1 ? 
            () => scrollToAdminSection('pool-settings') : undefined,
          actionLabel: 'Set up →'
        },
        {
          id: 'bonus-questions',
          title: 'Review Bonus Questions',
          description: `${bonusCount} bonus questions configured`,
          completed: bonusCount >= 5,
          count: bonusCount,
          warning: bonusCount < 5 ? 'Consider adding more bonus questions' : undefined,
          action: () => scrollToAdminSection('bonus'),
          actionLabel: 'Review →'
        },
        {
          id: 'special-events',
          title: 'Configure Special Events',
          description: 'Choose which special events can be tracked during weekly scoring.',
          completed: false, // Will be implemented when special events are properly configured
          count: 0,
          action: () => scrollToAdminSection('pool-settings'),
          actionLabel: 'Configure →'
        },
        {
          id: 'invite-participants',
          title: 'Ready to Invite!',
          description: `Share your invite code: ${activePool.invite_code}`,
          completed: entriesCount > 0,
          count: entriesCount,
          action: () => {
            if (activePool?.invite_code) {
              navigator.clipboard.writeText(activePool.invite_code);
            }
          },
          actionLabel: entriesCount > 0 ? 'Copy Code' : 'Share Code'
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
    isComplete: completedCount === steps.length
  };
};