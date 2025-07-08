import { Input } from '@/components/ui/input';
import { PoolFormField } from './PoolFormField';

interface PoolBasicInfoSectionProps {
  name: string;
  description: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export const PoolBasicInfoSection = ({
  name,
  description,
  onNameChange,
  onDescriptionChange,
}: PoolBasicInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <PoolFormField label="Pool Name" required>
        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g., Smith Family Pool"
          required
        />
      </PoolFormField>

      <PoolFormField label="Season Name">
        <Input
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="e.g., Big Brother 2024"
        />
      </PoolFormField>
    </div>
  );
};