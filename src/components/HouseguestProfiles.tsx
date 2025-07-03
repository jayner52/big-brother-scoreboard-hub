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

      {/* Ultra-Slim Horizontal Team Dashboard */}
      <div className="w-full bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-lg border border-white/20 py-3 px-4 shadow-lg">
        <div className="flex items-center justify-between">
          {/* Left: Team Info */}
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-1.5 rounded">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-primary text-sm">{currentEntry.team_name}</h3>
              <p className="text-xs text-muted-foreground">by {currentEntry.participant_name}</p>
            </div>
          </div>
          
          {/* Center: Players in Horizontal Line */}
          <div className="flex items-center gap-3">
            {[currentEntry.player_1, currentEntry.player_2, currentEntry.player_3, currentEntry.player_4, currentEntry.player_5].map((player, index) => (
              <div key={index} className="flex items-center gap-1 bg-white/5 border border-white/10 rounded px-2 py-1">
                <span className="font-medium text-xs text-foreground" title={player}>
                  {player.split(' ')[0]}
                </span>
                <span className="text-sm font-bold text-primary">
                  {houseguestPoints[player] || 0}
                </span>
              </div>
            ))}
          </div>
          
          {/* Right: Status & Total */}
          <div className="flex items-center gap-3">
            <Badge variant={currentEntry.payment_confirmed ? "default" : "destructive"} className="text-xs py-0.5 px-2">
              {currentEntry.payment_confirmed ? "Paid" : "Pending"}
            </Badge>
            {currentEntry.current_rank && (
              <Badge variant="outline" className="text-xs py-0.5 px-2">#{currentEntry.current_rank}</Badge>
            )}
            <div className="bg-primary/10 rounded px-3 py-1 text-center">
              <div className="text-lg font-bold text-primary">{totalPoints}</div>
              <div className="text-xs text-muted-foreground">pts</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};