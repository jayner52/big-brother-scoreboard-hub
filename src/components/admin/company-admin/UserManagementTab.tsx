import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Copy, 
  Users, 
  UserCheck, 
  UserX, 
  Search, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Crown, 
  Trash2,
  UserMinus,
  AlertTriangle
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface UserRegistration {
  id: string;
  user_id: string;
  display_name: string | null;
  registration_date: string;
  email: string | null;
  terms_accepted: boolean;
  terms_accepted_at: string | null;
  terms_version: string | null;
  email_opt_in: boolean;
  email_subscription_status: string | null;
  pool_memberships: Array<{
    pool_name: string;
    role: string;
    joined_at: string;
  }>;
}

interface DashboardStats {
  total_registrations: number;
  terms_accepted_count: number;
  email_opted_in_count: number;
  active_pool_members: number;
  email_subscribers: number;
}

interface UserManagementTabProps {
  users: UserRegistration[];
  stats: DashboardStats;
  onUsersUpdate: () => void;
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({ 
  users, 
  stats, 
  onUsersUpdate 
}) => {
  const [filteredUsers, setFilteredUsers] = useState<UserRegistration[]>(users);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTermsAccepted, setFilterTermsAccepted] = useState<boolean | null>(null);
  const [filterEmailOptIn, setFilterEmailOptIn] = useState<boolean | null>(null);
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterTermsAccepted, filterEmailOptIn, filterRole]);

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user_id.includes(searchTerm)
      );
    }

    if (filterTermsAccepted !== null) {
      filtered = filtered.filter(user => user.terms_accepted === filterTermsAccepted);
    }

    if (filterEmailOptIn !== null) {
      filtered = filtered.filter(user => user.email_opt_in === filterEmailOptIn);
    }

    if (filterRole !== null) {
      if (filterRole === 'no_pools') {
        filtered = filtered.filter(user => user.pool_memberships.length === 0);
      } else {
        filtered = filtered.filter(user => 
          user.pool_memberships.some(m => m.role === filterRole)
        );
      }
    }

    setFilteredUsers(filtered);
  };

  const deleteUser = async (userId: string) => {
    setDeletingUser(userId);
    try {
      console.log('COMPANY_ADMIN: Deleting user:', userId);
      
      // Delete in order: pool_entries -> pool_memberships -> user_preferences -> email_list -> profiles
      // This avoids foreign key constraint issues
      
      const { error: entriesError } = await supabase
        .from('pool_entries')
        .delete()
        .eq('user_id', userId);
      
      if (entriesError) {
        console.warn('Error deleting pool entries:', entriesError);
      }

      const { error: membershipsError } = await supabase
        .from('pool_memberships')
        .delete()
        .eq('user_id', userId);
      
      if (membershipsError) {
        console.warn('Error deleting pool memberships:', membershipsError);
      }

      const { error: preferencesError } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', userId);
      
      if (preferencesError) {
        console.warn('Error deleting user preferences:', preferencesError);
      }

      const { error: emailError } = await supabase
        .from('email_list')
        .delete()
        .eq('user_id', userId);
      
      if (emailError) {
        console.warn('Error deleting email list:', emailError);
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);
      
      if (profileError) {
        throw profileError;
      }

      toast({
        title: "User Deleted",
        description: "User and all associated data have been removed successfully.",
      });

      onUsersUpdate();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingUser(null);
    }
  };

  const deleteTestAccounts = async () => {
    try {
      // Delete users with "test" in their name or email
      const testUsers = users.filter(user => 
        user.display_name.toLowerCase().includes('test') ||
        user.email?.toLowerCase().includes('test')
      );

      for (const user of testUsers) {
        await deleteUser(user.user_id);
      }

      toast({
        title: "Test Accounts Deleted",
        description: `Deleted ${testUsers.length} test accounts successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete test accounts.",
        variant: "destructive",
      });
    }
  };

  const exportToCsv = () => {
    const headers = [
      'Display Name', 'User ID', 'Registration Date', 'Email', 
      'Terms Accepted', 'Terms Date', 'Terms Version', 'Email Opt-in', 
      'Email Subscription', 'Pool Memberships', 'Roles'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        `"${user.display_name}"`,
        user.user_id,
        new Date(user.registration_date).toLocaleDateString(),
        user.email || '',
        user.terms_accepted ? 'Yes' : 'No',
        user.terms_accepted_at ? new Date(user.terms_accepted_at).toLocaleDateString() : '',
        user.terms_version || '',
        user.email_opt_in ? 'Yes' : 'No',
        user.email_subscription_status || '',
        `"${user.pool_memberships.map(m => `${m.pool_name} (${m.role})`).join('; ')}"`,
        `"${user.pool_memberships.map(m => m.role).join(', ')}"`
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
      description: `Exported ${filteredUsers.length} user registrations to CSV`,
    });
  };

  const copyAllEmails = () => {
    const emails = filteredUsers.filter(u => u.email).map(u => u.email).join(', ');
    navigator.clipboard.writeText(emails);
    
    toast({
      title: "Emails Copied",
      description: `Copied ${filteredUsers.filter(u => u.email).length} email addresses to clipboard`,
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default';
      case 'admin': return 'secondary';
      case 'member': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-3 w-3" />;
      case 'admin': return <UserCheck className="h-3 w-3" />;
      case 'member': return <Users className="h-3 w-3" />;
      default: return <Users className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">User Management</h3>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <UserMinus className="h-4 w-4 mr-2" />
                Delete Test Accounts
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Test Accounts</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all users with "test" in their name or email. 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteTestAccounts} className="bg-destructive text-destructive-foreground">
                  Delete Test Accounts
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button onClick={copyAllEmails} variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Copy Emails
          </Button>
          <Button onClick={exportToCsv} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Registrations</p>
                <p className="text-2xl font-bold">{stats.total_registrations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Terms Accepted</p>
                <p className="text-2xl font-bold text-green-600">{stats.terms_accepted_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Email Opt-in</p>
                <p className="text-2xl font-bold text-blue-600">{stats.email_opted_in_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pool Members</p>
                <p className="text-2xl font-bold text-purple-600">{stats.active_pool_members}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Email Subscribers</p>
                <p className="text-2xl font-bold text-green-600">{stats.email_subscribers}</p>
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
                placeholder="Search by name, email, or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex gap-2">
              <Button
                variant={filterTermsAccepted === true ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterTermsAccepted(filterTermsAccepted === true ? null : true)}
              >
                Terms Accepted
              </Button>
              <Button
                variant={filterTermsAccepted === false ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterTermsAccepted(filterTermsAccepted === false ? null : false)}
              >
                Terms Not Accepted
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex gap-2">
              <Button
                variant={filterEmailOptIn === true ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterEmailOptIn(filterEmailOptIn === true ? null : true)}
              >
                Email Opt-in
              </Button>
              <Button
                variant={filterEmailOptIn === false ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterEmailOptIn(filterEmailOptIn === false ? null : false)}
              >
                No Email Opt-in
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex gap-2">
              <Button
                variant={filterRole === 'owner' ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRole(filterRole === 'owner' ? null : 'owner')}
              >
                Pool Owners
              </Button>
              <Button
                variant={filterRole === 'admin' ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRole(filterRole === 'admin' ? null : 'admin')}
              >
                Pool Admins
              </Button>
              <Button
                variant={filterRole === 'member' ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRole(filterRole === 'member' ? null : 'member')}
              >
                Members
              </Button>
              <Button
                variant={filterRole === 'no_pools' ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRole(filterRole === 'no_pools' ? null : 'no_pools')}
              >
                No Pools
              </Button>
            </div>

            {(searchTerm || filterTermsAccepted !== null || filterEmailOptIn !== null || filterRole !== null) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setFilterTermsAccepted(null);
                  setFilterEmailOptIn(null);
                  setFilterRole(null);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Registrations ({filteredUsers.length} of {users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No user registrations found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Display Name</th>
                    <th className="text-left py-2 px-4">Registration Date</th>
                    <th className="text-left py-2 px-4">Email</th>
                    <th className="text-left py-2 px-4">Terms & Conditions</th>
                    <th className="text-left py-2 px-4">Email Communications</th>
                    <th className="text-left py-2 px-4">Pool Roles</th>
                    <th className="text-left py-2 px-4">User ID</th>
                    <th className="text-left py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4 font-medium">{user.display_name}</td>
                      <td className="py-2 px-4 text-sm text-muted-foreground">
                        {new Date(user.registration_date).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4 font-mono text-sm">
                        {user.email || (
                          <span className="text-muted-foreground italic">No email</span>
                        )}
                      </td>
                      <td className="py-2 px-4">
                        {user.terms_accepted ? (
                          <div className="flex items-center gap-1">
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Accepted
                            </Badge>
                            {user.terms_accepted_at && (
                              <span className="text-xs text-muted-foreground ml-2">
                                {new Date(user.terms_accepted_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            Not Accepted
                          </Badge>
                        )}
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex flex-col gap-1">
                          <Badge variant={user.email_opt_in ? "default" : "secondary"}>
                            {user.email_opt_in ? "✓ Opted In" : "✗ Not Opted In"}
                          </Badge>
                          {user.email_subscription_status && (
                            <Badge variant={user.email_subscription_status === 'active' ? "default" : "secondary"} className="text-xs">
                              Subscription: {user.email_subscription_status}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        {user.pool_memberships.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.pool_memberships.map((membership, idx) => (
                              <Badge 
                                key={idx} 
                                variant={getRoleBadgeVariant(membership.role)}
                                className="text-xs flex items-center gap-1"
                              >
                                {getRoleIcon(membership.role)}
                                {membership.pool_name} ({membership.role})
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic text-sm">No pools</span>
                        )}
                      </td>
                      <td className="py-2 px-4 font-mono text-xs text-muted-foreground">
                        {user.user_id.substring(0, 8)}...
                      </td>
                      <td className="py-2 px-4">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              disabled={deletingUser === user.user_id}
                            >
                              {deletingUser === user.user_id ? (
                                "Deleting..."
                              ) : (
                                <>
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </>
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                Delete User Account
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete <strong>{user.display_name}</strong>?
                                This will permanently remove:
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                  <li>User profile and preferences</li>
                                  <li>Email subscription data</li>
                                  <li>All pool memberships</li>
                                  <li>All pool entries and teams</li>
                                </ul>
                                <strong className="text-destructive">This action cannot be undone.</strong>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteUser(user.user_id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Delete User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};