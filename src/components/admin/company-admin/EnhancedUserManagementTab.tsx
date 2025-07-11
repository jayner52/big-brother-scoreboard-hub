import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  TrendingUp,
  Users, 
  Globe,
  CheckCircle,
  Shield,
  Clock,
  Award,
  MessageSquare,
  Trophy
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { UserDeleteConfirmation } from './UserDeleteConfirmation';
import { EnhancedUserFilters } from './EnhancedUserFilters';
import { BulkActionToolbar } from './BulkActionToolbar';
import { EnhancedUserTable } from './EnhancedUserTable';

interface EnhancedUserData {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url?: string | null;
  background_color?: string | null;
  registration_date: string;
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
  chat_messages_count?: number;
  pool_memberships: Array<{
    pool_name: string;
    role: string;
    joined_at: string;
  }>;
  total_points?: number;
  pools_owned?: number;
  feedback_count?: number;
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
  total_chat_messages: number;
  total_pool_entries: number;
  total_feedback_items: number;
}

interface FilterOptions {
  searchTerm: string;
  emailSource: string | null;
  accountAge: string | null;
  profileCompletion: string | null;
  activityLevel: string | null;
  registrationDateRange: { from: Date | undefined; to: Date | undefined };
}

interface UserManagementTabProps {
  users: any[];
  stats: any;
  onUsersUpdate: () => void;
}

export const EnhancedUserManagementTab: React.FC<UserManagementTabProps> = ({
  users: initialUsers,
  stats: initialStats,
  onUsersUpdate
}) => {
  const [users, setUsers] = useState<EnhancedUserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<EnhancedUserData[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [stats, setStats] = useState<EnhancedStats>({
    total_registrations: 0,
    terms_accepted_count: 0,
    email_opted_in_count: 0,
    active_pool_members: 0,
    email_subscribers: 0,
    google_oauth_users: 0,
    manual_signup_users: 0,
    verified_emails: 0,
    total_chat_messages: 0,
    total_pool_entries: 0,
    total_feedback_items: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    emailSource: null,
    accountAge: null,
    profileCompletion: null,
    activityLevel: null,
    registrationDateRange: { from: undefined, to: undefined }
  });
  const [userToDelete, setUserToDelete] = useState<EnhancedUserData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadEnhancedUserData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, filters]);

  const loadEnhancedUserData = async () => {
    try {
      console.log('ENHANCED_USER_MANAGEMENT: Loading enhanced user data...');
      
      const { data, error } = await supabase.functions.invoke('company-admin-data', {
        body: { action: 'get_enhanced_user_data' }
      });

      if (error) {
        console.error('ENHANCED_USER_MANAGEMENT: Error loading enhanced data:', error);
        throw error;
      }

      console.log('ENHANCED_USER_MANAGEMENT: Enhanced data loaded:', data);
      
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

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.display_name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.user_id.toLowerCase().includes(searchLower)
      );
    }

    // Email source filter
    if (filters.emailSource) {
      filtered = filtered.filter(u => u.email_source === filters.emailSource);
    }

    // Account age filter
    if (filters.accountAge) {
      switch (filters.accountAge) {
        case 'new':
          filtered = filtered.filter(u => u.account_age_days <= 7);
          break;
        case 'recent':
          filtered = filtered.filter(u => u.account_age_days > 7 && u.account_age_days <= 30);
          break;
        case 'established':
          filtered = filtered.filter(u => u.account_age_days > 30 && u.account_age_days <= 90);
          break;
        case 'veteran':
          filtered = filtered.filter(u => u.account_age_days > 90);
          break;
      }
    }

    // Profile completion filter
    if (filters.profileCompletion) {
      switch (filters.profileCompletion) {
        case 'low':
          filtered = filtered.filter(u => u.profile_completion <= 25);
          break;
        case 'medium':
          filtered = filtered.filter(u => u.profile_completion > 25 && u.profile_completion <= 75);
          break;
        case 'high':
          filtered = filtered.filter(u => u.profile_completion > 75);
          break;
      }
    }

    // Activity level filter
    if (filters.activityLevel) {
      switch (filters.activityLevel) {
        case 'pool_members':
          filtered = filtered.filter(u => u.pool_memberships.length > 0);
          break;
        case 'high_profile':
          filtered = filtered.filter(u => u.profile_completion > 75);
          break;
        case 'email_opted_in':
          filtered = filtered.filter(u => u.email_opt_in);
          break;
        case 'terms_accepted':
          filtered = filtered.filter(u => u.terms_accepted);
          break;
      }
    }

    // Date range filter
    if (filters.registrationDateRange.from || filters.registrationDateRange.to) {
      filtered = filtered.filter(user => {
        const regDate = new Date(user.registration_date);
        const fromDate = filters.registrationDateRange.from;
        const toDate = filters.registrationDateRange.to;
        
        if (fromDate && regDate < fromDate) return false;
        if (toDate && regDate > toDate) return false;
        return true;
      });
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

  const handleBulkDelete = async (userIds: string[]) => {
    try {
      for (const userId of userIds) {
        const { error } = await supabase.functions.invoke('company-admin-data', {
          body: { action: 'delete_user', user_id: userId }
        });
        if (error) throw error;
      }
      
      // Refresh the user list
      await loadEnhancedUserData();
    } catch (error) {
      throw error;
    }
  };

  const exportUsersToCsv = (usersToExport: EnhancedUserData[] = filteredUsers) => {
    const headers = [
      'Display Name', 'Email', 'Email Source', 'Email Verified', 'Registration Date', 
      'Terms Accepted', 'Email Opt-in', 'Pool Memberships', 'Subscription Status',
      'Account Age (Days)', 'Profile Completion', 'Last Login', 'Chat Messages',
      'Total Points', 'Pools Owned', 'Feedback Count'
    ];
    
    const csvContent = [
      headers.join(','),
      ...usersToExport.map(user => [
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
        user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never',
        user.chat_messages_count || 0,
        user.total_points || 0,
        user.pools_owned || 0,
        user.feedback_count || 0
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
      description: `Exported ${usersToExport.length} user records to CSV`,
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading enhanced user data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Enhanced User Management</h3>
        <div className="flex gap-2">
          <Button onClick={loadEnhancedUserData} variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button onClick={() => exportUsersToCsv()} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Enhanced Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
                <p className="text-sm text-muted-foreground">Verified</p>
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
              <MessageSquare className="h-5 w-5 text-cyan-600" />
              <div>
                <p className="text-sm text-muted-foreground">Chat Messages</p>
                <p className="text-2xl font-bold text-cyan-600">{stats.total_chat_messages || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pool Entries</p>
                <p className="text-2xl font-bold text-amber-600">{stats.total_pool_entries || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <EnhancedUserFilters
        filters={filters}
        onFiltersChange={setFilters}
        totalUsers={users.length}
        filteredUsers={filteredUsers.length}
      />

      {/* Bulk Action Toolbar */}
      <BulkActionToolbar
        selectedUserIds={selectedUserIds}
        selectedUsers={filteredUsers.filter(user => selectedUserIds.includes(user.user_id))}
        onBulkDelete={handleBulkDelete}
        onBulkExport={exportUsersToCsv}
        onClearSelection={() => setSelectedUserIds([])}
      />

      {/* Enhanced Users Table */}
      <EnhancedUserTable
        users={filteredUsers}
        selectedUserIds={selectedUserIds}
        onSelectionChange={setSelectedUserIds}
        onDeleteUser={handleDeleteUser}
      />

      {/* Delete Confirmation Dialog */}
      {userToDelete && (
        <UserDeleteConfirmation
          user={userToDelete}
          isOpen={!!userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={confirmDeleteUser}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};