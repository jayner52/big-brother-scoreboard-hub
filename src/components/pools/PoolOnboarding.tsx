import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight, Settings, Users, Crown } from 'lucide-react';

interface PoolOnboardingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poolName: string;
}

export const PoolOnboarding = ({ open, onOpenChange, poolName }: PoolOnboardingProps) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome, Pool Owner!',
      content: (
        <div className="text-center space-y-4">
          <Crown className="h-16 w-16 text-yellow-500 mx-auto" />
          <h3 className="text-xl font-bold">You've created "{poolName}"!</h3>
          <p className="text-gray-600">
            As the pool owner, you have special admin powers to configure your pool and manage the season.
          </p>
        </div>
      )
    },
    {
      title: 'Find the Admin Button',
      content: (
        <div className="text-center space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <Settings className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-blue-800 font-medium">Look for the "Admin" button in the top-right corner</p>
          </div>
          <p className="text-gray-600">
            This button gives you access to all pool management features, including contestant setup and weekly scoring.
          </p>
        </div>
      )
    },
    {
      title: 'Configure Your Pool',
      content: (
        <div className="text-center space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <Settings className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-800 font-medium">Click Admin → Pool Settings</p>
          </div>
          <p className="text-gray-600">
            Set your buy-in amount, payment details, draft deadlines, and other pool preferences.
          </p>
        </div>
      )
    },
    {
      title: 'Invite Your Friends',
      content: (
        <div className="text-center space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-purple-800 font-medium">Look for the "Invite Friends" button</p>
          </div>
          <p className="text-gray-600">
            Share your unique invite code to let friends join your pool and start drafting their teams.
          </p>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onOpenChange(false);
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{steps[step].title}</DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {steps[step].content}
        </div>

        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={step === 0}
          >
            Previous
          </Button>
          
          <div className="text-sm text-gray-500">
            {step + 1} of {steps.length}
          </div>
          
          <Button onClick={handleNext}>
            {step === steps.length - 1 ? 'Get Started' : (
              <>
                Next <ArrowRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};