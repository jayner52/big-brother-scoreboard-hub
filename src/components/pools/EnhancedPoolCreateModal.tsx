import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { usePoolCreation } from '@/hooks/usePoolCreation';
import { PoolBasicInfoSection } from './creation/PoolBasicInfoSection';
import { PoolBuyInSection } from './creation/PoolBuyInSection';
import { PoolCreationSummary } from './creation/PoolCreationSummary';

interface EnhancedPoolCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const EnhancedPoolCreateModal = ({ open, onOpenChange, onSuccess }: EnhancedPoolCreateModalProps) => {
  const navigate = useNavigate();
  const {
    formData,
    errors,
    loading,
    updateFormData,
    clearError,
    handleSubmit,
    resetForm,
    handleEntryFeeChange,
    handleEntryFeeBlur,
  } = usePoolCreation();

  const onSubmit = async (e: React.FormEvent) => {
    const result = await handleSubmit(e);
    
    if (result?.success) {
      onOpenChange(false);
      navigate('/admin?newPool=true');
      onSuccess?.();
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Pool</DialogTitle>
          <DialogDescription>
            Set up a new fantasy pool with buy-in and payment options.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <PoolBasicInfoSection
            name={formData.name}
            description={formData.description}
            onNameChange={(value) => updateFormData({ name: value })}
            onDescriptionChange={(value) => updateFormData({ description: value })}
          />

          <PoolBuyInSection
            hasBuyIn={formData.has_buy_in}
            entryFeeAmount={formData.entry_fee_amount}
            entryFeeCurrency={formData.entry_fee_currency}
            paymentMethod={formData.payment_method_1}
            paymentDetails={formData.payment_details_1}
            buyInDescription={formData.buy_in_description}
            errors={errors}
            onHasBuyInChange={(checked) => updateFormData({ has_buy_in: checked })}
            onEntryFeeChange={handleEntryFeeChange}
            onEntryFeeBlur={handleEntryFeeBlur}
            onCurrencyChange={(value) => updateFormData({ entry_fee_currency: value })}
            onPaymentMethodChange={(value) => updateFormData({ payment_method_1: value })}
            onPaymentDetailsChange={(value) => updateFormData({ payment_details_1: value })}
            onBuyInDescriptionChange={(value) => updateFormData({ buy_in_description: value })}
            onClearError={clearError}
          />

          <PoolCreationSummary />
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Pool'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
