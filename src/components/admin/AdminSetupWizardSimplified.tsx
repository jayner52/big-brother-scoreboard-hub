import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckSquare,
  Loader2,
  Users,
  Settings,
  DollarSign,
  HelpCircle,
  Calendar,
  Share2,
  Target,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { usePool } from '@/contexts/PoolContext';
import { useToast } from '@/hooks/use-toast';
import { useSetupChecklistTracking } from '@/hooks/useSetupChecklistTracking';
import { ChecklistTile } from './checklist/ChecklistTile';

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
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {completedCount} of {totalSteps} tasks complete
              </Badge>
              <div className="flex-1 bg-muted rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(completedCount / totalSteps) * 100}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground font-medium">
                {Math.round((completedCount / totalSteps) * 100)}%
              </span>
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

        <div className="space-y-4">
          {steps.map((step) => {
            const getStepIcon = (stepId: string) => {
              switch (stepId) {
                case 'pool-created':
                  return <CheckCircle className="h-6 w-6 text-green-600" />;
                case 'review-contestants':
                  return <Users className="h-6 w-6 text-blue-600" />;
                case 'draft-config':
                  return <Settings className="h-6 w-6 text-purple-600" />;
                case 'payment-setup':
                  return <DollarSign className="h-6 w-6 text-emerald-600" />;
                case 'bonus-questions':
                  return <HelpCircle className="h-6 w-6 text-orange-600" />;
                case 'special-events':
                  return <Target className="h-6 w-6 text-red-600" />;
                case 'pool-timeline':
                  return <Calendar className="h-6 w-6 text-indigo-600" />;
                case 'invite-participants':
                  return <Share2 className="h-6 w-6 text-pink-600" />;
                default:
                  return <CheckSquare className="h-6 w-6 text-gray-600" />;
              }
            };

            return (
              <ChecklistTile
                key={step.id}
                completed={step.completed}
                manuallyCompleted={step.manuallyCompleted}
                icon={getStepIcon(step.id)}
                title={step.title}
                description={step.description}
                warning={step.warning}
                count={step.count}
                actionLabel={step.actionLabel}
                canToggle={step.canToggle}
                onClick={step.action}
                onToggle={() => toggleManualCompletion(step.id, step.completed)}
              />
            );
          })}
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