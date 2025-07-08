import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { Download, Copy, Mail, Users, UserCheck, UserX } from 'lucide-react';

interface EmailSubscriber {
  id: string;
  email: string;
  display_name: string | null;
  subscribed_at: string;
  status: string;
  source: string;
}

interface EmailStats {
  total: number;
  active: number;
  unsubscribed: number;
}

export const AdminEmailDashboard: React.FC = () => {
  const [subscribers, setSubscribers] = useState<EmailSubscriber[]>([]);
  const [stats, setStats] = useState<EmailStats>({ total: 0, active: 0, unsubscribed: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading } = useAdminAccess();

  useEffect(() => {
    if (!adminLoading && isAdmin) {
      loadEmailList();
    }
  }, [isAdmin, adminLoading]);

  const loadEmailList = async () => {
    try {
      // Get email list with user profiles
      const { data: emailData, error: emailError } = await supabase
        .from('email_list')
        .select(`
          *,
          profiles:user_id (
            display_name
          )
        `)
        .order('subscribed_at', { ascending: false });

      if (emailError) throw emailError;

      const formattedData = emailData?.map((item: any) => ({
        id: item.id,
        email: item.email,
        display_name: item.profiles?.display_name || 'Anonymous User',
        subscribed_at: item.subscribed_at,
        status: item.status,
        source: item.source
      })) || [];

      setSubscribers(formattedData);

      // Calculate stats
      const total = formattedData.length;
      const active = formattedData.filter(s => s.status === 'active').length;
      const unsubscribed = formattedData.filter(s => s.status !== 'active').length;

      setStats({ total, active, unsubscribed });
    } catch (error: any) {
      console.error('Error loading email list:', error);
      toast({
        title: "Error",
        description: "Failed to load email list",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCsv = () => {
    const headers = ['Email', 'Display Name', 'Subscribed Date', 'Status', 'Source'];
    const csvContent = [
      headers.join(','),
      ...subscribers.map(sub => [
        sub.email,
        `"${sub.display_name}"`,
        new Date(sub.subscribed_at).toLocaleDateString(),
        sub.status,
        sub.source
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `poolside-picks-emails-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `Exported ${subscribers.length} email addresses to CSV`,
    });
  };

  const copyAllEmails = () => {
    const emails = subscribers.filter(s => s.status === 'active').map(s => s.email).join(', ');
    navigator.clipboard.writeText(emails);
    
    toast({
      title: "Emails Copied",
      description: `Copied ${subscribers.filter(s => s.status === 'active').length} active email addresses to clipboard`,
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
    return <div className="text-center py-8">Loading email list...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Email List Management</h2>
        <div className="flex gap-2">
          <Button onClick={copyAllEmails} variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Copy Active Emails
          </Button>
          <Button onClick={exportToCsv} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Subscribers</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Unsubscribed</p>
                <p className="text-2xl font-bold text-muted-foreground">{stats.unsubscribed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email List Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Subscribers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscribers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No email subscribers found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Email</th>
                    <th className="text-left py-2 px-4">Display Name</th>
                    <th className="text-left py-2 px-4">Subscribed</th>
                    <th className="text-left py-2 px-4">Status</th>
                    <th className="text-left py-2 px-4">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4 font-mono text-sm">{subscriber.email}</td>
                      <td className="py-2 px-4">{subscriber.display_name}</td>
                      <td className="py-2 px-4 text-sm text-muted-foreground">
                        {new Date(subscriber.subscribed_at).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4">
                        <Badge variant={subscriber.status === 'active' ? 'default' : 'secondary'}>
                          {subscriber.status}
                        </Badge>
                      </td>
                      <td className="py-2 px-4 text-sm text-muted-foreground">
                        {subscriber.source}
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