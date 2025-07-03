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

      {/* Team Dashboard */}
      <div className="w-full bg-card border rounded-lg p-4">
        <div className="flex items-center justify-between">
          {/* Left: Team Info */}
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Users className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{currentEntry.team_name}</h3>
              <p className="text-sm text-muted-foreground">by {currentEntry.participant_name}</p>
            </div>
          </div>
          
          {/* Center: Player Cards */}
          <div className="flex items-center gap-2">
            {[currentEntry.player_1, currentEntry.player_2, currentEntry.player_3, currentEntry.player_4, currentEntry.player_5].map((player, index) => (
              <div key={index} className="flex flex-col items-center bg-muted rounded-lg px-3 py-2">
                <span className="font-medium text-xs mb-1" title={player}>
                  {player.split(' ')[0]}
                </span>
                <div className="bg-primary/10 rounded-full px-2 py-0.5">
                  <span className="text-sm font-semibold text-primary">
                    {houseguestPoints[player] || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Right: Status & Score */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1">
              <Badge 
                variant={currentEntry.payment_confirmed ? "default" : "destructive"} 
                className="text-xs"
              >
                {currentEntry.payment_confirmed ? "✓ Paid" : "⏳ Pending"}
              </Badge>
              {currentEntry.current_rank && (
                <Badge variant="outline" className="text-xs">
                  Rank #{currentEntry.current_rank}
                </Badge>
              )}
            </div>
            <div className="bg-muted rounded-lg px-4 py-3 text-center">
              <div className="text-2xl font-bold text-primary">
                {totalPoints}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                POINTS
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};