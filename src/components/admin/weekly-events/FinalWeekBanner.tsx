import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Crown, Trophy, Heart } from 'lucide-react';

interface FinalWeekBannerProps {
  isFinalWeek: boolean;
  week: number;
  winner?: string;
  runnerUp?: string;
  americasFavorite?: string;
}

export const FinalWeekBanner: React.FC<FinalWeekBannerProps> = ({
  isFinalWeek,
  week,
  winner,
  runnerUp,
  americasFavorite
}) => {
  if (!isFinalWeek) {
    return null;
  }

  return (
    <Alert className="border-yellow-200 bg-yellow-50">
      <Crown className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold text-yellow-800">🏆 FINAL WEEK - Week {week}</span>
            <p className="text-sm text-yellow-700 mt-1">
              This is the season finale week. Set winner, runner-up, and America's Favorite Player.
            </p>
          </div>
          <div className="flex gap-2">
            {winner && (
              <Badge variant="secondary" className="bg-yellow-100">
                <Trophy className="h-3 w-3 mr-1" />
                Winner: {winner}
              </Badge>
            )}
            {runnerUp && (
              <Badge variant="secondary" className="bg-gray-100">
                🥈 Runner-up: {runnerUp}
              </Badge>
            )}
            {americasFavorite && (
              <Badge variant="secondary" className="bg-red-100">
                <Heart className="h-3 w-3 mr-1" />
                AFP: {americasFavorite}
              </Badge>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};