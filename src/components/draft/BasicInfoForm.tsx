import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Users, Mail } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="text-center">
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg mb-4 shadow-lg">
          <h3 className="text-3xl font-bold mb-2">
            Let's Get Started!
          </h3>
          <p className="text-purple-100 text-lg">Tell us a bit about yourself and your team</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="transition-all duration-200 hover:shadow-md border-2 hover:border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-purple-600" />
              Your Name
            </CardTitle>
            <CardDescription>How should we identify you?</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              id="participant_name"
              type="text"
              value={formData.participant_name}
              onChange={(e) => onFormDataChange({ participant_name: e.target.value })}
              placeholder="Enter your full name"
              className="text-lg"
            />
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md border-2 hover:border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-purple-600" />
              Team Name
            </CardTitle>
            <CardDescription>Choose a creative team name</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              id="team_name"
              type="text"
              value={formData.team_name}
              onChange={(e) => onFormDataChange({ team_name: e.target.value })}
              placeholder="Enter your team name"
              className="text-lg"
            />
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md border-2 hover:border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-purple-600" />
              Email Address
            </CardTitle>
            <CardDescription>For important updates</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onFormDataChange({ email: e.target.value })}
              placeholder="Enter your email"
              className="text-lg"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};