import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Users, Lock, Unlock, Check, X, CreditCard } from 'lucide-react';
import { usePool } from '@/contexts/PoolContext';
import { UserPaymentButton } from '@/components/enhanced/UserPaymentButton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface PoolEntry {
  id: string;
  participant_name: string;
  team_name: string;
  player_1: string;
  player_2: string;
  player_3: string;
  player_4: string;
  player_5: string;
  payment_confirmed: boolean;
  total_points: number;
  created_at: string;
  email: string;
  user_id: string;
}

interface PoolSettings {
  draft_open: boolean;
  draft_locked: boolean;
}

export const PoolEntriesManagement: React.FC = () => {
  const { toast } = useToast();
  const { activePool, updatePool } = usePool();
  const [entries, setEntries] = useState<PoolEntry[]>([]);
  const [settings, setSettings] = useState<PoolSettings>({ draft_open: true, draft_locked: false });
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (activePool) {
      loadData();
      getCurrentUser();
    }
  }, [activePool]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadData = async () => {
    if (!activePool) return;
    
    try {
      const [entriesResult] = await Promise.all([
        supabase.from('pool_entries').select('id, participant_name, team_name, player_1, player_2, player_3, player_4, player_5, payment_confirmed, total_points, created_at, email, user_id').eq('pool_id', activePool.id).order('created_at', { ascending: false })
      ]);

      if (entriesResult.error) throw entriesResult.error;

      setEntries(entriesResult.data || []);
      setSettings({ 
        draft_open: activePool.draft_open, 
        draft_locked: activePool.draft_locked 
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load pool entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('pool_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      setEntries(prev => prev.filter(entry => entry.id !== entryId));
      toast({
        title: "Success!",
        description: "Pool entry deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete pool entry",
        variant: "destructive",
      });
    }
  };

  const handleToggleDraftLock = async () => {
    if (!activePool) return;
    
    try {
      const newLockStatus = !settings.draft_locked;
      const success = await updatePool(activePool.id, {
        draft_locked: newLockStatus
      });

      if (!success) throw new Error('Failed to update pool');

      setSettings(prev => ({ ...prev, draft_locked: newLockStatus }));
      toast({
        title: "Success!",
        description: `Draft ${newLockStatus ? 'locked' : 'unlocked'} successfully`,
      });
    } catch (error) {
      console.error('Error toggling draft lock:', error);
      toast({
        title: "Error",
        description: "Failed to update draft lock status",
        variant: "destructive",
      });
    }
  };

  const updatePaymentStatus = async (entryId: string, confirmed: boolean) => {
    try {
      const { error } = await supabase
        .from('pool_entries')
        .update({ payment_confirmed: confirmed })
        .eq('id', entryId);

      if (error) throw error;

      setEntries(prev => prev.map(entry => 
        entry.id === entryId ? { ...entry, payment_confirmed: confirmed } : entry
      ));

      toast({
        title: "Success!",
        description: `Payment status ${confirmed ? 'confirmed' : 'marked as pending'}`,
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading pool entries...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Pool Entries Management
          </CardTitle>
          <CardDescription className="text-purple-100">
            Manage draft entries and lock/unlock editing
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {/* Draft Lock Controls */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg mb-6">
            <div className="flex items-center space-x-2">
              {settings.draft_locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              <Label>Draft Editing</Label>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {settings.draft_locked ? 'Locked' : 'Unlocked'}
              </span>
              <Switch
                checked={!settings.draft_locked}
                onCheckedChange={handleToggleDraftLock}
              />
            </div>
          </div>

          {/* Entries Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-semibold">
                      {entry.participant_name}
                    </TableCell>
                    <TableCell>{entry.team_name}</TableCell>
                    <TableCell className="text-sm">{entry.email}</TableCell>
                    <TableCell className="text-sm">
                      {Array.from({ length: activePool?.picks_per_team || 5 }, (_, i) => entry[`player_${i + 1}` as keyof typeof entry]).filter(Boolean).join(', ')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.payment_confirmed ? "default" : "destructive"}>
                        {entry.payment_confirmed ? "Confirmed" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {entry.total_points}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        {/* User can mark their own payment as sent */}
                        {currentUserId === entry.user_id && !entry.payment_confirmed && (
                          <UserPaymentButton 
                            entryId={entry.id}
                            paymentConfirmed={entry.payment_confirmed}
                          />
                        )}
                        
                        {/* Admin controls */}
                        {!entry.payment_confirmed && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updatePaymentStatus(entry.id, true)}
                            className="text-green-600 hover:bg-green-50 h-7"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Confirm
                          </Button>
                        )}
                        {entry.payment_confirmed && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updatePaymentStatus(entry.id, false)}
                            className="text-red-600 hover:bg-red-50 h-7"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Pending
                          </Button>
                        )}
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="h-7">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Pool Entry</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {entry.participant_name}'s entry? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteEntry(entry.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {entries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No pool entries found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};