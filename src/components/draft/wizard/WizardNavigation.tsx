import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ChevronLeft, ChevronRight, Check, RotateCcw } from 'lucide-react';

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  isCurrentStepValid: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onClearForm: () => void;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  currentStep,
  totalSteps,
  isCurrentStepValid,
  onPrevious,
  onNext,
  onSubmit,
  onClearForm,
}) => {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex justify-between items-center">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 0}
        className="flex items-center gap-2 px-6 py-3"
        size="lg"
      >
        <ChevronLeft className="h-5 w-5" />
        Previous
      </Button>

      <div className="flex items-center gap-3">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Clear Form
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear Draft Form</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to clear your team and predictions?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onClearForm}
                className="bg-red-600 hover:bg-red-700"
              >
                Clear Form
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {isLastStep && (
          <Badge variant="secondary" className="bg-purple-100 text-purple-700 px-3 py-1">
            Ready to submit!
          </Badge>
        )}
        
        {isLastStep ? (
          <Button
            onClick={onSubmit}
            disabled={!isCurrentStepValid}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white flex items-center gap-2 px-8 py-3 text-lg font-semibold shadow-lg"
            size="lg"
          >
            <Check className="h-5 w-5" />
            Submit My Team
          </Button>
        ) : (
          <Button
            onClick={onNext}
            disabled={!isCurrentStepValid}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center gap-2 px-6 py-3"
            size="lg"
          >
            Next Step
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};