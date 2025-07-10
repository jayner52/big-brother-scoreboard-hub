import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, List, Users } from 'lucide-react';
import { PoolEntry } from '@/types/pool';

interface MobileTeamNavigationProps {
  userEntries: PoolEntry[];
  currentEntryIndex: number;
  setCurrentEntryIndex: (index: number) => void;
  houseguestPoints: Record<string, number>;
  picksPerTeam: number;
}

export const MobileTeamNavigation: React.FC<MobileTeamNavigationProps> = ({
  userEntries,
  currentEntryIndex,
  setCurrentEntryIndex,
  houseguestPoints,
  picksPerTeam
}) => {
  if (userEntries.length <= 1) {
    return null;
  }

  const nextEntry = () => {
    setCurrentEntryIndex((currentEntryIndex + 1) % userEntries.length);
  };

  const prevEntry = () => {
    setCurrentEntryIndex((currentEntryIndex - 1 + userEntries.length) % userEntries.length);
  };

  const calculateTeamPoints = (entry: PoolEntry) => {
    const players = Array.from({ length: picksPerTeam }, (_, i) => 
      entry[`player_${i + 1}` as keyof PoolEntry] as string
    ).filter(Boolean);
    
    return players.reduce((sum, player) => sum + (houseguestPoints[player] || 0), 0);
  };

  return (
    <div className="flex items-center justify-between mb-4">
      {/* Quick Navigation */}
      <div className="flex items-center gap-2">
        <EnhancedButton
          variant="outline"
          size="sm"
          onClick={prevEntry}
          className="h-10 w-10 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </EnhancedButton>
        
        <span className="text-sm font-medium px-3 py-2 bg-muted/50 rounded-lg">
          {currentEntryIndex + 1} of {userEntries.length}
        </span>
        
        <EnhancedButton
          variant="outline"
          size="sm"
          onClick={nextEntry}
          className="h-10 w-10 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </EnhancedButton>
      </div>

      {/* Team List Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <EnhancedButton variant="outline" size="sm" className="h-10">
            <List className="h-4 w-4 mr-2" />
            All Teams
          </EnhancedButton>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Teams ({userEntries.length})
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-3 overflow-y-auto max-h-[60vh]">
            {userEntries.map((entry, index) => {
              const teamPoints = calculateTeamPoints(entry);
              const isActive = index === currentEntryIndex;
              
              return (
                <div
                  key={entry.id}
                  onClick={() => setCurrentEntryIndex(index)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    isActive 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-border hover:border-primary/30 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}>
                        {entry.team_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{entry.participant_name}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`text-lg font-bold ${isActive ? 'text-primary' : 'text-foreground'}`}>
                          {teamPoints}
                        </div>
                        <div className="text-xs text-muted-foreground">points</div>
                      </div>
                      
                      {entry.current_rank && (
                        <Badge variant={isActive ? "default" : "outline"} className="text-xs">
                          #{entry.current_rank}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};