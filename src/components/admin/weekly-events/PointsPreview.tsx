import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PointsPreviewProps {
  pointsPreview: Record<string, number>;
}

export const PointsPreview: React.FC<PointsPreviewProps> = ({ pointsPreview }) => {
  if (Object.keys(pointsPreview).length === 0) {
    return null;
  }

  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle className="text-lg">Points Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(pointsPreview)
            .sort(([,a], [,b]) => b - a)
            .map(([contestant, points]) => (
              <div key={contestant} className="flex justify-between">
                <span className="font-medium">{contestant}:</span>
                <span className={points > 0 ? 'text-green-600' : points < 0 ? 'text-red-600' : ''}>
                  {points > 0 ? '+' : ''}{points}pts
                </span>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};