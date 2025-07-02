import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Users, Lock, Unlock } from 'lucide-react';
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
}

interface PoolSettings {
  draft_open: boolean;
  draft_locked: boolean;
}

export const PoolEntriesManagement: React.FC = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<PoolEntry[]>([]);
  const [settings, setSettings] = useState<PoolSettings>({ draft_open: true, draft_locked: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [entriesResult, settingsResult] = await Promise.all([
        supabase.from('pool_entries').select('*').order('created_at', { ascending: false }),
        supabase.from('pool_settings').select('draft_open, draft_locked').single()
      ]);

      if (entriesResult.error) throw entriesResult.error;
      if (settingsResult.error) throw settingsResult.error;

      setEntries(entriesResult.data || []);
      setSettings(settingsResult.data);
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
    try {
      const newLockStatus = !settings.draft_locked;
      const { error } = await supabase
        .from('pool_settings')
        .update({ draft_locked: newLockStatus })
        .eq('id', '1'); // Assuming single settings row

      if (error) throw error;

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
                    <TableCell className="text-sm">
                      {[entry.player_1, entry.player_2, entry.player_3, entry.player_4, entry.player_5].join(', ')}
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
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
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