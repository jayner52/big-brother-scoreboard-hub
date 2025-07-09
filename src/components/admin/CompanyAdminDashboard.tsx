import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { Download, Copy, Users, UserCheck, UserX, Search, CheckCircle, XCircle, Mail, Crown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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

export const CompanyAdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserRegistration[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserRegistration[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_registrations: 0,
    terms_accepted_count: 0,
    email_opted_in_count: 0,
    active_pool_members: 0,
    email_subscribers: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTermsAccepted, setFilterTermsAccepted] = useState<boolean | null>(null);
  const [filterEmailOptIn, setFilterEmailOptIn] = useState<boolean | null>(null);
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading } = useAdminAccess();

  useEffect(() => {
    if (!adminLoading && isAdmin) {
      loadUserRegistrations();
    }
  }, [isAdmin, adminLoading]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterTermsAccepted, filterEmailOptIn]);

  const loadUserRegistrations = async () => {
    try {
      // Get all user profiles with their preferences and pool memberships
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          display_name,
          created_at,
          user_preferences (
            terms_accepted_at,
            terms_version,
            email_opt_in
          )
        `);

      if (profilesError) throw profilesError;

      // Get email list data
      const { data: emailData, error: emailError } = await supabase
        .from('email_list')
        .select('user_id, email, status');

      if (emailError) throw emailError;

      // Get pool memberships
      const { data: membershipData, error: membershipError } = await supabase
        .from('pool_memberships')
        .select(`
          user_id,
          role,
          joined_at,
          active,
          pools (
            name
          )
        `)
        .eq('active', true);

      if (membershipError) throw membershipError;

      // Combine all data
      const combinedUsers: UserRegistration[] = (profilesData || []).map((profile: any) => {
        const emailInfo = emailData?.find(e => e.user_id === profile.user_id);
        const userMemberships = membershipData?.filter(m => m.user_id === profile.user_id) || [];
        const preferences = profile.user_preferences;

        return {
          id: profile.id,
          user_id: profile.user_id,
          display_name: profile.display_name || 'Anonymous User',
          registration_date: profile.created_at,
          email: emailInfo?.email || null,
          terms_accepted: !!preferences?.terms_accepted_at,
          terms_accepted_at: preferences?.terms_accepted_at || null,
          terms_version: preferences?.terms_version || null,
          email_opt_in: preferences?.email_opt_in || false,
          email_subscription_status: emailInfo?.status || null,
          pool_memberships: userMemberships.map((m: any) => ({
            pool_name: m.pools?.name || 'Unknown Pool',
            role: m.role,
            joined_at: m.joined_at
          }))
        };
      });

      setUsers(combinedUsers);

      // Calculate stats
      const total_registrations = combinedUsers.length;
      const terms_accepted_count = combinedUsers.filter(u => u.terms_accepted).length;
      const email_opted_in_count = combinedUsers.filter(u => u.email_opt_in).length;
      const active_pool_members = combinedUsers.filter(u => u.pool_memberships.length > 0).length;
      const email_subscribers = combinedUsers.filter(u => u.email_subscription_status === 'active').length;

      setStats({
        total_registrations,
        terms_accepted_count,
        email_opted_in_count,
        active_pool_members,
        email_subscribers
      });

    } catch (error: any) {
      console.error('Error loading user registrations:', error);
      toast({
        title: "Error",
        description: "Failed to load user registrations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

    setFilteredUsers(filtered);
  };

  const exportToCsv = () => {
    const headers = [
      'Display Name', 'User ID', 'Registration Date', 'Email', 
      'Terms Accepted', 'Terms Date', 'Terms Version', 'Email Opt-in', 
      'Email Subscription', 'Pool Memberships'
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
        `"${user.pool_memberships.map(m => `${m.pool_name} (${m.role})`).join('; ')}"`
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

  if (adminLoading) {
    return <div className="text-center py-8">Checking admin access...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">You don't have permission to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-8">Loading user registrations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Registration Dashboard</h2>
        <div className="flex gap-2">
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

            {(searchTerm || filterTermsAccepted !== null || filterEmailOptIn !== null) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setFilterTermsAccepted(null);
                  setFilterEmailOptIn(null);
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
                    <th className="text-left py-2 px-4">Pool Memberships</th>
                    <th className="text-left py-2 px-4">User ID</th>
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
                              <Badge key={idx} variant="outline" className="text-xs">
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