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

interface PoolCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const PoolCreateModal = ({ open, onOpenChange, onSuccess }: PoolCreateModalProps) => {
  const { createPool, setActivePool } = usePool();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [createdPoolName, setCreatedPoolName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Pool name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create pool with sensible defaults
      const poolData = {
        ...formData,
        has_buy_in: true,
        entry_fee_amount: 25,
        entry_fee_currency: 'CAD',
        picks_per_team: 5,
        enable_bonus_questions: true,
        payment_method_1: 'E-transfer',
        payment_details_1: 'email@example.com',
        buy_in_description: null,
      };
      
      const result = await createPool(poolData);
      if (result.success && result.data) {
        setActivePool(result.data);
        toast({
          title: "Success!",
          description: `Pool "${result.data.name}" created successfully`,
        });
        
        // Show onboarding flow
        setCreatedPoolName(result.data.name);
        onOpenChange(false); // Close create modal
        setShowOnboarding(true); // Show onboarding
        onSuccess?.();
        
        // Reset form
        setFormData({
          name: '',
          description: '',
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create pool",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Pool creation error caught in modal:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
        ? error 
        : 'Failed to create pool - check console for details';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Pool</DialogTitle>
            <DialogDescription>
              Set up a new fantasy pool for your friends and family.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Pool Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Smith Family Pool"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description for your pool"
                rows={2}
              />
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Next steps:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Your pool will be invite-only for security</li>
                <li>• You can configure buy-in and payment details in admin settings</li>
                <li>• Share your invite code with friends to get started</li>
              </ul>
            </div>
          </form>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating...' : 'Create Pool'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PoolOnboarding 
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        poolName={createdPoolName}
      />
    </>
  );
};