import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePool } from '@/contexts/PoolContext';
import { RoleBadge } from '@/components/ui/role-badge';
import { 
  UserCheck, 
  UserPlus, 
  UserMinus, 
  Crown, 
  Shield, 
  User,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface PoolMember {
  id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  participant_name?: string;
  display_name?: string;
  team_count: number;
}

export const RoleManagementPanel: React.FC = () => {
  const { activePool, canManageRoles, refreshPools } = usePool();
  const { toast } = useToast();
  const [members, setMembers] = useState<PoolMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (activePool?.id) {
      loadPoolMembers();
    }
  }, [activePool?.id]);

  const loadPoolMembers = async () => {
    if (!activePool?.id) return;

    try {
      setLoading(true);
      
      // Get pool memberships
      const { data: memberships, error: membershipsError } = await supabase
        .from('pool_memberships')
        .select('id, user_id, role, joined_at')
        .eq('pool_id', activePool.id)
        .eq('active', true)
        .order('role')
        .order('joined_at');

      if (membershipsError) throw membershipsError;

      // Get profiles for display names
      const userIds = (memberships || []).map(m => m.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);

      if (profilesError) console.warn('Could not load profiles:', profilesError);

      // Get pool entries to find participant names and count teams per user
      const { data: entries, error: entriesError } = await supabase
        .from('pool_entries')
        .select('user_id, participant_name')
        .eq('pool_id', activePool.id);

      if (entriesError) throw entriesError;

      // Combine data
      const membersWithDetails = (memberships || []).map(membership => {
        const userEntries = (entries || []).filter(entry => entry.user_id === membership.user_id);
        const userProfile = (profiles || []).find(p => p.user_id === membership.user_id);
        return {
          id: membership.id,
          user_id: membership.user_id,
          role: membership.role as 'owner' | 'admin' | 'member',
          joined_at: membership.joined_at,
          display_name: userProfile?.display_name,
          participant_name: userEntries[0]?.participant_name,
          team_count: userEntries.length
        };
      });

      setMembers(membersWithDetails);
    } catch (error) {
      console.error('Error loading pool members:', error);
      toast({
        title: "Error",
        description: "Failed to load pool members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMemberRole = async (memberId: string, newRole: 'admin' | 'member') => {
    if (!activePool?.id) return;

    setUpdating(memberId);
    try {
      const { error } = await supabase
        .from('pool_memberships')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Role Updated",
        description: `Member has been ${newRole === 'admin' ? 'promoted to admin' : 'demoted to member'}`,
      });

      // Refresh both local data and pool context
      await loadPoolMembers();
      await refreshPools();
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  if (!canManageRoles()) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Only pool owners can manage user roles.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return <div className="text-center py-8">Loading pool members...</div>;
  }

  const ownerCount = members.filter(m => m.role === 'owner').length;
  const adminCount = members.filter(m => m.role === 'admin').length;
  const memberCount = members.filter(m => m.role === 'member').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              Role Management
            </CardTitle>
            <CardDescription>
              Manage user roles and permissions within your pool
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadPoolMembers}
            className="ml-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        {/* Role Summary */}
        <div className="flex gap-4 pt-2">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">{ownerCount} Owner</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-500" />
            <span className="text-sm">{adminCount} Admin{adminCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{memberCount} Member{memberCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Role Explanations */}
        <Alert>
          <UserCheck className="h-4 w-4" />
          <AlertDescription>
            <strong>Owner:</strong> Full control including financial settings and role management<br/>
            <strong>Admin:</strong> Can manage weekly events, bonus questions, and reveal settings<br/>
            <strong>Member:</strong> Can participate in the pool only
          </AlertDescription>
        </Alert>

        {/* Members List */}
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium">
                      {member.display_name || member.participant_name || 'Unknown User'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {member.team_count > 0 ? 
                        `${member.team_count} team${member.team_count > 1 ? 's' : ''}` : 
                        'No teams yet'
                      }
                      {' • '}
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RoleBadge role={member.role} />
                  
                  {member.role !== 'owner' && (
                    <div className="flex gap-2">
                      {member.role === 'member' ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updating === member.id}
                            >
                              <UserPlus className="h-3 w-3 mr-1" />
                              Promote to Admin
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Promote to Admin</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will give <strong>{member.display_name || member.participant_name}</strong> admin 
                                privileges including the ability to manage weekly events, bonus questions, and reveal settings.
                                They will NOT have access to financial information or role management.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => updateMemberRole(member.id, 'admin')}>
                                Promote to Admin
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updating === member.id}
                            >
                              <UserMinus className="h-3 w-3 mr-1" />
                              Demote to Member
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Demote to Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove <strong>{member.display_name || member.participant_name}</strong>'s admin 
                                privileges. They will no longer be able to manage weekly events, bonus questions, or 
                                access the admin panel.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => updateMemberRole(member.id, 'member')}>
                                Demote to Member
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {members.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No pool members found
          </div>
        )}
      </CardContent>
    </Card>
  );
};