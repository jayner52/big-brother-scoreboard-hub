import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { usePool } from '@/contexts/PoolContext';
import { useToast } from '@/hooks/use-toast';
import { PoolOnboarding } from './PoolOnboarding';
import { EnhancedPoolCreateModal } from './EnhancedPoolCreateModal';

interface PoolCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const PoolCreateModal = ({ open, onOpenChange, onSuccess }: PoolCreateModalProps) => {
  // Use the enhanced version with buy-in settings
  return (
    <EnhancedPoolCreateModal 
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
    />
  );
};