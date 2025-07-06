import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Lock } from 'lucide-react';
import { WeeklyEventForm } from '@/types/admin';

interface StepByStepFlowProps {
  eventForm: WeeklyEventForm;
}

export const StepByStepFlow: React.FC<StepByStepFlowProps> = ({ eventForm }) => {
  const steps = [
    {
      id: 'hoh',
      label: 'HOH Winner',
      completed: eventForm.hohWinner && eventForm.hohWinner !== 'no-winner',
      current: !eventForm.hohWinner || eventForm.hohWinner === 'no-winner'
    },
    {
      id: 'nominees',
      label: 'Nominees',
      completed: eventForm.nominees.filter(n => n).length >= 2,
      current: (eventForm.hohWinner && eventForm.hohWinner !== 'no-winner') && 
               eventForm.nominees.filter(n => n).length < 2,
      disabled: !eventForm.hohWinner || eventForm.hohWinner === 'no-winner'
    },
    {
      id: 'pov',
      label: 'POV Winner',
      completed: eventForm.povWinner && eventForm.povWinner !== 'no-winner',
      current: eventForm.nominees.filter(n => n).length >= 2 && 
               (!eventForm.povWinner || eventForm.povWinner === 'no-winner'),
      disabled: eventForm.nominees.filter(n => n).length < 2
    },
    {
      id: 'veto',
      label: 'Veto Used',
      completed: eventForm.povWinner && eventForm.povWinner !== 'no-winner' && 
                (eventForm.povUsed === true || eventForm.povUsed === false),
      current: eventForm.povWinner && eventForm.povWinner !== 'no-winner' && 
               eventForm.povUsed === undefined,
      disabled: !eventForm.povWinner || eventForm.povWinner === 'no-winner'
    },
    {
      id: 'replacement',
      label: 'Replacement',
      completed: !eventForm.povUsed || (eventForm.povUsed && eventForm.replacementNominee),
      current: eventForm.povUsed && !eventForm.replacementNominee,
      disabled: !eventForm.povUsed,
      conditional: true // Only shows when veto is used
    },
    {
      id: 'arena',
      label: 'BB Arena',
      completed: !eventForm.aiArenaEnabled || (eventForm.aiArenaEnabled && eventForm.aiArenaWinner),
      current: eventForm.aiArenaEnabled && !eventForm.aiArenaWinner,
      disabled: eventForm.nominees.filter(n => n).length < 3,
      conditional: true // Only shows when 3+ nominees
    },
    {
      id: 'eviction',
      label: 'Eviction',
      completed: eventForm.evicted && eventForm.evicted !== 'no-eviction',
      current: (!eventForm.povUsed || eventForm.replacementNominee) && 
               (!eventForm.aiArenaEnabled || eventForm.aiArenaWinner) &&
               (!eventForm.evicted || eventForm.evicted === 'no-eviction'),
      disabled: (eventForm.povUsed && !eventForm.replacementNominee) ||
                (eventForm.aiArenaEnabled && !eventForm.aiArenaWinner)
    }
  ];

  // Filter out conditional steps that shouldn't show
  const visibleSteps = steps.filter(step => {
    if (step.id === 'replacement') return eventForm.povUsed;
    if (step.id === 'arena') return eventForm.aiArenaEnabled;
    return true;
  });

  return (
    <div className="mb-6 p-4 bg-muted/30 rounded-lg">
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Eviction Ceremony Progress</h3>
      <div className="flex flex-wrap gap-2">
        {visibleSteps.map((step, index) => {
          let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
          let icon = <Clock className="h-3 w-3" />;
          
          if (step.completed) {
            variant = "default";
            icon = <Check className="h-3 w-3" />;
          } else if (step.current) {
            variant = "secondary";
            icon = <Clock className="h-3 w-3" />;
          } else if (step.disabled) {
            variant = "outline";
            icon = <Lock className="h-3 w-3" />;
          }

          return (
            <Badge key={step.id} variant={variant} className="flex items-center gap-1">
              {icon}
              {step.label}
            </Badge>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Complete each step in order to record the eviction ceremony results
      </p>
    </div>
  );
};