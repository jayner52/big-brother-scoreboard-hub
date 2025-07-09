import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, X, Settings, MessageSquare, Users, ChevronRight, ArrowRight } from 'lucide-react';
import { useSimplifiedSetupChecklist } from '@/hooks/useSimplifiedSetupChecklist';
import { useIsMobile } from '@/hooks/use-mobile';

interface SimplifiedPoolSetupChecklistProps {
  forceShow?: boolean;
}

export const SimplifiedPoolSetupChecklist: React.FC<SimplifiedPoolSetupChecklistProps> = ({ 
  forceShow = false 
}) => {
  const [isOpen, setIsOpen] = useState(forceShow);
  const isMobile = useIsMobile();
  const {
    checklistSteps,
    checkedItems,
    toggleItem,
    handleNavigation,
    completedSteps,
    totalSteps,
    completionPercentage,
    isComplete
  } = useSimplifiedSetupChecklist();

  // Handle forced show
  React.useEffect(() => {
    if (forceShow) {
      setIsOpen(true);
    }
  }, [forceShow]);

  // Minimized view when closed
  if (!isOpen) {
    return (
      <div 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 cursor-pointer"
      >
        <Card className="bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-foreground text-primary flex items-center justify-center text-sm font-bold">
                {completedSteps}
              </div>
              <div className="text-sm">
                <div className="font-medium">Setup Progress</div>
                <div className="text-primary-foreground/80">{completedSteps}/{totalSteps} complete</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stepIcons = {
    poolSettings: Settings,
    bonusQuestions: MessageSquare,
    inviteFriends: Users
  };

  return (
    <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
      <CardHeader className={`${isMobile ? 'p-4' : 'p-6'} pb-4`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'} mb-2 flex items-center gap-2`}>
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Pool Setup Guide
            </CardTitle>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{completedSteps}/{totalSteps} steps</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
            
            {isComplete && (
              <Badge variant="default" className="mt-2 bg-green-100 text-green-800 border-green-200">
                🎉 Setup Complete!
              </Badge>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="ml-2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className={`${isMobile ? 'p-4' : 'p-6'} pt-0`}>
        <Accordion type="single" collapsible className="space-y-3">
          {checklistSteps.map((step, index) => {
            const Icon = stepIcons[step.key as keyof typeof stepIcons];
            const isCompleted = checkedItems[step.key];
            
            return (
              <AccordionItem 
                key={step.key} 
                value={step.key}
                className="border rounded-lg bg-background/50"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-3 flex-1 text-left">
                    {/* Step Number & Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground border-2 border-muted-foreground/20'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <span className="text-sm font-bold">{index + 1}</span>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <h3 className={`font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
                          {step.title}
                        </h3>
                      </div>
                      <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'} mt-1`}>
                        {step.description}
                      </p>
                    </div>
                    
                    {/* Status Badge */}
                    {isCompleted && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                        Complete
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3 ml-11">
                    {/* Main Action Button */}
                    <Button
                      onClick={() => handleNavigation(step.navigation)}
                      className="w-full justify-between"
                      variant={isCompleted ? "outline" : "default"}
                    >
                      <span>{step.actionText}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    
                    {/* Sub-tasks for Pool Settings */}
                    {step.subTasks && (
                      <div className="space-y-2 pt-2 border-t">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                          What you'll configure:
                        </p>
                        {step.subTasks.map((subTask) => (
                          <button
                            key={subTask.key}
                            onClick={() => handleNavigation(subTask.navigation)}
                            className="w-full text-left p-2 rounded border bg-muted/30 hover:bg-muted/50 transition-colors group"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium">{subTask.title}</div>
                                <div className="text-xs text-muted-foreground">{subTask.description}</div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Mark as Complete Toggle */}
                    <div className="pt-2 border-t">
                      <button
                        onClick={() => toggleItem(step.key)}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                        Mark as {isCompleted ? 'incomplete' : 'complete'}
                      </button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
};