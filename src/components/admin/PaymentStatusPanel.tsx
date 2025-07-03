import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Check, X } from 'lucide-react';

interface PoolEntry {
  id: string;
  participant_name: string;
  team_name: string;
  email: string;
  payment_confirmed: boolean;
  created_at: string;
}

export const PaymentStatusPanel: React.FC = () => {
  const [poolEntries, setPoolEntries] = useState<PoolEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPoolEntries();
  }, []);

  const loadPoolEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('pool_entries')
        .select('id, participant_name, team_name, email, payment_confirmed, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPoolEntries(data || []);
    } catch (error) {
      console.error('Error loading pool entries:', error);
      toast({
        title: "Error",
        description: "Failed to load pool entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (entryId: string, confirmed: boolean) => {
    try {
      const { error } = await supabase
        .from('pool_entries')
        .update({ payment_confirmed: confirmed })
        .eq('id', entryId);

      if (error) throw error;

      setPoolEntries(prev => prev.map(entry => 
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
    return <div className="text-center py-8">Loading payment status...</div>;
  }

  const paidEntries = poolEntries.filter(e => e.payment_confirmed);
  const pendingEntries = poolEntries.filter(e => !e.payment_confirmed);

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Status Management
        </CardTitle>
        <div className="flex gap-4 mt-2">
          <Badge variant="secondary" className="bg-white/20 text-white">
            {paidEntries.length} Paid
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-white">
            {pendingEntries.length} Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Participant</TableHead>
              <TableHead>Team Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {poolEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">{entry.participant_name}</TableCell>
                <TableCell>{entry.team_name}</TableCell>
                <TableCell>{entry.email}</TableCell>
                <TableCell>{new Date(entry.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={entry.payment_confirmed ? "default" : "destructive"}>
                    {entry.payment_confirmed ? "Confirmed" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {!entry.payment_confirmed && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updatePaymentStatus(entry.id, true)}
                        className="text-green-600 hover:bg-green-50"
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
                        className="text-red-600 hover:bg-red-50"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Mark Pending
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};