import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface EmailOptInCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const EmailOptInCheckbox = ({ checked, onCheckedChange }: EmailOptInCheckboxProps) => {
  return (
    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-start space-x-3">
        <Checkbox
          id="email-opt-in"
          checked={checked}
          onCheckedChange={(checked) => onCheckedChange(checked as boolean)}
          className="mt-1"
        />
        <div className="space-y-1">
          <Label htmlFor="email-opt-in" className="text-sm font-medium cursor-pointer">
            Subscribe to Poolside Picks Updates
          </Label>
          <p className="text-xs text-muted-foreground">
            Get notified about new features, pool invites, and Big Brother updates. 
            You can unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
};