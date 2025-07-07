import React from 'react';
import { Switch } from '@/components/ui/switch';
import { ContestantWithBio, WeeklyEventForm } from '@/types/admin';

interface FinalWeekToggleProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
  activeContestants: ContestantWithBio[];
}

export const FinalWeekToggle: React.FC<FinalWeekToggleProps> = ({
  eventForm,
  setEventForm,
  activeContestants,
}) => {
  const handleFinalWeekToggle = (checked: boolean) => {
    try {
      console.log('🏁 Final Week Toggle:', { checked, currentForm: eventForm });
      setEventForm(prev => ({ 
        ...prev, 
        isFinalWeek: checked,
        // Reset final week fields when toggling off
        winner: checked ? prev.winner || '' : '',
        runnerUp: checked ? prev.runnerUp || '' : '',
        americasFavorite: checked ? prev.americasFavorite || '' : ''
      }));
      console.log('🏁 Final Week Toggle successful');
    } catch (error) {
      console.error('🏁 Final Week Toggle error:', error);
      // Don't re-throw to prevent UI crashes
    }
  };

  return (
    <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-2 py-1">
      <Switch
        checked={eventForm.isFinalWeek || false}
        onCheckedChange={handleFinalWeekToggle}
      />
      <span className="text-sm font-medium text-yellow-800">Final Week</span>
    </div>
  );
};