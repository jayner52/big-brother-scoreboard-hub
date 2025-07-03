import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUserPaymentUpdate = () => {
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const updatePaymentStatus = async (entryId: string, confirmed: boolean) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('pool_entries')
        .update({ payment_confirmed: confirmed })
        .eq('id', entryId);

      if (error) throw error;

      toast({
        title: "Payment Status Updated",
        description: confirmed 
          ? "Thank you! Your payment has been marked as sent." 
          : "Payment status has been marked as pending.",
      });

      return true;
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Error",
        description: "Failed to update payment status. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return {
    updatePaymentStatus,
    updating
  };
};