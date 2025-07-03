import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, Circle } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  completedSteps,
  className = "",
}) => {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-purple-700">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-purple-600">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="w-full bg-purple-100 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-start">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center flex-1 relative">
              {/* Step Circle */}
              <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                isCompleted 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500 text-white' 
                  : isCurrent 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 border-purple-500 text-white' 
                    : 'bg-muted border-border text-muted-foreground'
              }`}>
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>

              {/* Step Content */}
              <div className="mt-3 text-center max-w-24">
                <p className={`text-sm font-medium mb-1 ${
                  isCurrent ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {step.description}
                </p>
                {isCompleted && (
                  <Badge variant="secondary" className="mt-1 bg-green-100 text-green-700 text-xs">
                    Complete
                  </Badge>
                )}
              </div>

              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className={`absolute top-5 left-1/2 w-full h-0.5 -translate-y-1/2 -z-10 ${
                  completedSteps.includes(index) ? 'bg-green-500' : 'bg-muted'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};