import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { usePool } from '@/contexts/PoolContext';

interface PaymentValidationSectionProps {
  paymentConfirmed: boolean;
  onPaymentConfirmedChange: (confirmed: boolean) => void;
}

export const PaymentValidationSection: React.FC<PaymentValidationSectionProps> = ({
  paymentConfirmed,
  onPaymentConfirmedChange,
}) => {
  const { activePool } = usePool();
  
  // Don't render if pool doesn't have buy-in
  if (!activePool?.has_buy_in) {
    return null;
  }
  
  return (
    <Card className="border-2 border-green-200">
      <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Confirmation
        </CardTitle>
        <CardDescription className="text-green-100">
          Confirm your {activePool?.entry_fee_currency} ${activePool?.entry_fee_amount} entry fee payment
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="payment-confirmed"
            checked={paymentConfirmed}
            onCheckedChange={onPaymentConfirmedChange}
          />
          <Label htmlFor="payment-confirmed" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            I have sent my {activePool?.entry_fee_currency} ${activePool?.entry_fee_amount} via {activePool?.payment_method_1} to {activePool?.payment_details_1}
          </Label>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Your payment status can be updated anytime after registration. Admins will verify payments before the draft closes.
        </p>
      </CardContent>
    </Card>
  );
};