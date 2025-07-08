import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, DollarSign, CreditCard, Info } from 'lucide-react';

interface PrizeClaimModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: {
    pool_id: string;
    place: number;
    amount: number;
  } | null;
}

export const PrizeClaimModal: React.FC<PrizeClaimModalProps> = ({
  open,
  onOpenChange,
  notification
}) => {
  const { toast } = useToast();
  const [paymentInfo, setPaymentInfo] = useState({
    method: '',
    details: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [existingDetails, setExistingDetails] = useState<any>(null);

  useEffect(() => {
    if (open && notification) {
      loadExistingDetails();
    }
  }, [open, notification]);

  const loadExistingDetails = async () => {
    if (!notification) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('winner_payment_details')
        .select('*')
        .eq('pool_id', notification.pool_id)
        .eq('user_id', user.id)
        .eq('place', notification.place)
        .single();

      if (data && !error) {
        setExistingDetails(data);
        setPaymentInfo({
          method: data.preferred_method,
          details: data.payment_info,
          notes: '' // Remove notes field for now as it's not in the current schema
        });
      }
    } catch (error) {
      console.error('Error loading existing payment details:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInfo.method.trim() || !paymentInfo.details.trim() || !notification) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required payment details",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const paymentData = {
        pool_id: notification.pool_id,
        user_id: user.id,
        place: notification.place,
        amount: notification.amount,
        preferred_method: paymentInfo.method,
        payment_info: paymentInfo.details
      };

      if (existingDetails) {
        // Update existing
        const { error } = await supabase
          .from('winner_payment_details')
          .update(paymentData)
          .eq('id', existingDetails.id);
        
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('winner_payment_details')
          .insert(paymentData);
        
        if (error) throw error;
      }

      // Mark notification as read
      await supabase
        .from('winner_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('pool_id', notification.pool_id)
        .eq('user_id', user.id)
        .eq('place', notification.place)
        .eq('notification_type', 'prize_won');

      toast({
        title: "🎉 Payment Details Submitted!",
        description: "Your payment information has been sent to the pool owner for prize distribution.",
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting payment details:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit payment details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getPlaceIcon = () => {
    if (!notification) return '🏆';
    switch (notification.place) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏆';
    }
  };

  const getPlaceText = () => {
    if (!notification) return 'Winner';
    switch (notification.place) {
      case 1: return '1st Place';
      case 2: return '2nd Place';
      case 3: return '3rd Place';
      default: return `${notification.place}th Place`;
    }
  };

  if (!notification) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Congratulations! {getPlaceIcon()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <DollarSign className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold">
                {getPlaceText()}: ${notification.amount.toFixed(0)}
              </div>
              <div className="text-sm mt-1">
                Please provide your payment details below so the pool owner can send you your prize!
              </div>
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="payment-method">Preferred Payment Method *</Label>
              <Select value={paymentInfo.method} onValueChange={(value) => setPaymentInfo(prev => ({ ...prev, method: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="e-transfer">E-Transfer</SelectItem>
                  <SelectItem value="venmo">Venmo</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="zelle">Zelle</SelectItem>
                  <SelectItem value="cashapp">Cash App</SelectItem>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  <SelectItem value="check">Check (Mail)</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment-details">Payment Information *</Label>
              <Textarea
                id="payment-details"
                value={paymentInfo.details}
                onChange={(e) => setPaymentInfo(prev => ({ ...prev, details: e.target.value }))}
                placeholder="Enter your email, username, account details, or other information needed to receive payment"
                className="min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Example: "email@example.com" for E-Transfer, "@username" for Venmo, or account details for bank transfer
              </p>
            </div>


            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="text-sm">
                  Your payment information will only be visible to the pool owner and will be used solely for prize distribution.
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting || !paymentInfo.method.trim() || !paymentInfo.details.trim()}
                className="flex-1"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {submitting ? 'Submitting...' : existingDetails ? 'Update Details' : 'Submit Details'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};