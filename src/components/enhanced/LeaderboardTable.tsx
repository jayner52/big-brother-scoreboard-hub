import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LeaderboardRow } from './LeaderboardRow';
import { useIsMobile } from '@/hooks/use-mobile';
import { Info } from 'lucide-react';

interface LeaderboardTableProps {
  displayData: any[];
  showHistoricalColumns: boolean;
  selectedWeek?: number | null;
}

// Mobile card component for individual entries
const MobileLeaderboardCard: React.FC<{
  entry: any;
  index: number;
  showHistoricalColumns: boolean;
  selectedWeek?: number | null;
}> = ({ entry, index, showHistoricalColumns, selectedWeek }) => {
  const rank = index + 1;
  
  return (
    <Card className="mobile-card mb-3">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-lg font-bold">
              #{rank}
            </Badge>
            {showHistoricalColumns && entry.previous_rank && (
              <Badge variant="outline" className="text-xs">
                {entry.previous_rank > rank ? '↑' : entry.previous_rank < rank ? '↓' : '='} 
                {Math.abs(entry.previous_rank - rank)}
              </Badge>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {entry.total_points}
            </div>
            <Badge 
              variant={entry.payment_confirmed ? 'default' : 'secondary'}
              className="text-xs"
            >
              {entry.payment_confirmed ? '✓ Paid' : 'Unpaid'}
            </Badge>
          </div>
        </div>
        
        <div className="mb-3">
          <h3 className="font-semibold text-lg">{entry.team_name}</h3>
          <p className="text-sm text-muted-foreground">{entry.participant_name}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div>
            <span className="text-muted-foreground">Weekly:</span>
            <span className="font-medium ml-1">{entry.weekly_points}</span>
            {showHistoricalColumns && (
              <span className="text-xs text-muted-foreground ml-1">
                ({entry.weekly_change > 0 ? '+' : ''}{entry.weekly_change})
              </span>
            )}
          </div>
          <div>
            <span className="text-muted-foreground">Bonus:</span>
            <span className="font-medium ml-1">{entry.bonus_points}</span>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <strong>Team:</strong> {[
            entry.player_1,
            entry.player_2, 
            entry.player_3,
            entry.player_4,
            entry.player_5
          ].filter(Boolean).join(', ')}
        </div>
      </CardContent>
    </Card>
  );
};

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  displayData,
  showHistoricalColumns,
  selectedWeek
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-3">
        {displayData.map((entry, index) => (
          <MobileLeaderboardCard
            key={entry.id}
            entry={entry}
            index={index}
            showHistoricalColumns={showHistoricalColumns}
            selectedWeek={selectedWeek}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead className="w-16 text-center font-bold">
              <div className="flex items-center justify-center gap-1">
                Rank
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-sm">
                        Teams are ranked by: 1) Total Points, 2) Weekly Points, 3) Bonus Points, 4) Join Date (earliest first)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TableHead>
            {showHistoricalColumns && <TableHead className="w-20 text-center font-bold">Rank Δ</TableHead>}
            <TableHead className="w-48 font-bold">Team Name</TableHead>
            <TableHead className="w-32 font-bold">Participant</TableHead>
            <TableHead className="flex-1 font-bold">Houseguests</TableHead>
            <TableHead className="w-20 text-center font-bold">Weekly</TableHead>
            {showHistoricalColumns && <TableHead className="w-20 text-center font-bold">Week Δ</TableHead>}
            <TableHead className="w-20 text-center font-bold">Bonus</TableHead>
            <TableHead className="w-24 text-center font-bold bg-gradient-to-r from-yellow-100 to-yellow-200">Total</TableHead>
            <TableHead className="w-20 text-center font-bold">Δ</TableHead>
            <TableHead className="w-20 text-center font-bold">Payment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.map((entry, index) => (
            <LeaderboardRow
              key={entry.id}
              entry={entry}
              index={index}
              showHistoricalColumns={showHistoricalColumns}
              selectedWeek={selectedWeek}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};