import React from 'react';
import { Badge } from '@/components/ui/badge';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Edit3, Trophy, Trash2 } from 'lucide-react';
import { PoolEntry } from '@/types/pool';

interface TeamCardProps {
  entry: PoolEntry;
  isEvicted: (playerName: string) => boolean;
  houseguestPoints: Record<string, number>;
  onEditTeam: (entry: PoolEntry) => void;
  onDeleteTeam: (entry: PoolEntry) => void;
  draftLocked: boolean;
  hasBuyIn: boolean;
  updating: boolean;
  picksPerTeam: number;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  entry,
  isEvicted,
  houseguestPoints,
  onEditTeam,
  onDeleteTeam,
  draftLocked,
  hasBuyIn,
  updating,
  picksPerTeam
}) => {
  const players = Array.from({ length: picksPerTeam }, (_, i) => 
    entry[`player_${i + 1}` as keyof PoolEntry] as string
  ).filter(Boolean);
  
  const totalPoints = players.reduce((sum, player) => sum + (houseguestPoints[player] || 0), 0);

  const renderPlayerCard = (playerName: string, index: number) => {
    const isEliminated = isEvicted(playerName);
    const points = houseguestPoints[playerName] || 0;
    
    return (
      <div 
        key={index} 
        className={`bg-card/50 rounded-lg p-3 border transition-all duration-200 ${
          isEliminated ? 'opacity-60 border-destructive/20' : 'border-border hover:border-primary/30'
        }`}
      >
        <div className="text-center">
          <span className={`font-medium text-sm mb-2 block ${
            isEliminated ? 'text-destructive' : 'text-foreground'
          }`}>
            {playerName}
          </span>
          <div className={`rounded-full px-3 py-1 ${
            isEliminated 
              ? 'bg-destructive/20 border border-destructive/30' 
              : 'bg-primary/10 border border-primary/20'
          }`}>
            <span className={`text-sm font-bold ${
              isEliminated ? 'text-destructive' : 'text-primary'
            }`}>
              {points} pts
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full shadow-sm border-border/50 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg leading-tight">{entry.team_name}</CardTitle>
              <p className="text-sm text-muted-foreground">{entry.participant_name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 rounded-lg px-4 py-2 border border-primary/20">
              <div className="text-xl font-bold text-primary text-center">
                {totalPoints}
              </div>
              <div className="text-xs text-muted-foreground text-center">
                points
              </div>
            </div>
            
            {entry.current_rank && (
              <Badge variant="outline" className="text-sm px-3 py-1">
                <Trophy className="h-3 w-3 mr-1" />
                #{entry.current_rank}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {players.map((player, index) => renderPlayerCard(player, index))}
        </div>

        <div className="flex gap-2 pt-4 border-t border-border/50">
          <EnhancedButton
            variant="outline"
            size="sm"
            onClick={() => onEditTeam(entry)}
            disabled={draftLocked}
            className="flex-1 text-sm"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            {draftLocked ? "Locked" : "Edit"}
          </EnhancedButton>
          
          <EnhancedButton
            variant="outline"
            size="sm"
            onClick={() => onDeleteTeam(entry)}
            className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </EnhancedButton>
        </div>
      </CardContent>
    </Card>
  );
};