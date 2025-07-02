import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BasicInfoFormProps {
  formData: {
    participant_name: string;
    team_name: string;
    email: string;
  };
  onFormDataChange: (updates: Partial<BasicInfoFormProps['formData']>) => void;
}

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  formData,
  onFormDataChange,
}) => {
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Your Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="participant_name" className="text-lg font-semibold">Your Name</Label>
          <Input
            id="participant_name"
            type="text"
            value={formData.participant_name}
            onChange={(e) => onFormDataChange({ participant_name: e.target.value })}
            placeholder="Enter your name"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="team_name" className="text-lg font-semibold">Team Name</Label>
          <Input
            id="team_name"
            type="text"
            value={formData.team_name}
            onChange={(e) => onFormDataChange({ team_name: e.target.value })}
            placeholder="Enter your team name"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="email" className="text-lg font-semibold">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onFormDataChange({ email: e.target.value })}
            placeholder="Enter your email"
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
};