import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllSpecialEvents } from '@/constants/specialEvents';
import { Info } from 'lucide-react';

export const SpecialEventsLegend: React.FC = () => {
  const allEvents = getAllSpecialEvents();
  
  return (
    <Card className="bg-muted/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="h-5 w-5" />
          Special Events Legend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {allEvents.map(event => (
            <div key={event.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/30">
              <span className="text-lg">{event.emoji}</span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">{event.label}</span>
                {event.points !== undefined && (
                  <Badge 
                    variant={event.points > 0 ? "default" : "destructive"}
                    className="ml-2 text-xs"
                  >
                    {event.points > 0 ? '+' : ''}{event.points}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
          <p>Special events are either tracked manually during weekly events or calculated automatically based on game results.</p>
        </div>
      </CardContent>
    </Card>
  );
};