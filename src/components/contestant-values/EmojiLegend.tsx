import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useScoringRules } from '@/hooks/useScoringRules';
import { getScoringRuleEmoji } from '@/utils/scoringCategoryEmojis';

export const EmojiLegend: React.FC = () => {
  const { scoringRules } = useScoringRules();

  // Group scoring rules by category for display
  const activeScoringRules = scoringRules.filter(rule => rule.is_active);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Scoring Legend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
          {activeScoringRules.map((rule) => {
            const emoji = getScoringRuleEmoji(rule.category, rule.subcategory);
            return (
              <div key={rule.id} className="flex items-center gap-2">
                <span className="text-sm">{emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground truncate">{rule.description}</span>
                    <span className={`text-xs font-medium ${rule.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {rule.points > 0 ? '+' : ''}{rule.points} pts
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};