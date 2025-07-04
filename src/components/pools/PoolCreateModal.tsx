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

interface PoolCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const PoolCreateModal = ({ open, onOpenChange, onSuccess }: PoolCreateModalProps) => {
  const { createPool, setActivePool } = usePool();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: false,
    entry_fee_amount: 25,
    entry_fee_currency: 'CAD',
    payment_method_1: 'E-transfer',
    payment_details_1: '',
    picks_per_team: 5,
    enable_bonus_questions: true,
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

    if (!formData.payment_details_1.trim()) {
      toast({
        title: "Error", 
        description: "Payment details are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const pool = await createPool(formData);
      if (pool) {
        setActivePool(pool);
        toast({
          title: "Success!",
          description: `Pool "${pool.name}" created successfully`,
        });
        onSuccess?.();
        // Reset form
        setFormData({
          name: '',
          description: '',
          is_public: false,
          entry_fee_amount: 25,
          entry_fee_currency: 'CAD',
          payment_method_1: 'E-transfer',
          payment_details_1: '',
          picks_per_team: 5,
          enable_bonus_questions: true,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create pool",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create pool",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry_fee">Entry Fee</Label>
              <div className="flex gap-2">
                <Input
                  id="entry_fee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.entry_fee_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, entry_fee_amount: parseFloat(e.target.value) || 0 }))}
                />
                <Input
                  value={formData.entry_fee_currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, entry_fee_currency: e.target.value }))}
                  className="w-20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="picks_per_team">Players per Team</Label>
              <Input
                id="picks_per_team"
                type="number"
                min="3"
                max="10"
                value={formData.picks_per_team}
                onChange={(e) => setFormData(prev => ({ ...prev, picks_per_team: parseInt(e.target.value) || 5 }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Payment Method</Label>
            <Input
              id="payment_method"
              value={formData.payment_method_1}
              onChange={(e) => setFormData(prev => ({ ...prev, payment_method_1: e.target.value }))}
              placeholder="e.g., E-transfer, Venmo, Cash"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_details">Payment Details *</Label>
            <Input
              id="payment_details"
              value={formData.payment_details_1}
              onChange={(e) => setFormData(prev => ({ ...prev, payment_details_1: e.target.value }))}
              placeholder="e.g., email@example.com, @username"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is_public">Public Pool</Label>
              <p className="text-sm text-muted-foreground">
                Allow anyone to discover and join this pool
              </p>
            </div>
            <Switch
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable_bonus_questions">Bonus Questions</Label>
              <p className="text-sm text-muted-foreground">
                Include bonus questions for extra points
              </p>
            </div>
            <Switch
              id="enable_bonus_questions"
              checked={formData.enable_bonus_questions}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enable_bonus_questions: checked }))}
            />
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
  );
};