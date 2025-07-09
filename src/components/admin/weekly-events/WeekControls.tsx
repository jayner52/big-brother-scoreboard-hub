import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Save, Trash2, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface WeekControlsProps {
  weekNumber: number;
  isComplete: boolean;
  onMarkComplete: (complete: boolean) => void;
  onClearWeek: () => void;
  onSaveProgress: () => void;
  onSubmitWeek: () => void;
  isAutoSaving: boolean;
  isFinalWeek?: boolean;
  isDraft?: boolean;
  isSubmitting?: boolean;
}

export const WeekControls: React.FC<WeekControlsProps> = ({
  weekNumber,
  isComplete,
  onMarkComplete,
  onClearWeek,
  onSaveProgress,
  onSubmitWeek,
  isAutoSaving,
  isFinalWeek = false,
  isDraft = true,
  isSubmitting = false
}) => {
  const isMobile = useIsMobile();
  return (
    <div className="space-y-4">
      {/* Week Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-3">
          <Switch
            checked={isComplete}
            onCheckedChange={onMarkComplete}
          />
          <Label className="flex items-center gap-2 text-sm sm:text-base">
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
        
        <div className="flex items-center gap-2 justify-end sm:justify-start">
          {isComplete && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
              Completed
            </Badge>
          )}
          {isAutoSaving && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Save className="h-4 w-4 animate-pulse" />
              <span className="text-xs sm:text-sm">Auto-saving...</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Primary Action Row */}
        <div className="flex gap-2 sm:gap-3">
          <Button 
            onClick={onSaveProgress}
            variant="outline"
            className="flex-1 border-2 hover:bg-muted/50 text-sm sm:text-base"
            disabled={isAutoSaving}
            size={isMobile ? "default" : "lg"}
          >
            <Save className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{isAutoSaving ? 'Auto-saving...' : 'Save Progress'}</span>
            <span className="sm:hidden">{isAutoSaving ? 'Saving...' : 'Save'}</span>
          </Button>
        </div>

        {/* Secondary Action Row - Management */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full sm:flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground text-sm sm:text-base"
                size={isMobile ? "default" : "default"}
              >
                <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Clear Week Data</span>
                <span className="sm:hidden">Clear Data</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="mx-4 sm:mx-0 max-w-md sm:max-w-lg">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base sm:text-lg">Clear Week {weekNumber} Data?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm">
                  This will permanently delete all data for Week {weekNumber}, including competitions, nominations, evictions, and special events. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={onClearWeek} 
                  className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Clear All Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button 
            onClick={onSubmitWeek}
            disabled={isSubmitting || isAutoSaving}
            className={`w-full sm:flex-1 shadow-md text-sm sm:text-base ${
              isFinalWeek && isDraft
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white animate-pulse'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
            }`}
            size={isMobile ? "default" : "lg"}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1 sm:mr-2"></div>
                <span className="hidden sm:inline">Processing...</span>
                <span className="sm:hidden">Processing...</span>
              </>
            ) : isFinalWeek && isDraft ? (
              <>
                <Sparkles className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">🏆 SUBMIT FINAL WEEK RESULTS</span>
                <span className="sm:hidden">🏆 SUBMIT FINAL</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">
                  {isComplete ? 'Finalize & Advance' : `Complete Week ${weekNumber}`}
                </span>
                <span className="sm:hidden">
                  {isComplete ? 'Finalize' : `Complete W${weekNumber}`}
                </span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};