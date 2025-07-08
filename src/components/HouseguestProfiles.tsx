import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Users, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PoolEntry } from '@/types/pool';
import { useHouseguestPoints } from '@/hooks/useHouseguestPoints';
import { useEvictedContestants } from '@/hooks/useEvictedContestants';
import { useUserPaymentUpdate } from '@/hooks/useUserPaymentUpdate';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useActivePool } from '@/hooks/useActivePool';

interface UserTeamsProps {
  userId?: string;
}

export const HouseguestProfiles: React.FC<UserTeamsProps> = ({ userId }) => {
  const [userEntries, setUserEntries] = useState<PoolEntry[]>([]);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [draftLocked, setDraftLocked] = useState(true);
  const activePool = useActivePool();
  const { houseguestPoints } = useHouseguestPoints();
  const { evictedContestants } = useEvictedContestants();
  const { updatePaymentStatus, updating } = useUserPaymentUpdate();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (activePool) {
      loadUserEntries();
      loadDraftSettings();
    }
  }, [userId, activePool]);

  const loadUserEntries = async () => {
    if (!activePool) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      let query = supabase
        .from('pool_entries')
        .select('*')
        .eq('pool_id', activePool.id); // Filter by active pool
      
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

  const loadDraftSettings = async () => {
    if (!activePool) return;
    
    try {
      // Use the activePool's draft_locked status directly
      setDraftLocked(activePool.draft_locked ?? true);
    } catch (error) {
      console.error('Error loading draft settings:', error);
    }
  };

  const handlePaymentToggle = async (entryId: string, currentStatus: boolean) => {
    const success = await updatePaymentStatus(entryId, !currentStatus);
    if (success) {
      // Update local state
      setUserEntries(prev => prev.map(entry => 
        entry.id === entryId ? { ...entry, payment_confirmed: !currentStatus } : entry
      ));
    }
  };

  const handleEditTeam = (entry: PoolEntry) => {
    try {
      console.log('🔍 EditTeam - Attempting to edit entry:', entry.id);
      
      if (draftLocked) {
        toast({
          title: "Draft Locked",
          description: "Draft editing is currently locked. Contact the admin to unlock editing.",
          variant: "destructive",
        });
        return;
      }
      
      if (!entry || !entry.id) {
        console.error('❌ EditTeam - Invalid entry data:', entry);
        toast({
          title: "Error",
          description: "Invalid team data. Please refresh and try again.",
          variant: "destructive",
        });
        return;
      }

      // Validate entry data before storing
      const validatedEntry = {
        id: entry.id,
        team_name: entry.team_name || '',
        participant_name: entry.participant_name || '',
        user_id: entry.user_id,
        pool_id: entry.pool_id,
        player_1: entry.player_1 || '',
        player_2: entry.player_2 || '',
        player_3: entry.player_3 || '',
        player_4: entry.player_4 || '',
        player_5: entry.player_5 || '',
        bonus_answers: entry.bonus_answers || {},
        weekly_points: entry.weekly_points || 0,
        bonus_points: entry.bonus_points || 0,
        total_points: entry.total_points || 0,
        current_rank: entry.current_rank || null,
        payment_confirmed: entry.payment_confirmed || false,
        created_at: entry.created_at,
        updated_at: entry.updated_at
      };
      
      console.log('✅ EditTeam - Storing validated entry data');
      
      // Store the validated entry data for editing
      localStorage.setItem('edit_entry_data', JSON.stringify(validatedEntry));
      navigate('/draft?edit=true');
    } catch (error) {
      console.error('❌ EditTeam - Error navigating to edit team:', error);
      toast({
        title: "Error",
        description: "Failed to open team editor. Please try refreshing the page.",
        variant: "destructive",
      });
    }
  };

  const renderPlayerName = (playerName: string) => {
    const isEliminated = evictedContestants.includes(playerName);
    const points = houseguestPoints[playerName] || 0;
    
    return (
      <div className={`flex flex-col items-center transition-colors ${isEliminated ? 'opacity-60' : ''}`}>
        <span className={`font-medium text-xs mb-1 ${isEliminated ? 'text-red-500 line-through' : 'text-foreground'}`} title={playerName}>
          {playerName.split(' ')[0]}
        </span>
        <div className={`rounded-full px-2 py-0.5 ${isEliminated ? 'bg-red-100' : 'bg-primary/10'}`}>
          <span className={`text-xs font-semibold ${isEliminated ? 'text-red-700' : 'text-primary'}`}>
            {points}
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-2 text-sm text-muted-foreground">Loading team...</div>;
  }

  if (userEntries.length === 0) {
    return (
      <div className="bg-muted/30 border rounded-lg p-3 text-center">
        <Users className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium mb-1">No Teams Found</p>
        <p className="text-xs text-muted-foreground">You haven't created any teams yet.</p>
      </div>
    );
  }

  const currentEntry = userEntries[currentEntryIndex];
  const picksPerTeam = activePool?.picks_per_team || 5;
  
  // Build player array dynamically based on pool settings
  const players = Array.from({ length: picksPerTeam }, (_, i) => 
    currentEntry[`player_${i + 1}` as keyof PoolEntry] as string
  ).filter(Boolean);
  
  const totalPoints = players.reduce((sum, player) => sum + (houseguestPoints[player] || 0), 0);

  const nextEntry = () => {
    setCurrentEntryIndex((prev) => (prev + 1) % userEntries.length);
  };

  const prevEntry = () => {
    setCurrentEntryIndex((prev) => (prev - 1 + userEntries.length) % userEntries.length);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Sleek Team Banner */}
      <div className="bg-gradient-to-r from-primary/5 via-background to-primary/5 border rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Left: Team Info & Navigation */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{currentEntry.team_name}</h3>
                <p className="text-xs text-muted-foreground">{currentEntry.participant_name}</p>
              </div>
            </div>
            
            {/* Team Navigation */}
            {userEntries.length > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevEntry}
                  className="h-6 w-6 p-0"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <span className="text-xs text-muted-foreground px-2">
                  {currentEntryIndex + 1}/{userEntries.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextEntry}
                  className="h-6 w-6 p-0"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          
          {/* Center: Compact Player Cards */}
          <div className="flex items-center gap-1">
            {players.map((player, index) => (
              <div key={index} className="bg-background/50 rounded-lg px-2 py-1 border">
                {renderPlayerName(player)}
              </div>
            ))}
          </div>
          
          {/* Right: Status & Actions */}
          <div className="flex items-center gap-3">
            {/* Edit Team Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditTeam(currentEntry)}
              className="h-8 px-3 text-xs"
              disabled={draftLocked}
            >
              {draftLocked ? "Locked" : "Edit Team"}
            </Button>
            
            {/* Payment Toggle - only show if pool has buy-in */}
            {activePool?.has_buy_in && (
              <Button
                variant={currentEntry.payment_confirmed ? "default" : "outline"}
                size="sm"
                onClick={() => handlePaymentToggle(currentEntry.id, currentEntry.payment_confirmed)}
                disabled={updating}
                className="h-8 px-3 text-xs"
              >
                <CreditCard className="h-3 w-3 mr-1" />
                {updating ? "..." : currentEntry.payment_confirmed ? "Paid" : "Pay"}
              </Button>
            )}
            
            {/* Score Display */}
            <div className="bg-primary/10 rounded-lg px-3 py-1 border">
              <div className="text-lg font-bold text-primary">
                {totalPoints}
              </div>
              <div className="text-xs text-muted-foreground text-center">
                pts
              </div>
            </div>
            
            {/* Rank Badge */}
            {currentEntry.current_rank && (
              <Badge variant="outline" className="text-xs">
                #{currentEntry.current_rank}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};