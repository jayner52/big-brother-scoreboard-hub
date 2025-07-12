import React, { useState, useEffect } from 'react';
import { Users, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PoolEntry } from '@/types/pool';
import { useHouseguestPoints } from '@/hooks/useHouseguestPoints';
import { useEvictionData } from '@/hooks/useEvictionData';
import { useUserPaymentUpdate } from '@/hooks/useUserPaymentUpdate';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useActivePool } from '@/hooks/useActivePool';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { Skeleton } from '@/components/ui/skeleton';
import { MobileTeamCard } from '@/components/mobile/MobileTeamCard';
import { MobileTeamNavigation } from '@/components/mobile/MobileTeamNavigation';

interface UserTeamsProps {
  userId?: string;
}

export const HouseguestProfiles: React.FC<UserTeamsProps> = ({ userId }) => {
  const [userEntries, setUserEntries] = useState<PoolEntry[]>([]);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [draftLocked, setDraftLocked] = useState(true);
  const [contestants, setContestants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const activePool = useActivePool();
  const { houseguestPoints } = useHouseguestPoints();
  const { isEvicted } = useEvictionData();
  const { updatePaymentStatus, updating } = useUserPaymentUpdate();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (activePool) {
      loadUserEntries();
      loadDraftSettings();
      loadContestants();
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
        .eq('pool_id', activePool.id) // Filter by active pool
        .is('deleted_at', null); // Exclude soft-deleted teams
      
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

  const loadContestants = async () => {
    if (!activePool?.id) return;
    
    try {
      const { data } = await supabase
        .from('contestants')
        .select('name')
        .eq('pool_id', activePool.id);
      
      setContestants(data || []);
    } catch (error) {
      console.error('Error loading contestants:', error);
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

  const refreshTeams = async () => {
    await Promise.all([
      loadUserEntries(),
      loadDraftSettings(),
      loadContestants()
    ]);
  };

  const { containerRef, isRefreshing, pullDistance, isPulling } = usePullToRefresh({
    onRefresh: refreshTeams,
    enabled: !loading,
    threshold: 80
  });

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card rounded-lg border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-12 w-16 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-20 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (userEntries.length === 0) {
    return (
      <div 
        ref={containerRef}
        className="w-full max-w-4xl mx-auto"
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        <div className="bg-muted/30 border rounded-lg p-6 text-center">
          <Users className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">No Teams Found</p>
          <p className="text-sm text-muted-foreground">You haven't created any teams yet.</p>
        </div>
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

  return (
    <div 
      ref={containerRef}
      className="w-full max-w-4xl mx-auto space-y-4 relative"
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: isPulling ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {/* Pull to Refresh Indicator */}
      {(isPulling || isRefreshing) && (
        <div className="flex items-center justify-center py-4">
          <div className={`flex items-center gap-2 text-sm ${
            isRefreshing ? 'text-primary' : 'text-muted-foreground'
          }`}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
          </div>
        </div>
      )}

      {/* Mobile Team Navigation */}
      <MobileTeamNavigation
        userEntries={userEntries}
        currentEntryIndex={currentEntryIndex}
        setCurrentEntryIndex={setCurrentEntryIndex}
        houseguestPoints={houseguestPoints}
        picksPerTeam={picksPerTeam}
      />

      {/* Mobile Team Card */}
      <MobileTeamCard
        entry={currentEntry}
        players={players}
        totalPoints={totalPoints}
        isEvicted={isEvicted}
        houseguestPoints={houseguestPoints}
        onEditTeam={handleEditTeam}
        onTogglePayment={handlePaymentToggle}
        draftLocked={draftLocked}
        hasBuyIn={activePool?.has_buy_in || false}
        updating={updating}
      />
    </div>
  );
};