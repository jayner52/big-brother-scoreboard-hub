import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagementTab } from './company-admin/UserManagementTab';
import { PoolAnalyticsTab } from './company-admin/PoolAnalyticsTab';
import { FeedbackManagementTab } from './company-admin/FeedbackManagementTab';
import { Users, Database, MessageSquare } from 'lucide-react';

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
  const [stats, setStats] = useState<DashboardStats>({
    total_registrations: 0,
    terms_accepted_count: 0,
    email_opted_in_count: 0,
    active_pool_members: 0,
    email_subscribers: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUserRegistrations();
  }, []);

  const loadUserRegistrations = async () => {
    try {
      console.log('COMPANY_ADMIN: Starting enhanced data load...');
      
      // Try to load enhanced data via edge function first
      try {
        const { data: enhancedData, error: enhancedError } = await supabase.functions.invoke('company-admin-data', {
          body: { action: 'get_user_data' }
        });

        if (enhancedError) {
          console.warn('COMPANY_ADMIN: Enhanced data failed, falling back to basic data:', enhancedError);
          throw enhancedError;
        }

        console.log('COMPANY_ADMIN: Enhanced data loaded successfully');
        
        // Convert enhanced data to basic format for compatibility
        const enhancedUsers = enhancedData.users || [];
        const basicUsers: UserRegistration[] = enhancedUsers.map((user: any) => ({
          id: user.id,
          user_id: user.user_id,
          display_name: user.display_name,
          registration_date: user.registration_date,
          email: user.email,
          terms_accepted: user.terms_accepted,
          terms_accepted_at: user.terms_accepted_at,
          terms_version: user.terms_version,
          email_opt_in: user.email_opt_in,
          email_subscription_status: user.email_subscription_status,
          pool_memberships: user.pool_memberships
        }));

        setUsers(basicUsers);
        setStats(enhancedData.stats || stats);
        return;
        
      } catch (enhancedError) {
        console.log('COMPANY_ADMIN: Falling back to basic data loading...');
      }

      // Fallback to basic data loading
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, display_name, created_at');

      if (profilesError) {
        console.error('COMPANY_ADMIN: Error loading profiles:', profilesError);
        throw profilesError;
      }
      
      console.log('COMPANY_ADMIN: Loaded profiles:', profilesData?.length || 0);

      // Try to get user preferences - may fail due to RLS
      let preferencesData = null;
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('user_id, terms_accepted_at, terms_version, email_opt_in');
        
        if (error) {
          console.warn('COMPANY_ADMIN: Cannot access user_preferences due to RLS:', error.message);
        } else {
          preferencesData = data;
          console.log('COMPANY_ADMIN: Loaded preferences:', data?.length || 0);
        }
      } catch (err) {
        console.warn('COMPANY_ADMIN: Failed to load user preferences:', err);
      }

      // Try to get email list data - may fail due to RLS
      let emailData = null;
      try {
        const { data, error } = await supabase
          .from('email_list')
          .select('user_id, email, status');
        
        if (error) {
          console.warn('COMPANY_ADMIN: Cannot access email_list due to RLS:', error.message);
        } else {
          emailData = data;
          console.log('COMPANY_ADMIN: Loaded email data:', data?.length || 0);
        }
      } catch (err) {
        console.warn('COMPANY_ADMIN: Failed to load email list:', err);
      }

      // Try to get pool memberships - may fail due to RLS
      let membershipData = null;
      try {
        const { data, error } = await supabase
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
        
        if (error) {
          console.warn('COMPANY_ADMIN: Cannot access pool_memberships due to RLS:', error.message);
        } else {
          membershipData = data;
          console.log('COMPANY_ADMIN: Loaded memberships:', data?.length || 0);
        }
      } catch (err) {
        console.warn('COMPANY_ADMIN: Failed to load pool memberships:', err);
      }

      // Combine all data
      const combinedUsers: UserRegistration[] = (profilesData || []).map((profile: any) => {
        const emailInfo = emailData?.find(e => e.user_id === profile.user_id);
        const userMemberships = membershipData?.filter(m => m.user_id === profile.user_id) || [];
        const preferences = preferencesData?.find(p => p.user_id === profile.user_id);

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

  if (loading) {
    return <div className="text-center py-8">Loading company admin dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Company Admin Dashboard</h2>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="pools" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Pool Analytics
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Feedback
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <UserManagementTab 
            users={users} 
            stats={stats} 
            onUsersUpdate={loadUserRegistrations}
          />
        </TabsContent>
        
        <TabsContent value="pools">
          <PoolAnalyticsTab />
        </TabsContent>

        <TabsContent value="feedback">
          <FeedbackManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
