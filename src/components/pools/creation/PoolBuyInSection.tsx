import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Info } from 'lucide-react';
import { PoolFormField } from './PoolFormField';

interface PoolBuyInSectionProps {
  hasBuyIn: boolean;
  entryFeeAmount: number;
  entryFeeCurrency: string;
  paymentMethod: string;
  paymentDetails: string;
  buyInDescription: string;
  errors: { [key: string]: string };
  onHasBuyInChange: (checked: boolean) => void;
  onEntryFeeChange: (value: string) => void;
  onEntryFeeBlur: () => void;
  onCurrencyChange: (value: string) => void;
  onPaymentMethodChange: (value: string) => void;
  onPaymentDetailsChange: (value: string) => void;
  onBuyInDescriptionChange: (value: string) => void;
  onClearError: (field: string) => void;
}

export const PoolBuyInSection = ({
  hasBuyIn,
  entryFeeAmount,
  entryFeeCurrency,
  paymentMethod,
  paymentDetails,
  buyInDescription,
  errors,
  onHasBuyInChange,
  onEntryFeeChange,
  onEntryFeeBlur,
  onCurrencyChange,
  onPaymentMethodChange,
  onPaymentDetailsChange,
  onBuyInDescriptionChange,
  onClearError,
}: PoolBuyInSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Entry Fee Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={hasBuyIn}
            onCheckedChange={onHasBuyInChange}
          />
          <label>This pool has an entry fee</label>
        </div>

        {hasBuyIn && (
          <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="grid grid-cols-2 gap-4">
              <PoolFormField label="Entry Fee Amount" required>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  value={entryFeeAmount || ''}
                  onChange={(e) => onEntryFeeChange(e.target.value)}
                  onBlur={onEntryFeeBlur}
                  placeholder="20"
                  required
                />
              </PoolFormField>
              
              <PoolFormField label="Currency" required error={errors.currency}>
                <Select
                  value={entryFeeCurrency}
                  onValueChange={(value) => {
                    onCurrencyChange(value);
                    onClearError('currency');
                  }}
                >
                  <SelectTrigger className={errors.currency ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  </SelectContent>
                </Select>
              </PoolFormField>
            </div>
            
            <PoolFormField label="Payment Method" required error={errors.payment_method}>
              <Select
                value={paymentMethod}
                onValueChange={(value) => {
                  onPaymentMethodChange(value);
                  onClearError('payment_method');
                }}
              >
                <SelectTrigger className={errors.payment_method ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="E-transfer">E-Transfer</SelectItem>
                  <SelectItem value="Venmo">Venmo</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                  <SelectItem value="Zelle">Zelle</SelectItem>
                  <SelectItem value="Cash App">Cash App</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </PoolFormField>
            
            <PoolFormField 
              label="Payment Details" 
              required 
              error={errors.payment_details}
            >
              <Input
                value={paymentDetails}
                onChange={(e) => {
                  onPaymentDetailsChange(e.target.value);
                  onClearError('payment_details');
                }}
                placeholder="e.g., email@example.com, @username, phone number"
                required={hasBuyIn}
                className={errors.payment_details ? 'border-red-500' : ''}
              />
              <p className="text-xs text-muted-foreground">
                Enter the email, username, or phone number where participants should send payment
              </p>
            </PoolFormField>
            
            <PoolFormField label="Payment Instructions (Optional)">
              <Textarea
                value={buyInDescription}
                onChange={(e) => onBuyInDescriptionChange(e.target.value)}
                placeholder="e.g., Please include your team name in the payment reference"
                rows={2}
              />
            </PoolFormField>
          </div>
        )}

        {!hasBuyIn && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-700">
                This pool will be just for fun with no entry fee. You can always enable buy-in later in the admin settings.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};