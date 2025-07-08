import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Circle, 
  Settings, 
  Users, 
  Trophy, 
  Calendar,
  HelpCircle,
  Rocket,
  Copy,
  ExternalLink,
  ArrowRight,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { usePool } from '@/contexts/PoolContext';
import { useToast } from '@/hooks/use-toast';
import { useSetupChecklistTracking } from '@/hooks/useSetupChecklistTracking';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: React.ComponentType<{ className?: string }>;
  items: SetupSubItem[];
  disabled?: boolean;
}

interface SetupSubItem {
  id: string;
  title: string;
  completed: boolean;
  action?: () => void;
  actionLabel?: string;
  warning?: string;
}

export const EnhancedSetupChecklist: React.FC = () => {
  const { activePool } = usePool();
  const { toast } = useToast();
  const [expandedStep, setExpandedStep] = useState<string>('step1');
  const { steps: originalSteps, loading, refreshStatus } = useSetupChecklistTracking();

  if (!activePool) return null;

  // Transform the original steps into the new 5-step structure
  const setupSteps: SetupStep[] = [
    {
      id: 'step1',
      title: 'Basic Setup',
      description: 'Essential pool configuration',
      completed: activePool.name !== '' && activePool.entry_fee_amount > 0,
      icon: Settings,
      items: [
        {
          id: 'pool_created',
          title: 'Pool Created',
          completed: true
        },
        {
          id: 'pool_name',
          title: 'Pool Name & Description',
          completed: activePool.name !== ''
        },
        {
          id: 'entry_fee',
          title: 'Entry Fee Amount',
          completed: activePool.has_buy_in ? activePool.entry_fee_amount > 0 : true
        }
      ]
    },
    {
      id: 'step2',
      title: 'Game Configuration',
      description: 'Set up contestants, scoring, and prizes',
      completed: false, // Will be calculated from items
      icon: Users,
      items: [
        {
          id: 'contestants',
          title: 'Add Contestants (minimum 16)',
          completed: originalSteps.find(s => s.id.includes('contestants'))?.completed || false,
          action: () => navigateToSettingsSection('#contestants'),
          actionLabel: 'Add Contestants'
        },
        {
          id: 'scoring',
          title: 'Configure Scoring Rules',
          completed: originalSteps.find(s => s.id.includes('scoring'))?.completed || false,
          action: () => navigateToSettingsSection('#scoring'),
          actionLabel: 'Configure'
        },
        {
          id: 'prizes',
          title: 'Set Prize Distribution',
          completed: activePool.has_buy_in ? originalSteps.find(s => s.id.includes('prize'))?.completed || false : true,
          action: () => navigateToSettingsSection('#prizes'),
          actionLabel: 'Set Prizes'
        }
      ]
    },
    {
      id: 'step3',
      title: 'Draft Setup',
      description: 'Configure how teams are built',
      completed: false,
      icon: Calendar,
      items: [
        {
          id: 'draft_settings',
          title: 'Set Draft Date/Time',
          completed: !activePool.draft_locked,
          warning: activePool.draft_locked ? 'Draft is currently locked' : undefined
        },
        {
          id: 'team_size',
          title: 'Configure Team Size',
          completed: activePool.picks_per_team >= 5
        },
        {
          id: 'draft_rules',
          title: 'Set Draft Order & Rules',
          completed: true // Assuming defaults are acceptable
        }
      ]
    },
    {
      id: 'step4',
      title: 'Weekly Content',
      description: 'Set up bonus questions and special events',
      completed: false,
      icon: HelpCircle,
      items: [
        {
          id: 'bonus_questions',
          title: 'Create Bonus Questions',
          completed: originalSteps.find(s => s.id.includes('bonus'))?.completed || false,
          action: () => navigateToSettingsSection('#bonus'),
          actionLabel: 'Add Questions'
        },
        {
          id: 'special_events',
          title: 'Configure Special Events',
          completed: (activePool.enabled_special_events?.length || 0) > 0,
          action: () => navigateToSettingsSection('#events'),  
          actionLabel: 'Configure'
        }
      ]
    },
    {
      id: 'step5',
      title: 'Launch',
      description: 'Review and share your pool',
      completed: false,
      icon: Rocket,
      items: [
        {
          id: 'review',
          title: 'Review All Settings',
          completed: originalSteps.filter(s => s.completed).length >= originalSteps.length * 0.8,
          action: refreshStatus,
          actionLabel: 'Review'
        },
        {
          id: 'invite',
          title: 'Get Invite Link',
          completed: true,
          action: () => copyInviteCode(),
          actionLabel: 'Copy Code'
        }
      ]
    }
  ];

  // Calculate completion for each step
  setupSteps.forEach(step => {
    const completedItems = step.items.filter(item => item.completed).length;
    step.completed = completedItems === step.items.length;
    step.disabled = step.id !== 'step1' && !setupSteps[parseInt(step.id.slice(-1)) - 2]?.completed;
  });

  const totalCompleted = setupSteps.filter(s => s.completed).length;
  const progressPercent = (totalCompleted / setupSteps.length) * 100;

  const navigateToSettingsSection = (hash: string) => {
    // First check if we're on the admin page
    const currentPath = window.location.pathname;
    if (currentPath !== '/admin') {
      // Navigate to admin page first, then set hash
      window.location.href = '/admin' + hash;
    } else {
      // We're already on admin page, just scroll to section
      window.location.hash = hash;
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const copyInviteCode = () => {
    if (activePool?.invite_code) {
      navigator.clipboard.writeText(activePool.invite_code);
      toast({
        title: "Invite Code Copied!",
        description: `Share code: ${activePool.invite_code}`,
      });
    }
  };

  const handleStepClick = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? '' : stepId);
  };

  const getStepColor = (step: SetupStep) => {
    if (step.completed) return 'text-green-600 bg-green-50 border-green-200';
    if (step.disabled) return 'text-gray-400 bg-gray-50 border-gray-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const getStepIcon = (step: SetupStep) => {
    if (step.completed) return <CheckCircle className="h-6 w-6" />;
    if (step.disabled) return <Circle className="h-6 w-6" />;
    return <step.icon className="h-6 w-6" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading setup checklist...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-brand-teal to-coral text-white">
        <CardTitle className="font-gaming text-2xl">
          🏊‍♂️ Poolside Picks Setup
        </CardTitle>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="font-rounded">
              {totalCompleted}/{setupSteps.length} Steps Complete
            </Badge>
            <span className="text-sm font-clean">{Math.round(progressPercent)}% Ready</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {setupSteps.map((step, index) => (
          <div key={step.id} className="space-y-2">
            {/* Step Header */}
            <div 
              className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${getStepColor(step)}`}
              onClick={() => !step.disabled && handleStepClick(step.id)}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {getStepIcon(step)}
                  </div>
                  <div>
                    <h3 className="font-rounded font-semibold text-lg">
                      Step {index + 1}: {step.title}
                    </h3>
                    <p className="font-clean text-sm opacity-80">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {step.completed && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    Complete
                  </Badge>
                )}
                {!step.disabled && (
                  expandedStep === step.id ? 
                    <ChevronDown className="h-5 w-5" /> : 
                    <ChevronRight className="h-5 w-5" />
                )}
              </div>
            </div>

            {/* Step Content */}
            {expandedStep === step.id && (
              <div className="ml-10 space-y-3 animate-slide-up">
                {step.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      {item.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-400" />
                      )}
                      <div>
                        <p className="font-clean font-medium text-sm">{item.title}</p>
                        {item.warning && (
                          <p className="font-clean text-xs text-amber-600">{item.warning}</p>
                        )}
                      </div>
                    </div>
                    {item.action && !item.completed && (
                      <Button
                        onClick={item.action}
                        size="sm"
                        variant="outline"
                        className="font-rounded text-xs"
                      >
                        {item.actionLabel}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Completion Status */}
        {totalCompleted === setupSteps.length && (
          <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <Rocket className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="font-gaming text-xl text-green-800 mb-2">
                  🎉 Pool Ready for Launch!
                </h3>
                <p className="font-clean text-green-700 mb-4">
                  Your Poolside Picks pool is fully configured and ready for participants.
                </p>
                <div className="flex justify-center gap-3">
                  <Button 
                    onClick={copyInviteCode}
                    className="font-rounded bg-green-600 hover:bg-green-700"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Invite Code
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.open('/#/dashboard', '_blank')}
                    className="font-rounded"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Pool
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};