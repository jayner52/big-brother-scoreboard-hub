import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useLeaderboardFix } from '@/hooks/useLeaderboardFix';
import { useToast } from '@/hooks/use-toast';

export const LeaderboardFixPanel: React.FC = () => {
  const { fixAllTeamPoints, isFixing } = useLeaderboardFix();
  const { toast } = useToast();

  const handleFixLeaderboard = async () => {
    const success = await fixAllTeamPoints();
    
    if (success) {
      toast({
        title: "Leaderboard Fixed!",
        description: "All team points have been recalculated successfully.",
      });
    } else {
      toast({
        title: "Fix Failed",
        description: "There was an error fixing the leaderboard. Check console for details.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          Leaderboard Debug & Fix
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Use this tool to recalculate all team points and fix any leaderboard display issues.
          This will:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
          <li>• Recalculate weekly points for all team members</li>
          <li>• Recalculate bonus question points (including showmance)</li>
          <li>• Update total points for all teams</li>
          <li>• Fix any missing teams in leaderboard</li>
        </ul>
        
        <Button 
          onClick={handleFixLeaderboard}
          disabled={isFixing}
          className="w-full"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isFixing ? 'animate-spin' : ''}`} />
          {isFixing ? 'Fixing Leaderboard...' : 'Fix All Team Points'}
        </Button>
      </CardContent>
    </Card>
  );
};