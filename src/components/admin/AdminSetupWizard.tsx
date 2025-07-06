import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  Users, 
  UserCheck, 
  DollarSign, 
  Share2,
  X
} from 'lucide-react';
import { usePool } from '@/contexts/PoolContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  warning?: string;
  action?: () => void;
  actionLabel?: string;
}

interface AdminSetupWizardProps {
  forceShow?: boolean;
}

export const AdminSetupWizard: React.FC<AdminSetupWizardProps> = ({ forceShow = false }) => {
  const { activePool } = usePool();
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(forceShow);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAnyEntries, setHasAnyEntries] = useState(false);
  const [unansweredQuestions, setUnansweredQuestions] = useState(0);
  const [steps, setSteps] = useState<SetupStep[]>([]);

  // Consolidated useEffect for proper loading and visibility management
  useEffect(() => {
    const initializeWizard = async () => {
      if (!activePool?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Check if any entries exist
        const { count: entriesCount } = await supabase
          .from('pool_entries')
          .select('id', { count: 'exact' })
          .eq('pool_id', activePool.id);

        setHasAnyEntries((entriesCount || 0) > 0);

        // Check unanswered bonus questions
        const { count: questionCount } = await supabase
          .from('bonus_questions')
          .select('id', { count: 'exact' })
          .eq('pool_id', activePool.id)
          .eq('is_active', true);

        setUnansweredQuestions(questionCount || 0);

        // Build setup steps
        const setupSteps: SetupStep[] = [
          {
            id: 'pool-created',
            title: 'Pool Created',
            description: `Welcome! Your pool "${activePool.name}" is ready to configure.`,
            icon: <CheckCircle className="h-5 w-5 text-green-600" />,
            completed: true,
          },
          {
            id: 'draft-config',
            title: 'Configure Draft Settings',
            description: 'Set the number of contestant groups and picks per team.',
            icon: (entriesCount || 0) > 0 ? 
              <CheckCircle className="h-5 w-5 text-green-600" /> : 
              <UserCheck className="h-5 w-5 text-blue-600" />,
            completed: activePool.draft_configuration_locked || false,
            warning: (entriesCount || 0) > 0 ? undefined : 'This cannot be changed after the first person drafts!',
            action: () => {
              const adminPanel = document.querySelector('[data-admin-panel]');
              if (adminPanel) {
                adminPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                setTimeout(() => {
                  const trigger = document.querySelector('[data-value="draft-configuration"]');
                  if (trigger && !trigger.getAttribute('data-state')?.includes('open')) {
                    (trigger as HTMLElement).click();
                  }
                }, 500);
              }
            },
            actionLabel: 'Configure →'
          },
          {
            id: 'payment-setup',
            title: 'Payment Information',
            description: activePool.has_buy_in ? 
              'Configure how participants will pay the entry fee.' : 
              'No buy-in required for this pool.',
            icon: activePool.has_buy_in ? 
              (activePool.payment_method_1 ? 
                <CheckCircle className="h-5 w-5 text-green-600" /> : 
                <DollarSign className="h-5 w-5 text-blue-600" />
              ) : 
              <CheckCircle className="h-5 w-5 text-green-600" />,
            completed: !activePool.has_buy_in || !!activePool.payment_method_1,
            action: activePool.has_buy_in && !activePool.payment_method_1 ? 
              () => {
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('tab', 'settings');
                window.history.pushState({}, '', currentUrl.toString());
                
                const adminPanel = document.querySelector('[data-admin-panel]');
                if (adminPanel) {
                  adminPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  setTimeout(() => window.location.reload(), 100);
                }
              } : undefined,
            actionLabel: 'Set up →'
          },
          {
            id: 'bonus-questions',
            title: 'Review Bonus Questions',
            description: `${questionCount || 0} prediction questions available for customization.`,
            icon: <UserCheck className="h-5 w-5 text-blue-600" />,
            completed: false,
            action: () => {
              const adminPanel = document.querySelector('[data-admin-panel]');
              if (adminPanel) {
                adminPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                setTimeout(() => {
                  const bonusTab = document.querySelector('[data-value="bonus"]');
                  if (bonusTab) {
                    (bonusTab as HTMLElement).click();
                  }
                }, 500);
              }
            },
            actionLabel: 'Review →'
          },
          {
            id: 'invite-participants',
            title: 'Ready to Invite!',
            description: `Share your invite code: ${activePool.invite_code}`,
            icon: <Share2 className="h-5 w-5 text-green-600" />,
            completed: !activePool.has_buy_in || !!activePool.payment_method_1,
            action: () => copyInviteCode(),
            actionLabel: 'Copy Code'
          }
        ];

        setSteps(setupSteps);

        // Determine visibility after steps are built
        if (forceShow) {
          setIsVisible(true);
        } else {
          const dismissed = localStorage.getItem(`wizard-dismissed-${activePool.id}`);
          setIsVisible(!dismissed);
        }
        
      } catch (error) {
        console.error('Error initializing wizard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeWizard();
  }, [activePool?.id, forceShow]);

  // Handle force show changes
  useEffect(() => {
    if (forceShow && steps.length > 0) {
      setIsVisible(true);
    }
  }, [forceShow, steps.length]);

  const navigateToSection = (section: string) => {
    // Add a small delay to ensure smooth transition
    setTimeout(() => {
      const adminPanel = document.querySelector('[data-admin-panel]');
      if (adminPanel) {
        adminPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Flash the target section to indicate navigation
        adminPanel.classList.add('ring-2', 'ring-primary', 'ring-opacity-50');
        setTimeout(() => {
          adminPanel.classList.remove('ring-2', 'ring-primary', 'ring-opacity-50');
        }, 2000);
      }
    }, 100);
  };

  const copyInviteCode = () => {
    if (activePool?.invite_code) {
      navigator.clipboard.writeText(activePool.invite_code);
      toast({
        title: "Invite Code Copied!",
        description: "Share this code with participants to join your pool.",
      });
    }
  };

  const dismissWizard = () => {
    setIsVisible(false);
    if (!forceShow) {
      localStorage.setItem(`wizard-dismissed-${activePool?.id}`, 'true');
    }
  };

  // Handle visibility logic with proper force-show support and prevent flash
  // This effect now just handles component cleanup
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (!forceShow && activePool?.id) {
        const dismissed = localStorage.getItem(`wizard-dismissed-${activePool.id}`);
        if (!dismissed && !isVisible) {
          localStorage.setItem(`wizard-dismissed-${activePool.id}`, 'true');
        }
      }
    };
  }, [isVisible, forceShow, activePool?.id]);

  if (isLoading || !isVisible || !activePool) return null;

  const completedSteps = steps.filter(s => s.completed).length;
  const totalSteps = steps.length;

  return (
    <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-primary mb-2">
              Pool Setup Checklist
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">
                {completedSteps}/{totalSteps} Complete
              </Badge>
              <div className="w-32 bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissWizard}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                step.completed 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">
                  {step.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </p>
                {step.warning && (
                  <div className="flex items-center gap-1 mt-2">
                    <AlertCircle className="h-3 w-3 text-amber-600" />
                    <p className="text-xs text-amber-700">
                      {step.warning}
                    </p>
                  </div>
                )}
              </div>
              {step.action && !step.completed && (
                <Button
                  onClick={step.action}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  {step.actionLabel}
                </Button>
              )}
            </div>
          ))}
        </div>

        {completedSteps === totalSteps && (
          <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm font-medium text-green-800">
                🎉 Setup Complete! Your pool is ready for participants.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};