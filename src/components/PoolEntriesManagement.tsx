import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Users, Lock, Unlock, Check, X, CreditCard, DollarSign, Gift } from 'lucide-react';
import { useActivePool } from '@/hooks/useActivePool';
import { usePoolOperations } from '@/hooks/usePoolOperations';
import { UserPaymentButton } from '@/components/enhanced/UserPaymentButton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { InstructionAccordion } from '@/components/admin/InstructionAccordion';
import { calculatePrizes } from '@/utils/prizeCalculation';

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
  final_position?: number;
  prize_amount?: number;
  prize_status?: 'none' | 'pending_info' | 'info_submitted' | 'sent';
}

interface PoolSettings {
  draft_open: boolean;
  draft_locked: boolean;
}

export const PoolEntriesManagement: React.FC = () => {
  const { toast } = useToast();
  const activePool = useActivePool();
  const { updatePool } = usePoolOperations();
  const [entries, setEntries] = useState<PoolEntry[]>([]);
  const [settings, setSettings] = useState<PoolSettings>({ draft_open: true, draft_locked: false });
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [winners, setWinners] = useState<any[]>([]);
  const [paymentDetails, setPaymentDetails] = useState<any[]>([]);

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
      const [entriesResult, winnersResult, paymentDetailsResult] = await Promise.all([
        supabase.from('pool_entries').select('*').eq('pool_id', activePool.id).order('total_points', { ascending: false }),
        supabase.from('pool_winners').select('*').eq('pool_id', activePool.id),
        supabase.from('winner_payment_details').select('*').eq('pool_id', activePool.id)
      ]);

      if (entriesResult.error) throw entriesResult.error;

      setWinners(winnersResult.data || []);
      setPaymentDetails(paymentDetailsResult.data || []);

      // Calculate prize information for completed seasons
      const prizeInfo = calculatePrizes(activePool, entriesResult.data?.length || 0);
      
      // Enhance entries with prize information
      const enhancedEntries = (entriesResult.data || []).map((entry, index) => {
        const finalPosition = index + 1;
        const prizeForPosition = prizeInfo.prizes.find(p => p.place === finalPosition);
        const winner = winnersResult.data?.find(w => w.user_id === entry.user_id);
        const paymentDetail = paymentDetailsResult.data?.find(pd => pd.user_id === entry.user_id);
        
        let prizeStatus: 'none' | 'pending_info' | 'info_submitted' | 'sent' = 'none';
        if (winner) {
          if (winner.prize_sent) {
            prizeStatus = 'sent';
          } else if (paymentDetail) {
            prizeStatus = 'info_submitted';
          } else {
            prizeStatus = 'pending_info';
          }
        }

        return {
          ...entry,
          final_position: finalPosition,
          prize_amount: winner ? winner.amount : (prizeForPosition?.amount || 0),
          prize_status: prizeStatus
        };
      });

      setEntries(enhancedEntries);
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

  const markPrizeSent = async (entryId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('pool_winners')
        .update({ 
          prize_sent: true, 
          prize_sent_at: new Date().toISOString() 
        })
        .eq('pool_id', activePool?.id)
        .eq('user_id', userId);

      if (error) throw error;

      // Send notification to winner
      await supabase
        .from('winner_notifications')
        .insert({
          pool_id: activePool?.id,
          user_id: userId,
          place: entries.find(e => e.id === entryId)?.final_position || 1,
          amount: entries.find(e => e.id === entryId)?.prize_amount || 0,
          notification_type: 'prize_sent',
          message: 'Your prize has been sent! You should receive it soon.'
        });

      toast({
        title: "Prize Marked as Sent",
        description: "The participant will be notified that their prize is on the way.",
      });

      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error marking prize as sent:', error);
      toast({
        title: "Error",
        description: "Failed to mark prize as sent",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading pool entries...</div>;
  }

  return (
    <div className="space-y-6">
      <InstructionAccordion 
        title="Pool Entries Management" 
        tabKey="pool_entries"
      >
        <div className="space-y-2">
          <p>Monitor participant status, payment confirmation, and prize distribution. Track who has drafted and who has paid their entry fee.</p>
          
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <p><strong>🏆 During the Season:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                <li>Track payment status for participants with buy-ins</li>
                <li>Confirm payments manually when received</li>
                <li>Delete problematic or duplicate entries</li>
                <li>Monitor who has submitted teams and when</li>
                <li>Lock/unlock draft editing as needed</li>
              </ul>
            </div>
            
            <div>
              <p><strong>🎁 After Season Completion:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                <li>Prize winners appear with amounts in this table</li>
                <li>Wait for winners to submit payment information</li>
                <li>You'll be notified when payment info is received</li>
                <li>Send prizes via the requested method</li>
                <li>Check "Prize Sent" to confirm delivery</li>
                <li>Winner receives confirmation notification</li>
              </ul>
            </div>
          </div>
        </div>
      </InstructionAccordion>
      
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
                  {activePool?.has_buy_in && <TableHead>Payment</TableHead>}
                  <TableHead>Points</TableHead>
                  {activePool?.season_complete && <TableHead>Final Position</TableHead>}
                  {activePool?.season_complete && <TableHead>Prize Won</TableHead>}
                  {activePool?.season_complete && <TableHead>Prize Status</TableHead>}
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
                    {activePool?.has_buy_in && (
                      <TableCell>
                        <Badge variant={entry.payment_confirmed ? "default" : "destructive"}>
                          {entry.payment_confirmed ? "Confirmed" : "Pending"}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell className="text-center font-bold">
                      {entry.total_points}
                    </TableCell>
                    
                    {/* Final Position (only show if season is complete) */}
                    {activePool?.season_complete && (
                      <TableCell className="text-center">
                        <Badge variant={entry.final_position && entry.final_position <= 3 ? "default" : "secondary"}>
                          #{entry.final_position}
                        </Badge>
                      </TableCell>
                    )}
                    
                    {/* Prize Won (only show if season is complete) */}
                    {activePool?.season_complete && (
                      <TableCell className="text-center">
                        {entry.prize_amount && entry.prize_amount > 0 ? (
                          <div className="flex items-center gap-1 justify-center text-green-600">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-semibold">${entry.prize_amount.toFixed(0)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    )}
                    
                    {/* Prize Status (only show if season is complete) */}
                    {activePool?.season_complete && (
                      <TableCell className="text-center">
                        {entry.prize_amount && entry.prize_amount > 0 ? (
                          <div className="space-y-1">
                            <Badge variant={
                              entry.prize_status === 'sent' ? 'default' :
                              entry.prize_status === 'info_submitted' ? 'secondary' :
                              entry.prize_status === 'pending_info' ? 'destructive' : 'outline'
                            }>
                              {entry.prize_status === 'sent' ? '✓ Sent' :
                               entry.prize_status === 'info_submitted' ? 'Info Received' :
                               entry.prize_status === 'pending_info' ? 'Awaiting Info' : 'No Prize'}
                            </Badge>
                            
                            {/* Payment details for admins */}
                            {entry.prize_status === 'info_submitted' && paymentDetails.find(pd => pd.user_id === entry.user_id) && (
                              <div className="text-xs">
                                <div className="text-muted-foreground">
                                  {paymentDetails.find(pd => pd.user_id === entry.user_id)?.preferred_method}
                                </div>
                                <div className="font-mono">
                                  {paymentDetails.find(pd => pd.user_id === entry.user_id)?.payment_info}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    )}
                    
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        {/* Payment controls - only show if pool has buy-in */}
                        {activePool?.has_buy_in && (
                          <>
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
                          </>
                        )}

                        {/* Prize management controls */}
                        {activePool?.season_complete && entry.prize_amount && entry.prize_amount > 0 && entry.prize_status === 'info_submitted' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markPrizeSent(entry.id, entry.user_id)}
                            className="text-green-600 hover:bg-green-50 h-7"
                          >
                            <Gift className="h-3 w-3 mr-1" />
                            Mark Sent
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