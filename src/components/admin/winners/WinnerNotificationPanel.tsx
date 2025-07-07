import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Trophy, 
  User, 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Copy,
  RefreshCw,
  DollarSign
} from 'lucide-react';

interface Winner {
  id: string;
  place: number;
  amount: number;
  team_name: string;
  participant_name: string;
  total_points: number;
  user_id: string;
  payment_details?: {
    preferred_method: string;
    payment_info: string;
    created_at: string;
  };
}

interface WinnerNotificationPanelProps {
  poolId: string;
}

export const WinnerNotificationPanel: React.FC<WinnerNotificationPanelProps> = ({ poolId }) => {
  const { toast } = useToast();
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWinnersData();
  }, [poolId]);

  const loadWinnersData = async () => {
    try {
      setLoading(true);
      
      // Load winners with payment details
      const { data: winnersData, error: winnersError } = await supabase
        .from('pool_winners')
        .select(`
          *,
          pool_entries!inner(
            team_name,
            participant_name,
            total_points,
            user_id
          )
        `)
        .eq('pool_id', poolId)
        .order('place');

      if (winnersError) throw winnersError;

      // Load payment details for each winner
      const winnersWithPayment = await Promise.all(
        (winnersData || []).map(async (winner) => {
          const { data: paymentData } = await supabase
            .from('winner_payment_details')
            .select('preferred_method, payment_info, created_at')
            .eq('pool_id', poolId)
            .eq('user_id', winner.pool_entries.user_id)
            .eq('place', winner.place)
            .single();

          return {
            id: winner.id,
            place: winner.place,
            amount: winner.amount,
            team_name: winner.pool_entries.team_name,
            participant_name: winner.pool_entries.participant_name,
            total_points: winner.pool_entries.total_points,
            user_id: winner.pool_entries.user_id,
            payment_details: paymentData || null
          };
        })
      );

      setWinners(winnersWithPayment);
    } catch (error) {
      console.error('Error loading winners data:', error);
      toast({
        title: "Error",
        description: "Failed to load winners data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyPaymentInfo = (info: string) => {
    navigator.clipboard.writeText(info);
    toast({
      title: "Copied!",
      description: "Payment information copied to clipboard",
    });
  };

  const getPlaceIcon = (place: number) => {
    switch (place) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏆';
    }
  };

  const getPlaceText = (place: number) => {
    switch (place) {
      case 1: return '1st Place';
      case 2: return '2nd Place';
      case 3: return '3rd Place';
      default: return `${place}th Place`;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading winners...</div>;
  }

  if (winners.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No winners found. Complete the season to see prize winners here.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Winner Payment Information
        </CardTitle>
        <CardDescription>
          Payment details submitted by winning participants
        </CardDescription>
        <Button
          variant="outline"
          size="sm"
          onClick={loadWinnersData}
          className="w-fit ml-auto"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {winners.map((winner) => (
          <div key={winner.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getPlaceIcon(winner.place)}</span>
                <div>
                  <div className="font-semibold">{winner.participant_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {winner.team_name} • {winner.total_points} pts
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary">{getPlaceText(winner.place)}</Badge>
                <div className="flex items-center gap-1 mt-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-600">
                    ${winner.amount.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>

            {winner.payment_details ? (
              <div className="bg-green-50 border border-green-200 rounded p-3 space-y-2">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Payment Details Submitted</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-green-700 font-medium">Method:</span>
                    <div className="capitalize">{winner.payment_details.preferred_method.replace('-', ' ')}</div>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Submitted:</span>
                    <div>{new Date(winner.payment_details.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <div>
                  <span className="text-green-700 font-medium">Payment Info:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-green-100 px-2 py-1 rounded text-sm flex-1">
                      {winner.payment_details.payment_info}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyPaymentInfo(winner.payment_details!.payment_info)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded p-3">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Awaiting Payment Details</span>
                </div>
                <div className="text-sm text-amber-700 mt-1">
                  The winner has not yet submitted their payment information.
                </div>
              </div>
            )}
          </div>
        ))}

        <Alert>
          <User className="h-4 w-4" />
          <AlertDescription>
            <strong>Pool Owner Only:</strong> Payment information is only visible to you as the pool owner. 
            Use the details above to send prize money to your winners via their preferred payment method.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};