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
      // Create pool with sensible defaults for removed fields
      const poolData = {
        ...formData,
        has_buy_in: true,
        entry_fee_amount: 25,
        entry_fee_currency: 'CAD',
        picks_per_team: 5,
        enable_bonus_questions: true,
        payment_method_1: 'E-transfer',
        payment_details_1: '',
        buy_in_description: '',
      };
      
      const pool = await createPool(poolData);
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

          <div className="space-y-3">
            <Label>Pool Privacy</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={!formData.is_public ? "default" : "outline"}
                className="h-auto p-3 flex flex-col items-center gap-1"
                onClick={() => setFormData(prev => ({ ...prev, is_public: false }))}
              >
                <span className="font-semibold">Private</span>
                <span className="text-xs opacity-80">Invite only</span>
              </Button>
              <Button
                type="button"
                variant={formData.is_public ? "default" : "outline"}
                className="h-auto p-3 flex flex-col items-center gap-1"
                onClick={() => setFormData(prev => ({ ...prev, is_public: true }))}
              >
                <span className="font-semibold">Public</span>
                <span className="text-xs opacity-80">Anyone can join</span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              You can configure buy-in, payment details, and other settings later in the admin panel
            </p>
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