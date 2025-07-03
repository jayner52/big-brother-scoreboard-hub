import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useUserPaymentUpdate } from '@/hooks/useUserPaymentUpdate';
import { CreditCard, Check } from 'lucide-react';

interface UserPaymentButtonProps {
  entryId: string;
  paymentConfirmed: boolean;
  className?: string;
}

export const UserPaymentButton: React.FC<UserPaymentButtonProps> = ({
  entryId,
  paymentConfirmed,
  className = ""
}) => {
  const { updatePaymentStatus, updating } = useUserPaymentUpdate();

  const handlePaymentUpdate = async () => {
    await updatePaymentStatus(entryId, true);
    // Refresh the page to show updated status
    window.location.reload();
  };

  if (paymentConfirmed) {
    return (
      <Badge variant="default" className={`bg-green-100 text-green-800 ${className}`}>
        <Check className="h-3 w-3 mr-1" />
        Payment Confirmed
      </Badge>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`border-orange-200 text-orange-700 hover:bg-orange-50 ${className}`}
          disabled={updating}
        >
          <CreditCard className="h-3 w-3 mr-1" />
          {updating ? "Updating..." : "Mark Payment Sent"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Payment Status</AlertDialogTitle>
          <AlertDialogDescription>
            Please confirm that you have sent your payment via the method specified in the pool details. 
            Marking this as sent will update your status but does not guarantee immediate approval.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handlePaymentUpdate}>
            Yes, I've Sent Payment
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};