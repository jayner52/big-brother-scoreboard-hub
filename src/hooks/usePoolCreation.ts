import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePool } from '@/contexts/PoolContext';
import { useToast } from '@/hooks/use-toast';

interface PoolFormData {
  name: string;
  description: string;
  has_buy_in: boolean;
  entry_fee_amount: number;
  entry_fee_currency: string;
  payment_method_1: string;
  payment_details_1: string;
  buy_in_description: string;
}

interface PoolFormErrors {
  [key: string]: string;
}

export const usePoolCreation = () => {
  const { createPool, setActivePool } = usePool();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState<PoolFormData>({
    name: '',
    description: `Big Brother ${currentYear}`,
    has_buy_in: true,
    entry_fee_amount: 20,
    entry_fee_currency: '',
    payment_method_1: '',
    payment_details_1: '',
    buy_in_description: '',
  });
  
  const [errors, setErrors] = useState<PoolFormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: PoolFormErrors = {};
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Pool name is required",
        variant: "destructive",
      });
      return false;
    }

    if (formData.has_buy_in && !formData.entry_fee_currency) {
      newErrors.currency = "Please select a currency";
    }
    
    if (formData.has_buy_in && !formData.payment_method_1) {
      newErrors.payment_method = "Please select a payment method";
    }

    if (formData.has_buy_in && !formData.payment_details_1.trim()) {
      newErrors.payment_details = "Payment details are required when buy-in is enabled";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const poolData = {
        ...formData,
        picks_per_team: 5,
        enable_bonus_questions: true,
      };
      
      console.log('Creating pool with data:', poolData);
      
      const result = await createPool(poolData);
      console.log('Pool creation result:', result);
      
      if (result.success && result.data) {
        setActivePool(result.data);
        toast({
          title: "Success!",
          description: `Pool "${result.data.name}" created successfully. Setting up your pool...`,
        });
        
        // Reset form
        resetForm();
        return { success: true };
      } else {
        console.error('Pool creation failed:', result.error);
        toast({
          title: "Error",
          description: result.error || "Failed to create pool",
          variant: "destructive",
        });
        return { success: false };
      }
    } catch (error) {
      console.error('Pool creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create pool';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    const currentYear = new Date().getFullYear();
    setFormData({
      name: '',
      description: `Big Brother ${currentYear}`,
      has_buy_in: true,
      entry_fee_amount: 20,
      entry_fee_currency: '',
      payment_method_1: '',
      payment_details_1: '',
      buy_in_description: '',
    });
    setErrors({});
  };

  const updateFormData = (updates: Partial<PoolFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const clearError = (field: string) => {
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleEntryFeeChange = (value: string) => {
    if (value === '') {
      updateFormData({ entry_fee_amount: 0 });
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        updateFormData({ entry_fee_amount: numValue });
      }
    }
  };

  const handleEntryFeeBlur = () => {
    if (!formData.entry_fee_amount || formData.entry_fee_amount === 0) {
      updateFormData({ entry_fee_amount: 20 });
    }
  };

  return {
    formData,
    errors,
    loading,
    updateFormData,
    clearError,
    handleSubmit,
    resetForm,
    handleEntryFeeChange,
    handleEntryFeeBlur,
  };
};