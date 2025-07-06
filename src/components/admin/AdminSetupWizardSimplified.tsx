import React, { useState } from 'react';
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
  X,
  CheckSquare
} from 'lucide-react';
import { usePool } from '@/contexts/PoolContext';
import { useToast } from '@/hooks/use-toast';

interface ChecklistItemProps {
  completed: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  warning?: string;
  action?: () => void;
  actionLabel?: string;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({
  completed,
  icon,
  title,
  description,
  warning,
  action,
  actionLabel
}) => (
  <div className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
    completed 
      ? 'bg-green-50 border-green-200' 
      : 'bg-blue-50 border-blue-200'
  }`}>
    <div className="flex-shrink-0 mt-0.5">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-medium text-sm">
        {title}
      </h4>
      <p className="text-xs text-muted-foreground mt-1">
        {description}
      </p>
      {warning && (
        <div className="flex items-center gap-1 mt-2">
          <AlertCircle className="h-3 w-3 text-amber-600" />
          <p className="text-xs text-amber-700">
            {warning}
          </p>
        </div>
      )}
    </div>
    {action && !completed && (
      <Button
        onClick={action}
        size="sm"
        variant="outline"
        className="text-xs"
      >
        {actionLabel}
      </Button>
    )}
  </div>
);

interface AdminSetupWizardSimplifiedProps {
  forceShow?: boolean;
}

export const AdminSetupWizardSimplified: React.FC<AdminSetupWizardSimplifiedProps> = ({ 
  forceShow = false 
}) => {
  const { activePool } = usePool();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(forceShow);

  if (!activePool) return null;

  const toggleWizard = () => {
    setIsOpen(prev => !prev);
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

  // Setup steps configuration
  const steps = [
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
      icon: activePool.draft_configuration_locked ? 
        <CheckCircle className="h-5 w-5 text-green-600" /> : 
        <UserCheck className="h-5 w-5 text-blue-600" />,
      completed: activePool.draft_configuration_locked || false,
      warning: !activePool.draft_configuration_locked ? 'This cannot be changed after the first person drafts!' : undefined,
      action: () => scrollToAdminSection('pool-settings'),
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
        () => scrollToAdminSection('pool-settings') : undefined,
      actionLabel: 'Set up →'
    },
    {
      id: 'bonus-questions',
      title: 'Review Bonus Questions',
      description: 'Customize prediction questions and point values.',
      icon: <UserCheck className="h-5 w-5 text-blue-600" />,
      completed: false,
      action: () => scrollToAdminSection('bonus'),
      actionLabel: 'Review →'
    },
    {
      id: 'special-events',
      title: 'Configure Special Events',
      description: 'Choose which special events can be tracked during weekly scoring.',
      icon: <UserCheck className="h-5 w-5 text-blue-600" />,
      completed: false,
      action: () => scrollToAdminSection('pool-settings'),
      actionLabel: 'Configure →'
    },
    {
      id: 'invite-participants',
      title: 'Ready to Invite!',
      description: `Share your invite code: ${activePool.invite_code}`,
      icon: <Share2 className="h-5 w-5 text-green-600" />,
      completed: true,
      action: copyInviteCode,
      actionLabel: 'Copy Code'
    }
  ];

  const completedSteps = steps.filter(s => s.completed).length;
  const totalSteps = steps.length;

  if (!isOpen) {
    return (
      <div className="mb-6">
        <Button
          onClick={toggleWizard}
          variant="outline"
          className="flex items-center gap-2"
        >
          <CheckSquare className="h-4 w-4" />
          Show Setup Checklist
        </Button>
      </div>
    );
  }

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
            onClick={toggleWizard}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {steps.map((step) => (
            <ChecklistItem key={step.id} {...step} />
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