import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PoolEntry } from '@/types/pool';
import { useHouseguestPoints } from '@/hooks/useHouseguestPoints';

interface UserTeamsProps {
  userId?: string;
}

export const HouseguestProfiles: React.FC<UserTeamsProps> = ({ userId }) => {
  const [userEntries, setUserEntries] = useState<PoolEntry[]>([]);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { houseguestPoints } = useHouseguestPoints();

  useEffect(() => {
    loadUserEntries();
  }, [userId]);

  const loadUserEntries = async () => {
    try {
      setLoading(true);
      
      let query = supabase.from('pool_entries').select('*');
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const mappedEntries = data?.map(entry => ({
        ...entry,
        bonus_answers: entry.bonus_answers as Record<string, any>,
        created_at: new Date(entry.created_at),
        updated_at: new Date(entry.updated_at)
      })) || [];

      setUserEntries(mappedEntries);
    } catch (error) {
      console.error('Error loading user entries:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading your teams...</div>;
  }

  if (userEntries.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-semibold mb-2">No Teams Found</p>
          <p className="text-muted-foreground">You haven't created any teams yet.</p>
        </CardContent>
      </Card>
    );
  }

  const currentEntry = userEntries[currentEntryIndex];
  const totalPoints = [currentEntry.player_1, currentEntry.player_2, currentEntry.player_3, currentEntry.player_4, currentEntry.player_5]
    .reduce((sum, player) => sum + (houseguestPoints[player] || 0), 0);

  const nextEntry = () => {
    setCurrentEntryIndex((prev) => (prev + 1) % userEntries.length);
  };

  const prevEntry = () => {
    setCurrentEntryIndex((prev) => (prev - 1 + userEntries.length) % userEntries.length);
  };

  return (
    <div className="w-full">
      {/* Navigation */}
      {userEntries.length > 1 && (
        <div className="flex items-center justify-center gap-4 mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevEntry}
            disabled={userEntries.length <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Team {currentEntryIndex + 1} of {userEntries.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={nextEntry}
            disabled={userEntries.length <= 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Full-Width Horizontal Team Dashboard */}
      <div className="w-full bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 shadow-lg">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary">{currentEntry.team_name}</h3>
              <p className="text-sm text-muted-foreground">by {currentEntry.participant_name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Status Badges */}
            <Badge variant={currentEntry.payment_confirmed ? "default" : "destructive"}>
              {currentEntry.payment_confirmed ? "Payment Confirmed" : "Payment Pending"}
            </Badge>
            {currentEntry.current_rank && (
              <Badge variant="outline">Rank #{currentEntry.current_rank}</Badge>
            )}
            {/* Total Points */}
            <div className="text-right bg-primary/10 rounded-lg px-4 py-2">
              <div className="text-3xl font-bold text-primary">{totalPoints}</div>
              <div className="text-xs text-muted-foreground">Total Points</div>
            </div>
          </div>
        </div>

        {/* Team Players - Full Width Grid */}
        <div className="grid grid-cols-5 gap-4 mb-4">
          {[currentEntry.player_1, currentEntry.player_2, currentEntry.player_3, currentEntry.player_4, currentEntry.player_5].map((player, index) => (
            <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4 text-center hover:bg-white/10 transition-all duration-200">
              <div className="font-semibold text-sm mb-2 text-foreground" title={player}>{player}</div>
              <div className="text-2xl font-bold text-primary mb-1">
                {houseguestPoints[player] || 0}
              </div>
              <div className="text-xs text-muted-foreground">points</div>
            </div>
          ))}
        </div>

        {/* Points Breakdown - Full Width */}
        <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/20">
          <div className="text-center bg-blue-500/10 rounded-lg p-3">
            <div className="text-xl font-bold text-blue-600">{currentEntry.weekly_points}</div>
            <div className="text-sm text-blue-600/80">Weekly Points</div>
          </div>
          <div className="text-center bg-green-500/10 rounded-lg p-3">
            <div className="text-xl font-bold text-green-600">{currentEntry.bonus_points}</div>
            <div className="text-sm text-green-600/80">Bonus Points</div>
          </div>
          <div className="text-center bg-primary/10 rounded-lg p-3">
            <div className="text-xl font-bold text-primary">{totalPoints}</div>
            <div className="text-sm text-primary/80">Total Points</div>
          </div>
        </div>
      </div>
    </div>
  );
};