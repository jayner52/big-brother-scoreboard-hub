import React from 'react';
import { Pool } from '@/types/pool';

interface PaymentInfoDisplayProps {
  poolSettings: Pool;
}

export const PaymentInfoDisplay: React.FC<PaymentInfoDisplayProps> = ({
  poolSettings,
}) => {
  // Don't render if pool doesn't have buy-in
  if (!poolSettings.has_buy_in) {
    return null;
  }
  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return null;
    }
  };

  const dueDate = formatDueDate(poolSettings.registration_deadline);
  const isDueSoon = poolSettings.registration_deadline ? 
    new Date(poolSettings.registration_deadline).getTime() - Date.now() < 24 * 60 * 60 * 1000 : false;

  return (
    <div className="mb-6 space-y-3">
      {dueDate && (
        <div className={`p-3 rounded-lg border ${isDueSoon ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
          <p className={`font-semibold ${isDueSoon ? 'text-red-800' : 'text-blue-800'}`}>
            ⏰ Draft Due: {dueDate}
          </p>
        </div>
      )}
      
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
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
    </div>
  );
};