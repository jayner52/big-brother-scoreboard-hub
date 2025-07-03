import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Save, Trash2, CheckCircle, Clock, Sparkles } from 'lucide-react';

interface WeekControlsProps {
  weekNumber: number;
  isComplete: boolean;
  onMarkComplete: (complete: boolean) => void;
  onClearWeek: () => void;
  onSaveProgress: () => void;
  onSubmitWeek: () => void;
  onAIPopulate?: () => void;
  isAutoSaving: boolean;
  isAIPopulating?: boolean;
}

export const WeekControls: React.FC<WeekControlsProps> = ({
  weekNumber,
  isComplete,
  onMarkComplete,
  onClearWeek,
  onSaveProgress,
  onSubmitWeek,
  onAIPopulate,
  isAutoSaving,
  isAIPopulating
}) => {
  return (
    <div className="space-y-4">
      {/* Week Status */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-3">
          <Switch
            checked={isComplete}
            onCheckedChange={onMarkComplete}
          />
          <Label className="flex items-center gap-2">
            {isComplete ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                Week {weekNumber} Complete
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 text-orange-500" />
                Week {weekNumber} Draft
              </>
            )}
          </Label>
        </div>
        
        <div className="flex items-center gap-2">
          {isComplete && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Completed
            </Badge>
          )}
          {isAutoSaving && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Save className="h-4 w-4 animate-pulse" />
              <span className="text-sm">Auto-saving...</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - Organized by workflow */}
      <div className="space-y-3">
        {/* Primary Action Row - AI and Manual Entry */}
        <div className="flex gap-3">
          {onAIPopulate && (
            <Button 
              onClick={onAIPopulate}
              disabled={isAIPopulating}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
              size="lg"
            >
              {isAIPopulating ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing Live Feeds...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Populate Week {weekNumber}
                </>
              )}
            </Button>
          )}
          
          <Button 
            onClick={onSaveProgress}
            variant="outline"
            className="flex-1 border-2 hover:bg-muted/50"
            disabled={isAutoSaving}
            size="lg"
          >
            <Save className="h-4 w-4 mr-2" />
            {isAutoSaving ? 'Auto-saving...' : 'Save Progress'}
          </Button>
        </div>

        {/* Secondary Action Row - Management */}
        <div className="flex gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Week Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Week {weekNumber} Data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all data for Week {weekNumber}, including competitions, nominations, evictions, and special events. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onClearWeek} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Clear All Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button 
            onClick={() => {
              onSubmitWeek();
              if (isComplete) {
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              }
            }} 
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md"
            size="lg"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isComplete ? 'Finalize & Advance' : `Complete Week ${weekNumber}`}
          </Button>
        </div>
      </div>
    </div>
  );
};