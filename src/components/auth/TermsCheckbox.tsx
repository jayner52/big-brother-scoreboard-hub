import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface TermsCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onShowTerms: () => void;
  error?: string;
}

export const TermsCheckbox = ({ checked, onCheckedChange, onShowTerms, error }: TermsCheckboxProps) => {
  return (
    <div className={`p-4 rounded-lg border ${error ? 'border-destructive bg-destructive/5' : 'border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800'}`}>
      <div className="flex items-start space-x-3">
        <Checkbox
          id="terms-accepted"
          checked={checked}
          onCheckedChange={(checked) => onCheckedChange(checked as boolean)}
          className="mt-1"
        />
        <div className="space-y-1">
          <Label htmlFor="terms-accepted" className="text-sm font-medium cursor-pointer">
            I agree to the{' '}
            <button
              type="button"
              onClick={onShowTerms}
              className="text-primary hover:underline"
            >
              Terms & Conditions
            </button>
            {' '}*
          </Label>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};