import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';

export const useToastFeedback = () => {
  const { toast } = useToast();

  const showSuccess = useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default',
    });
  }, [toast]);

  const showError = useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'destructive',
    });
  }, [toast]);

  const showLoading = useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default',
    });
  }, [toast]);

  return {
    showSuccess,
    showError,
    showLoading,
  };
};