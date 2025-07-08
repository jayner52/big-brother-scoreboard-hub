import { useState, useEffect } from 'react';
import { usePool } from '@/contexts/PoolContext';
import { useToast } from '@/hooks/use-toast';

interface ChecklistItem {
  key: string;
  title: string;
  description: string;
  actionText: string;
  navigation: {
    tab?: string;
    modal?: string;
    section?: string;
  };
}

export const usePoolSetupChecklist = () => {
  const { activePool } = usePool();
  const { toast } = useToast();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Default checklist structure - all unchecked except pool creation
  const defaultChecklist = {
    poolCreated: true, // Only this is checked since pool exists
    contestantsAdded: false,
    scoringConfigured: false,
    prizesConfigured: false,
    draftSettingsConfigured: false,
    paymentInfoAdded: false,
    bonusQuestionsCreated: false,
    specialEventsConfigured: false,
    validationCheck: false,
    inviteLinkReady: false
  };

  const checklistItems: ChecklistItem[] = [
    {
      key: 'contestantsAdded',
      title: 'Add Houseguests',
      description: 'Add all 16+ Big Brother contestants',
      actionText: 'Manage Houseguests',
      navigation: { tab: 'contestants' }
    },
    {
      key: 'paymentInfoAdded',
      title: 'Add Basic Settings',
      description: 'Configure payment methods and special events',
      actionText: 'Basic Settings',
      navigation: { tab: 'settings', section: 'basic-settings' }
    },
    {
      key: 'scoringConfigured',
      title: 'Configure Scoring Rules',
      description: 'Set point values for competitions and events',
      actionText: 'Set Points',
      navigation: { tab: 'settings', section: 'custom-scoring' }
    },
    {
      key: 'draftSettingsConfigured',
      title: 'Set Draft Timing',
      description: 'Configure draft deadline and timing',
      actionText: 'Draft Timing',
      navigation: { tab: 'settings', section: 'draft-timing' }
    },
    {
      key: 'prizesConfigured',
      title: 'Set Prize Distribution',
      description: 'Configure how prizes will be distributed',
      actionText: 'Configure Prizes',
      navigation: { tab: 'settings', section: 'prize-pool' }
    },
    {
      key: 'bonusQuestionsCreated',
      title: 'Create Bonus Questions (Optional)',
      description: 'Add prediction questions for extra points',
      actionText: 'Add Questions',
      navigation: { tab: 'bonus' }
    },
    {
      key: 'validationCheck',
      title: 'Review Setup',
      description: 'Final review of all pool configuration',
      actionText: 'Review All',
      navigation: { tab: 'settings' }
    },
    {
      key: 'inviteLinkReady',
      title: 'Copy Invite Link',
      description: 'Get the link to share with participants',
      actionText: 'Copy Link',
      navigation: { modal: 'invite-copy' }
    }
  ];

  // Load checklist state from localStorage
  useEffect(() => {
    if (activePool?.id) {
      const savedState = localStorage.getItem(`checklist_${activePool.id}`);
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
      localStorage.setItem(`checklist_${activePool.id}`, JSON.stringify(newState));
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

  // Navigate to admin section with enhanced accordion management
  const handleNavigation = (navigation: ChecklistItem['navigation']) => {
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
        } else {
          console.warn(`Could not find tab with data-value="${navigation.tab}"`);
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
        toggleItem('inviteLinkReady');
      }
    }
  };

  // Calculate progress
  const completedItems = Object.values(checkedItems).filter(Boolean).length;
  const totalItems = Object.keys(defaultChecklist).length;
  const completionPercentage = Math.round((completedItems / totalItems) * 100);

  return {
    checklistItems,
    checkedItems,
    toggleItem,
    handleNavigation,
    completedItems,
    totalItems,
    completionPercentage,
    isComplete: completedItems === totalItems
  };
};