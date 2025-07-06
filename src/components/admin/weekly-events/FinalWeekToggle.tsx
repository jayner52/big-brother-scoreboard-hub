import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Crown, Trophy, Heart } from 'lucide-react';
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
        winner: checked ? prev.winner : '',
        runnerUp: checked ? prev.runnerUp : '',
        americasFavorite: checked ? prev.americasFavorite : ''
      }));
      console.log('🏁 Final Week Toggle successful');
    } catch (error) {
      console.error('🏁 Final Week Toggle error:', error);
      // Re-throw to show user the error
      throw error;
    }
  };

  return (
    <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-2 py-1">
      <Switch
        checked={eventForm.isFinalWeek}
        onCheckedChange={handleFinalWeekToggle}
      />
      <span className="text-sm font-medium text-yellow-800">Final Week</span>
    </div>
  );
};