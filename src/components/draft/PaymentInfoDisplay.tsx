import React from 'react';
import { PoolSettings } from '@/types/pool';

interface PaymentInfoDisplayProps {
  poolSettings: PoolSettings;
}

export const PaymentInfoDisplay: React.FC<PaymentInfoDisplayProps> = ({
  poolSettings,
}) => {
  return (
    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-semibold text-lg mb-2">
        Entry Fee: ${poolSettings.entry_fee_amount} {poolSettings.entry_fee_currency}
      </h3>
      <p className="text-sm mb-2">
        <strong>{poolSettings.payment_method_1}:</strong> {poolSettings.payment_details_1}
      </p>
      {poolSettings.payment_method_2 && (
        <p className="text-sm">
          <strong>{poolSettings.payment_method_2}:</strong> {poolSettings.payment_details_2}
        </p>
      )}
    </div>
  );
};