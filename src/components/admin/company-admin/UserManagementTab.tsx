import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Search, 
  Mail,
  Users, 
  UserCheck,
  CheckCircle,
  XCircle,
  Globe,
  Calendar,
  TrendingUp,
  Shield,
  Trash2,
  Clock,
  Award
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { UserDeleteConfirmation } from './UserDeleteConfirmation';

interface EnhancedUserData {
  id: string;
  user_id: string;
  display_name: string | null;
  registration_date: string;
  email: string | null;
  email_source: 'google_oauth' | 'manual_signup' | 'email_list' | 'unknown';
  email_verified: boolean;
  terms_accepted: boolean;
  terms_accepted_at: string | null;
  terms_version: string | null;
  email_opt_in: boolean;
  email_subscription_status: string | null;
  account_age_days: number;
  profile_completion: number;
  last_login: string | null;
  pool_memberships: Array<{
    pool_name: string;
    role: string;
    joined_at: string;
  }>;
}

interface EnhancedStats {
  total_registrations: number;
  terms_accepted_count: number;
  email_opted_in_count: number;
  active_pool_members: number;
  email_subscribers: number;
  google_oauth_users: number;
  manual_signup_users: number;
  verified_emails: number;
}

interface UserManagementTabProps {
  users: any[];
  stats: any;
  onUsersUpdate: () => void;
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({
  users: initialUsers,
  stats: initialStats,
  onUsersUpdate
}) => {
  const [users, setUsers] = useState<EnhancedUserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<EnhancedUserData[]>([]);
  const [stats, setStats] = useState<EnhancedStats>({
    total_registrations: 0,
    terms_accepted_count: 0,
    email_opted_in_count: 0,
    active_pool_members: 0,
    email_subscribers: 0,
    google_oauth_users: 0,
    manual_signup_users: 0,
    verified_emails: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<EnhancedUserData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadEnhancedUserData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterStatus]);

  const loadEnhancedUserData = async () => {
    try {
      console.log('USER_MANAGEMENT: Loading enhanced user data...');
      
      const { data, error } = await supabase.functions.invoke('company-admin-data', {
        body: { action: 'get_user_data' }
      });

      if (error) {
        console.error('USER_MANAGEMENT: Error loading enhanced data:', error);
        throw error;
      }

      console.log('USER_MANAGEMENT: Enhanced data loaded:', data);
      
      setUsers(data.users || []);
      setStats(data.stats || stats);

    } catch (error: any) {
      console.error('Error loading enhanced user data:', error);
      toast({
        title: "Error",
        description: "Failed to load enhanced user data. Using basic data.",
        variant: "destructive",
      });
      
      // Fallback to basic data if available
      if (initialUsers.length > 0) {
        setUsers(initialUsers);
        setStats(initialStats);
      }
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus) {
      switch (filterStatus) {
        case 'google_oauth':
          filtered = filtered.filter(u => u.email_source === 'google_oauth');
          break;
        case 'manual_signup':
          filtered = filtered.filter(u => u.email_source === 'manual_signup');
          break;
        case 'verified_email':
          filtered = filtered.filter(u => u.email_verified);
          break;
        case 'terms_accepted':
          filtered = filtered.filter(u => u.terms_accepted);
          break;
        case 'email_opted_in':
          filtered = filtered.filter(u => u.email_opt_in);
          break;
        case 'pool_members':
          filtered = filtered.filter(u => u.pool_memberships.length > 0);
          break;
      }
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (user: EnhancedUserData) => {
    setUserToDelete(user);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('company-admin-data', {
        body: { action: 'delete_user', user_id: userToDelete.user_id }
      });

      if (error) throw error;

      toast({
        title: "User Deleted",
        description: `${userToDelete.display_name || 'User'} has been permanently deleted.`,
      });

      // Refresh the user list
      await loadEnhancedUserData();
      setUserToDelete(null);
      
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const exportUsersToCsv = () => {
    const headers = [
      'Display Name', 'Email', 'Email Source', 'Email Verified', 'Registration Date', 
      'Terms Accepted', 'Email Opt-in', 'Pool Memberships', 'Subscription Status',
      'Account Age (Days)', 'Profile Completion', 'Last Login'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        `"${user.display_name || 'Anonymous'}"`,
        `"${user.email || 'No email'}"`,
        `"${user.email_source}"`,
        user.email_verified ? 'Yes' : 'No',
        new Date(user.registration_date).toLocaleDateString(),
        user.terms_accepted ? 'Yes' : 'No',
        user.email_opt_in ? 'Yes' : 'No',
        user.pool_memberships.length,
        `"${user.email_subscription_status || 'None'}"`,
        user.account_age_days,
        `${user.profile_completion}%`,
        user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `user-registrations-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `Exported ${filteredUsers.length} user records to CSV`,
    });
  };

  const getEmailSourceBadge = (source: string, verified: boolean) => {
    switch (source) {
      case 'google_oauth':
        return (
          <div className="flex items-center gap-1">
            <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
              <Globe className="h-3 w-3 mr-1" />
              Google
            </Badge>
            {verified && <CheckCircle className="h-3 w-3 text-green-600" />}
          </div>
        );
      case 'manual_signup':
        return (
          <div className="flex items-center gap-1">
            <Badge variant="outline">Manual</Badge>
            {verified ? (
              <CheckCircle className="h-3 w-3 text-green-600" />
            ) : (
              <XCircle className="h-3 w-3 text-red-500" />
            )}
          </div>
        );
      case 'email_list':
        return <Badge variant="secondary">Email List</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading enhanced user data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">User Management</h3>
        <div className="flex gap-2">
          <Button onClick={loadEnhancedUserData} variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button onClick={exportUsersToCsv} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Enhanced Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.total_registrations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Google OAuth</p>
                <p className="text-2xl font-bold text-green-600">{stats.google_oauth_users}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Verified Emails</p>
                <p className="text-2xl font-bold text-purple-600">{stats.verified_emails}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pool Members</p>
                <p className="text-2xl font-bold text-orange-600">{stats.active_pool_members}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Age (Days)</p>
                <p className="text-2xl font-bold text-cyan-600">
                  {Math.round(users.reduce((sum, u) => sum + u.account_age_days, 0) / users.length) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Completion</p>
                <p className="text-2xl font-bold text-amber-600">
                  {Math.round(users.reduce((sum, u) => sum + u.profile_completion, 0) / users.length) || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'google_oauth' ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(filterStatus === 'google_oauth' ? null : 'google_oauth')}
              >
                Google Users
              </Button>
              <Button
                variant={filterStatus === 'verified_email' ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(filterStatus === 'verified_email' ? null : 'verified_email')}
              >
                Verified Emails
              </Button>
              <Button
                variant={filterStatus === 'pool_members' ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(filterStatus === 'pool_members' ? null : 'pool_members')}
              >
                Pool Members
              </Button>
            </div>

            {(searchTerm || filterStatus) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus(null);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            User Details ({filteredUsers.length} of {users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">User & Actions</th>
                    <th className="text-left py-2 px-4">Email & Source</th>
                    <th className="text-left py-2 px-4">Activity & Status</th>
                    <th className="text-left py-2 px-4">Terms & Opt-in</th>
                    <th className="text-left py-2 px-4">Pool Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{user.display_name || 'Anonymous User'}</p>
                            <p className="text-xs text-muted-foreground">ID: {user.user_id.slice(0, 8)}...</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {user.account_age_days}d old
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {user.profile_completion}% complete
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <div className="space-y-1">
                          <p className="text-sm">{user.email || 'No email'}</p>
                          {getEmailSourceBadge(user.email_source, user.email_verified)}
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {new Date(user.registration_date).toLocaleDateString()}
                          </div>
                          {user.last_login && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              Last: {new Date(user.last_login).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            {user.terms_accepted ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                            <span className="text-xs">Terms</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {user.email_opt_in ? (
                              <Mail className="h-3 w-3 text-blue-600" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                            <span className="text-xs">Email Opt-in</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{user.pool_memberships.length} pools</p>
                          {user.pool_memberships.slice(0, 2).map((membership, idx) => (
                            <p key={idx} className="text-xs text-muted-foreground">
                              {membership.pool_name} ({membership.role})
                            </p>
                          ))}
                          {user.pool_memberships.length > 2 && (
                            <p className="text-xs text-muted-foreground">
                              +{user.pool_memberships.length - 2} more...
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <UserDeleteConfirmation
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmDeleteUser}
        user={userToDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};