import { Label } from '@/components/ui/label';

interface PoolFormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

export const PoolFormField = ({ label, required, error, children }: PoolFormFieldProps) => {
  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};