import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { usePool } from '@/contexts/PoolContext';
import { WinnerPaymentModal } from '@/components/admin/winners/WinnerPaymentModal';
import { Trophy, CreditCard } from 'lucide-react';

interface WinnerInfo {
  place: number;
  amount: number;
  hasSubmittedPayment: boolean;
}

export const WinnerBanner: React.FC = () => {
  const { activePool } = usePool();
  const [winnerInfo, setWinnerInfo] = useState<WinnerInfo | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Only show winner banner if the season is complete
  useEffect(() => {
    if (activePool?.id && activePool?.season_complete) {
      checkWinnerStatus();
    } else {
      setLoading(false);
      setWinnerInfo(null);
    }
  }, [activePool?.id, activePool?.season_complete]);

  const checkWinnerStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !activePool?.id) return;

      // Check if user is a winner in this pool
      const { data: winnerData } = await supabase
        .from('pool_winners')
        .select('place, amount')
        .eq('pool_id', activePool.id)
        .eq('user_id', user.id)
        .single();

      if (winnerData) {
        // Check if payment details have been submitted
        const { data: paymentData } = await supabase
          .from('winner_payment_details')
          .select('id')
          .eq('pool_id', activePool.id)
          .eq('user_id', user.id)
          .eq('place', winnerData.place)
          .single();

        setWinnerInfo({
          place: winnerData.place,
          amount: winnerData.amount,
          hasSubmittedPayment: !!paymentData
        });
      }
    } catch (error) {
      console.error('Error checking winner status:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading || !winnerInfo || !activePool || !activePool.season_complete) return null;

  return (
    <>
      <Alert className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 mb-6">
        <Trophy className="h-5 w-5 text-yellow-600" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getPlaceIcon(winnerInfo.place)}</span>
              <div>
                <div className="font-bold text-yellow-800">
                  Congratulations! You won {getPlaceText(winnerInfo.place)}!
                </div>
                <div className="text-yellow-700">
                  Prize: {activePool.entry_fee_currency} ${winnerInfo.amount.toFixed(0)}
                </div>
              </div>
            </div>
            
            {!winnerInfo.hasSubmittedPayment && (
              <Button 
                onClick={() => setShowPaymentModal(true)}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Submit Payment Details
              </Button>
            )}
            
            {winnerInfo.hasSubmittedPayment && (
              <div className="text-green-700 font-medium flex items-center gap-2">
                ✅ Payment details submitted
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowPaymentModal(true)}
                >
                  Update Details
                </Button>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>

      <WinnerPaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        poolId={activePool.id}
        place={winnerInfo.place}
        amount={winnerInfo.amount}
        poolCurrency={activePool.entry_fee_currency}
      />
    </>
  );
};
