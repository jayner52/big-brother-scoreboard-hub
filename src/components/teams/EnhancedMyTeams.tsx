import React, { useState, useEffect } from 'react';
import { Users, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PoolEntry, Pool } from '@/types/pool';
import { useHouseguestPoints } from '@/hooks/useHouseguestPoints';
import { useEvictionData } from '@/hooks/useEvictionData';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useActivePool } from '@/hooks/useActivePool';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { Skeleton } from '@/components/ui/loading-skeleton';
import { PoolSelector } from './PoolSelector';
import { TeamCarousel } from './TeamCarousel';
import { TeamDeleteDialog } from './TeamDeleteDialog';

interface EnhancedMyTeamsProps {
  userId?: string;
}

export const EnhancedMyTeams: React.FC<EnhancedMyTeamsProps> = ({ userId }) => {
  const [userEntries, setUserEntries] = useState<PoolEntry[]>([]);
  const [userPools, setUserPools] = useState<Pool[]>([]);
  const [selectedPoolId, setSelectedPoolId] = useState<string>('');
  const [teamCounts, setTeamCounts] = useState<Record<string, number>>({});
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; team: PoolEntry | null }>({
    isOpen: false,
    team: null
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const activePool = useActivePool();
  const { houseguestPoints } = useHouseguestPoints();
  const { isEvicted } = useEvictionData();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadUserTeamsAndPools();
  }, [userId]);

  // Set selected pool to active pool when available
  useEffect(() => {
    if (activePool && !selectedPoolId) {
      setSelectedPoolId(activePool.id);
    }
  }, [activePool, selectedPoolId]);

  const loadUserTeamsAndPools = async () => {
    try {
      setLoading(true);
      
      // Load all user's pool memberships and pools
      let membershipQuery = supabase
        .from('pool_memberships')
        .select(`
          pool_id,
          pools (
            id,
            name,
            draft_locked,
            has_buy_in,
            picks_per_team
          )
        `)
        .eq('active', true);
      
      if (userId) {
        membershipQuery = membershipQuery.eq('user_id', userId);
      }
      
      const { data: memberships, error: membershipError } = await membershipQuery;
      if (membershipError) throw membershipError;

      const pools = memberships?.map(m => m.pools).filter(Boolean) as Pool[] || [];
      setUserPools(pools);

      // Load all entries for the user across all pools (excluding deleted ones)
      let entriesQuery = supabase
        .from('pool_entries')
        .select('*')
        .is('deleted_at', null) // Only non-deleted entries
        .in('pool_id', pools.map(p => p.id));
      
      if (userId) {
        entriesQuery = entriesQuery.eq('user_id', userId);
      }
      
      const { data: entries, error: entriesError } = await entriesQuery.order('created_at', { ascending: false });
      if (entriesError) throw entriesError;

      const mappedEntries = entries?.map(entry => ({
        ...entry,
        bonus_answers: entry.bonus_answers as Record<string, any>,
        created_at: new Date(entry.created_at),
        updated_at: new Date(entry.updated_at)
      })) || [];

      setUserEntries(mappedEntries);

      // Calculate team counts per pool
      const counts: Record<string, number> = {};
      pools.forEach(pool => {
        counts[pool.id] = mappedEntries.filter(entry => entry.pool_id === pool.id).length;
      });
      setTeamCounts(counts);

      // Set initial selected pool to active pool or first pool with teams
      if (activePool && pools.find(p => p.id === activePool.id)) {
        setSelectedPoolId(activePool.id);
      } else if (pools.length > 0) {
        const poolWithTeams = pools.find(pool => counts[pool.id] > 0);
        setSelectedPoolId(poolWithTeams?.id || pools[0].id);
      }
    } catch (error) {
      console.error('Error loading user teams and pools:', error);
      toast({
        title: "Error",
        description: "Failed to load your teams. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditTeam = (entry: PoolEntry) => {
    const pool = userPools.find(p => p.id === entry.pool_id);
    
    if (pool?.draft_locked) {
      toast({
        title: "Draft Locked",
        description: "Draft editing is currently locked. Contact the admin to unlock editing.",
        variant: "destructive",
      });
      return;
    }
    
    // Store the validated entry data for editing
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
    
    localStorage.setItem('edit_entry_data', JSON.stringify(validatedEntry));
    navigate('/draft?edit=true');
  };

  const handleDeleteTeam = (entry: PoolEntry) => {
    setDeleteDialog({ isOpen: true, team: entry });
  };

  const confirmDeleteTeam = async () => {
    if (!deleteDialog.team) return;
    
    try {
      setIsDeleting(true);
      
      // Soft delete the team
      const { error } = await supabase
        .from('pool_entries')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by_user: true
        })
        .eq('id', deleteDialog.team.id);

      if (error) throw error;

      // Remove from local state
      setUserEntries(prev => prev.filter(entry => entry.id !== deleteDialog.team!.id));
      
      // Update team counts
      setTeamCounts(prev => ({
        ...prev,
        [deleteDialog.team!.pool_id]: Math.max(0, (prev[deleteDialog.team!.pool_id] || 0) - 1)
      }));

      toast({
        title: "Team Deleted",
        description: "Your team has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: "Error",
        description: "Failed to delete team. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ isOpen: false, team: null });
    }
  };

  const refreshTeams = async () => {
    await loadUserTeamsAndPools();
  };

  const { containerRef, isRefreshing, pullDistance, isPulling } = usePullToRefresh({
    onRefresh: refreshTeams,
    enabled: !loading,
    threshold: 80
  });

  const selectedPoolEntries = userEntries.filter(entry => entry.pool_id === selectedPoolId);
  const selectedPool = userPools.find(p => p.id === selectedPoolId);

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex-shrink-0 w-80 space-y-4">
              <div className="bg-card rounded-lg border p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-20 rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (userPools.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-muted/30 border rounded-lg p-6 text-center">
          <Users className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">No Pools Found</p>
          <p className="text-sm text-muted-foreground">You haven't joined any pools yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full max-w-6xl mx-auto space-y-6 relative"
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

      {/* Pool Selector */}
      <PoolSelector
        pools={userPools}
        selectedPoolId={selectedPoolId}
        onPoolSelect={setSelectedPoolId}
        teamCounts={teamCounts}
      />

      {/* Teams Display */}
      {selectedPoolEntries.length === 0 ? (
        <div className="bg-muted/30 border rounded-lg p-6 text-center">
          <Users className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">No Teams in This Pool</p>
          <p className="text-sm text-muted-foreground">You haven't created any teams in this pool yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {selectedPool?.name} ({selectedPoolEntries.length} team{selectedPoolEntries.length !== 1 ? 's' : ''})
            </h3>
          </div>
          
          <TeamCarousel
            entries={selectedPoolEntries}
            isEvicted={isEvicted}
            houseguestPoints={houseguestPoints}
            onEditTeam={handleEditTeam}
            onDeleteTeam={handleDeleteTeam}
            draftLocked={selectedPool?.draft_locked || false}
            hasBuyIn={selectedPool?.has_buy_in || false}
            updating={false}
            picksPerTeam={selectedPool?.picks_per_team || 5}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <TeamDeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, team: null })}
        onConfirm={confirmDeleteTeam}
        team={deleteDialog.team}
        isDeleting={isDeleting}
      />
    </div>
  );
};