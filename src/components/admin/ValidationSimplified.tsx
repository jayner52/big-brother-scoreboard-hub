import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Info } from 'lucide-react';

export const ValidationSimplified: React.FC = () => {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
          <Info className="h-5 w-5" />
          Data Entry Mode
          <Badge variant="outline" className="ml-auto bg-blue-100 text-blue-800">
            Manual Entry
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-blue-700">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 text-blue-600" />
            <div>
              <p className="font-medium">Manual data entry is recommended</p>
              <p className="text-blue-600">
                AI validation has been disabled for more reliable results. 
                Please fill in the weekly events manually using official Big Brother sources.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};