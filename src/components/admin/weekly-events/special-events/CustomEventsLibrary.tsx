import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';

interface CustomEvent {
  id: string;
  description: string;
  emoji?: string;
  points: number;
}

interface CustomEventsLibraryProps {
  customEvents: CustomEvent[];
  onDeleteEvent: (ruleId: string) => Promise<void>;
}

export const CustomEventsLibrary: React.FC<CustomEventsLibraryProps> = ({
  customEvents,
  onDeleteEvent
}) => {
  if (customEvents.length === 0) return null;

  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
      <h4 className="font-medium text-blue-800 mb-2">Your Custom Events Library</h4>
      <div className="space-y-2">
        {customEvents.map(rule => (
          <div key={rule.id} className="flex items-center justify-between p-2 bg-white rounded border">
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {rule.emoji && <span className="mr-1">{rule.emoji}</span>}
                {rule.description}
              </span>
              <Badge variant="outline" className="text-xs">
                {rule.points > 0 ? '+' : ''}{rule.points} pts
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteEvent(rule.id)}
              className="text-destructive hover:text-destructive h-8 w-8 p-0"
              title="Delete custom event"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};