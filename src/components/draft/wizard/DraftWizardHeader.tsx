import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface DraftWizardHeaderProps {
  seasonName?: string;
}

export const DraftWizardHeader: React.FC<DraftWizardHeaderProps> = ({
  seasonName,
}) => {
  return (
    <Card className="w-full shadow-xl border-2 border-purple-100">
      <CardHeader className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="text-3xl font-bold flex items-center gap-3 bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
          <Sparkles className="h-8 w-8 text-yellow-300" />
          Join the {seasonName} Fantasy Pool
        </CardTitle>
        <p className="text-purple-100 text-lg mt-2 font-semibold">
          Build your championship team and compete for glory!
        </p>
      </CardHeader>
    </Card>
  );
};