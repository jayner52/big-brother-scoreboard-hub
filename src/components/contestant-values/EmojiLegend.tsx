import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSpecialEventLegend } from '@/utils/specialEventIcons';

export const EmojiLegend: React.FC = () => {
  const legend = getSpecialEventLegend();

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Special Event Legend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
          {Object.entries(legend).map(([emoji, description]) => (
            <div key={emoji} className="flex items-center gap-1">
              <span className="text-sm">{emoji}</span>
              <span className="text-muted-foreground">{description}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};