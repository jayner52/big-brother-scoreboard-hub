import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, CreditCard, Copy, CheckCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecurePaymentPanelProps {
  paymentConfirmed: boolean;
  onPaymentConfirmedChange: (confirmed: boolean) => void;
  poolSettings?: {
    entry_fee_amount: number;
    entry_fee_currency: string;
    payment_method_1: string;
    payment_details_1: string;
    payment_method_2?: string;
    payment_details_2?: string;
  };
}

export const SecurePaymentPanel: React.FC<SecurePaymentPanelProps> = ({
  paymentConfirmed,
  onPaymentConfirmedChange,
  poolSettings,
}) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const entryFee = poolSettings ? `${poolSettings.entry_fee_currency}${poolSettings.entry_fee_amount}` : '$25';

  return (
    <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
      <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3">
          <Shield className="h-6 w-6" />
          <div>
            <div>Secure Payment Confirmation</div>
            <div className="text-green-100 text-sm font-normal mt-1">
              Entry Fee: {entryFee}
            </div>
          </div>
        </CardTitle>
        <CardDescription className="text-green-100">
          Complete your registration with secure payment confirmation
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Payment Methods */}
        <div className="space-y-4">
          <h3 className="font-semibold text-green-800 flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Methods
          </h3>
          
          {poolSettings?.payment_method_1 && (
            <div className="p-4 bg-white rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                  {poolSettings.payment_method_1}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(poolSettings.payment_details_1, poolSettings.payment_method_1)}
                  className="text-green-600 hover:text-green-800"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
              <p className="text-sm font-mono bg-green-50 p-2 rounded border">
                {poolSettings.payment_details_1}
              </p>
            </div>
          )}

          {poolSettings?.payment_method_2 && poolSettings?.payment_details_2 && (
            <div className="p-4 bg-white rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                  {poolSettings.payment_method_2}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(poolSettings.payment_details_2!, poolSettings.payment_method_2!)}
                  className="text-green-600 hover:text-green-800"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
              <p className="text-sm font-mono bg-green-50 p-2 rounded border">
                {poolSettings.payment_details_2}
              </p>
            </div>
          )}
        </div>

        {/* Information Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Payment Processing</p>
              <p>
                Your entry will be confirmed once payment is verified by administrators. 
                You can update your payment status anytime after registration.
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="payment-confirmed"
              checked={paymentConfirmed}
              onCheckedChange={onPaymentConfirmedChange}
              className="mt-1"
            />
            <div className="flex-1">
              <Label 
                htmlFor="payment-confirmed" 
                className="text-sm font-medium leading-relaxed cursor-pointer"
              >
                I have sent my entry fee payment using one of the methods above
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Don't worry - you can update this status later if needed
              </p>
            </div>
            {paymentConfirmed && (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
          </div>
        </div>

        {/* Security Footer */}
        <div className="border-t border-green-200 pt-4">
          <div className="flex items-center gap-2 text-xs text-green-700">
            <Shield className="h-3 w-3" />
            <span>Your payment information is handled securely by administrators</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};