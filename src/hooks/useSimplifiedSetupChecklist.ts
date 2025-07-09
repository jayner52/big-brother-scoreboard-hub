import { useState, useEffect } from 'react';
import { usePool } from '@/contexts/PoolContext';
import { useToast } from '@/hooks/use-toast';

interface ChecklistStep {
  key: string;
  title: string;
  description: string;
  actionText: string;
  navigation: {
    tab?: string;
    modal?: string;
    section?: string;
  };
  subTasks?: {
    key: string;
    title: string;
    description: string;
    navigation: {
      tab?: string;
      section?: string;
    };
  }[];
}

export const useSimplifiedSetupChecklist = () => {
  const { activePool } = usePool();
  const { toast } = useToast();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Default checklist structure - simplified to 3 main steps
  const defaultChecklist = {
    poolSettings: false,
    bonusQuestions: false,
    inviteFriends: false
  };

  const checklistSteps: ChecklistStep[] = [
    {
      key: 'poolSettings',
      title: 'Customize Pool Settings',
      description: 'Configure your pool with houseguests, payment, and scoring rules',
      actionText: 'Open Settings',
      navigation: { tab: 'settings' },
      subTasks: [
        {
          key: 'contestants',
          title: 'Add Houseguests',
          description: 'Add all Big Brother contestants',
          navigation: { tab: 'contestants' }
        },
        {
          key: 'payment',
          title: 'Set Payment Info',
          description: 'Configure buy-in and payment methods',
          navigation: { tab: 'settings', section: 'basic-settings' }
        },
        {
          key: 'draft',
          title: 'Set Draft Timing',
          description: 'Configure when drafting closes',
          navigation: { tab: 'settings', section: 'draft-timing' }
        },
        {
          key: 'scoring',
          title: 'Configure Scoring',
          description: 'Set point values for competitions',
          navigation: { tab: 'settings', section: 'custom-scoring' }
        },
        {
          key: 'prizes',
          title: 'Set Prize Distribution',
          description: 'Configure how winnings are split',
          navigation: { tab: 'settings', section: 'prize-pool' }
        }
      ]
    },
    {
      key: 'bonusQuestions',
      title: 'Add Bonus Questions',
      description: 'Create prediction questions for extra points (Optional)',
      actionText: 'Add Questions',
      navigation: { tab: 'bonus' }
    },
    {
      key: 'inviteFriends',
      title: 'Invite Friends',
      description: 'Share your pool link with participants',
      actionText: 'Copy Link',
      navigation: { modal: 'invite-copy' }
    }
  ];

  // Load checklist state from localStorage
  useEffect(() => {
    if (activePool?.id) {
      const savedState = localStorage.getItem(`simplified_checklist_${activePool.id}`);
      if (savedState) {
        try {
          setCheckedItems(JSON.parse(savedState));
        } catch {
          setCheckedItems(defaultChecklist);
        }
      } else {
        setCheckedItems(defaultChecklist);
      }
    }
  }, [activePool?.id]);

  // Save checklist state to localStorage
  const saveChecklistState = (newState: Record<string, boolean>) => {
    if (activePool?.id) {
      localStorage.setItem(`simplified_checklist_${activePool.id}`, JSON.stringify(newState));
    }
  };

  // Toggle checklist item
  const toggleItem = (key: string) => {
    const newState = {
      ...checkedItems,
      [key]: !checkedItems[key]
    };
    setCheckedItems(newState);
    saveChecklistState(newState);
  };

  // Navigate to admin section
  const handleNavigation = (navigation: ChecklistStep['navigation']) => {
    if (navigation.tab) {
      // First scroll to admin panel
      const adminPanel = document.querySelector('[data-admin-panel]');
      if (adminPanel) {
        adminPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      // Switch to specific admin tab
      setTimeout(() => {
        const tabTrigger = document.querySelector(`[data-value="${navigation.tab}"]`) as HTMLElement;
        if (tabTrigger) {
          tabTrigger.click();
          
          // If section specified, manage accordions
          if (navigation.section) {
            setTimeout(() => {
              // Send event to PoolSettingsPanel to control accordions
              const event = new CustomEvent('navigateToAccordion', {
                detail: { section: navigation.section }
              });
              document.dispatchEvent(event);
              
              // Scroll to the specific section
              setTimeout(() => {
                const targetAccordion = document.querySelector(`[data-accordion-section="${navigation.section}"]`) as HTMLElement;
                if (targetAccordion) {
                  targetAccordion.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 600);
            }, 400);
          }
        }
      }, 500);
    } else if (navigation.modal === 'invite-copy') {
      // Handle invite copy action
      if (activePool?.invite_code) {
        const inviteLink = `${window.location.origin}/invite/${activePool.invite_code}`;
        navigator.clipboard.writeText(inviteLink);
        toast({
          title: "Invite Link Copied!",
          description: "Share this link with participants to join your pool.",
        });
        
        // Auto-check this item when copied
        toggleItem('inviteFriends');
      }
    }
  };

  // Calculate progress
  const completedSteps = Object.values(checkedItems).filter(Boolean).length;
  const totalSteps = Object.keys(defaultChecklist).length;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

  return {
    checklistSteps,
    checkedItems,
    toggleItem,
    handleNavigation,
    completedSteps,
    totalSteps,
    completionPercentage,
    isComplete: completedSteps === totalSteps
  };
};