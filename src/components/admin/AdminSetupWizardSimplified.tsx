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
  X,
  CheckSquare,
  Loader2
} from 'lucide-react';
import { usePool } from '@/contexts/PoolContext';
import { useToast } from '@/hooks/use-toast';
import { useSetupChecklistTracking } from '@/hooks/useSetupChecklistTracking';

interface ChecklistItemProps {
  completed: boolean;
  autoCompleted: boolean;
  manuallyCompleted: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  warning?: string;
  action?: () => void;
  actionLabel?: string;
  canToggle?: boolean;
  onToggle?: () => void;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({
  completed,
  autoCompleted,
  manuallyCompleted,
  icon,
  title,
  description,
  warning,
  action,
  actionLabel,
  canToggle,
  onToggle
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
      <div className="flex items-center gap-2 mb-1">
        <h4 className="font-medium text-sm">
          {title}
        </h4>
        {manuallyCompleted && (
          <Badge variant="outline" className="text-xs px-1 py-0">
            Manual
          </Badge>
        )}
        {autoCompleted && !manuallyCompleted && (
          <Badge variant="outline" className="text-xs px-1 py-0 bg-green-100">
            Auto
          </Badge>
        )}
      </div>
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
    <div className="flex items-center gap-2">
      {canToggle && onToggle && (
        <Button
          onClick={onToggle}
          size="sm"
          variant="ghost"
          className="text-xs h-6 w-6 p-0"
          title={completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {completed ? <X className="h-3 w-3" /> : <CheckSquare className="h-3 w-3" />}
        </Button>
      )}
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
  
  // Use enhanced setup checklist tracking
  const { 
    steps, 
    completedCount, 
    totalSteps, 
    loading, 
    refreshStatus, 
    toggleManualCompletion,
    isComplete 
  } = useSetupChecklistTracking();

  // Force show when forceShow prop changes
  useEffect(() => {
    if (forceShow) {
      setIsOpen(true);
      refreshStatus(); // Refresh data when forced to show
    }
  }, [forceShow, refreshStatus]);

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

  if (loading) {
    return (
      <div className="mb-6 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading setup status...</span>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div className="mb-6">
        <Button
          onClick={toggleWizard}
          variant="outline"
          className="flex items-center gap-2"
        >
          <CheckSquare className="h-4 w-4" />
          Show Setup Checklist ({completedCount}/{totalSteps})
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
                {completedCount}/{totalSteps} Complete
              </Badge>
              <div className="w-32 bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${(completedCount / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshStatus}
              disabled={loading}
              className="text-muted-foreground hover:text-foreground"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '↻'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleWizard}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {steps.map((step) => (
            <ChecklistItem 
              key={step.id} 
              completed={step.completed}
              autoCompleted={step.autoCompleted}
              manuallyCompleted={step.manuallyCompleted}
              icon={step.completed ? 
                <CheckCircle className="h-5 w-5 text-green-600" /> : 
                <UserCheck className="h-5 w-5 text-blue-600" />
              }
              title={step.title}
              description={step.description}
              warning={step.warning}
              action={step.action}
              actionLabel={step.actionLabel}
              canToggle={step.canToggle}
              onToggle={() => toggleManualCompletion(step.id, step.completed)}
            />
          ))}
        </div>

        {isComplete && (
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