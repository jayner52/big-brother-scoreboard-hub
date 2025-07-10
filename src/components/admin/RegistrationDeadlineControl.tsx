import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CalendarIcon, Clock, Save, X, Check, AlertCircle } from 'lucide-react';
import { format, differenceInDays, differenceInHours, differenceInMinutes, isBefore, isAfter } from 'date-fns';
import { useDraftTogglePersistence } from '@/hooks/useDraftTogglePersistence';

interface RegistrationDeadlineControlProps {
  poolId: string;
  currentDeadline?: string | null;
  disabled?: boolean;
}

export const RegistrationDeadlineControl: React.FC<RegistrationDeadlineControlProps> = ({
  poolId,
  currentDeadline,
  disabled = false
}) => {
  const { toast } = useToast();
  const { handleRegistrationDeadline, isUpdating } = useDraftTogglePersistence();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize values from current deadline
  useEffect(() => {
    if (currentDeadline) {
      const date = new Date(currentDeadline);
      setSelectedDate(date);
      setSelectedTime(`${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`);
    } else {
      setSelectedDate(undefined);
      setSelectedTime('23:59'); // Default to end of day
    }
    setHasUnsavedChanges(false);
  }, [currentDeadline]);

  // Track changes
  useEffect(() => {
    const currentDateTime = currentDeadline ? new Date(currentDeadline) : null;
    const newDateTime = selectedDate && selectedTime ? 
      new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`) : null;

    const hasChanges = currentDateTime?.getTime() !== newDateTime?.getTime();
    setHasUnsavedChanges(hasChanges);
  }, [selectedDate, selectedTime, currentDeadline]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setIsOpen(false);
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
  };

  const handleSave = async () => {
    if (!selectedDate || !selectedTime) {
      await handleRegistrationDeadline(null);
      toast({
        title: "Due Date Cleared",
        description: "Registration deadline has been removed",
      });
      return;
    }

    try {
      const deadlineDateTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`);
      const result = await handleRegistrationDeadline(deadlineDateTime.toISOString());
      
      if (result) {
        setHasUnsavedChanges(false);
        toast({
          title: "Due Date Saved",
          description: `Registration deadline set to ${format(deadlineDateTime, 'PPP p')}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save registration deadline",
        variant: "destructive",
      });
    }
  };

  const handleClear = async () => {
    const result = await handleRegistrationDeadline(null);
    if (result) {
      setSelectedDate(undefined);
      setSelectedTime('23:59');
      setHasUnsavedChanges(false);
      toast({
        title: "Due Date Cleared",
        description: "Registration deadline has been removed",
      });
    }
  };

  const getDeadlineStatus = () => {
    if (!currentDeadline) return null;
    
    const deadline = new Date(currentDeadline);
    const now = new Date();
    
    if (isBefore(deadline, now)) {
      return {
        type: 'expired' as const,
        message: 'Deadline has passed',
        icon: AlertCircle,
        className: 'text-destructive'
      };
    }
    
    const daysLeft = differenceInDays(deadline, now);
    const hoursLeft = differenceInHours(deadline, now);
    const minutesLeft = differenceInMinutes(deadline, now);
    
    if (daysLeft > 0) {
      return {
        type: 'upcoming' as const,
        message: `${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining`,
        icon: Clock,
        className: daysLeft <= 2 ? 'text-orange-600' : 'text-green-600'
      };
    } else if (hoursLeft > 0) {
      return {
        type: 'urgent' as const,
        message: `${hoursLeft} hour${hoursLeft === 1 ? '' : 's'} remaining`,
        icon: Clock,
        className: 'text-orange-600'
      };
    } else {
      return {
        type: 'critical' as const,
        message: `${minutesLeft} minute${minutesLeft === 1 ? '' : 's'} remaining`,
        icon: AlertCircle,
        className: 'text-destructive'
      };
    }
  };

  const deadlineStatus = getDeadlineStatus();

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Registration Deadline
            </Label>
            {deadlineStatus && (
              <div className={cn("flex items-center gap-1 text-sm font-medium", deadlineStatus.className)}>
                <deadlineStatus.icon className="h-3 w-3" />
                {deadlineStatus.message}
              </div>
            )}
          </div>

          {currentDeadline && (
            <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
              Current: {format(new Date(currentDeadline), 'PPP p')}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm">Date</Label>
              <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    className="pointer-events-auto"
                    disabled={(date) => isBefore(date, new Date(new Date().setHours(0, 0, 0, 0)))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Time</Label>
              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                disabled={disabled}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={disabled || isUpdating || !hasUnsavedChanges}
                size="sm"
                className="flex items-center gap-1"
              >
                {isUpdating ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Save className="h-3 w-3" />
                )}
                Save Due Date
              </Button>
              
              {currentDeadline && (
                <Button
                  onClick={handleClear}
                  disabled={disabled || isUpdating}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>

            {hasUnsavedChanges && (
              <div className="flex items-center gap-1 text-sm text-orange-600">
                <AlertCircle className="h-3 w-3" />
                Unsaved changes
              </div>
            )}

            {!hasUnsavedChanges && currentDeadline && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <Check className="h-3 w-3" />
                Saved
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• When the deadline passes, new participants will be blocked automatically</p>
            <p>• Consider setting this 1-2 hours before the season premiere</p>
            <p>• Use "Hide Picks" to prevent strategy copying until the deadline</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};