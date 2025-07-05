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
    has_buy_in: true,
    entry_fee_amount: 25,
    entry_fee_currency: 'CAD',
    buy_in_description: '',
    payment_method_1: 'E-transfer',
    payment_details_1: '',
    picks_per_team: 5,
    enable_bonus_questions: true,
  });

  const paymentMethods = [
    'E-transfer',
    'Venmo', 
    'PayPal',
    'Cash',
    'Zelle',
    'Apple Pay',
    'Other'
  ];

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

    // Remove payment validation - it's now optional

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
          has_buy_in: true,
          entry_fee_amount: 25,
          entry_fee_currency: 'CAD',
          buy_in_description: '',
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

          <div className="space-y-3">
            <Label>Pool Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={formData.has_buy_in ? "default" : "outline"}
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => setFormData(prev => ({ ...prev, has_buy_in: true }))}
              >
                <span className="font-semibold">Buy-In Pool</span>
                <span className="text-xs text-center opacity-80">Entry fee required</span>
              </Button>
              <Button
                type="button"
                variant={!formData.has_buy_in ? "default" : "outline"}
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => setFormData(prev => ({ ...prev, has_buy_in: false }))}
              >
                <span className="font-semibold">Just For Fun</span>
                <span className="text-xs text-center opacity-80">No money involved</span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              As pool admin, you'll manage settings, enter weekly results, and collect payments (if applicable)
            </p>
          </div>

          {formData.has_buy_in && (
            <>
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
                <Label htmlFor="buy_in_description">Buy-in Details (Optional)</Label>
                <Input
                  id="buy_in_description"
                  value={formData.buy_in_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, buy_in_description: e.target.value }))}
                  placeholder="e.g., Prize distribution details, special rules..."
                />
                <p className="text-xs text-muted-foreground">You can add this information later in pool settings</p>
              </div>
            </>
          )}

          {!formData.has_buy_in && (
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
          )}

          {formData.has_buy_in && (
            <>
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method (Optional)</Label>
                <select
                  id="payment_method"
                  value={formData.payment_method_1}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_method_1: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">You can configure this later in pool settings</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_details">Payment Details (Optional)</Label>
                <Input
                  id="payment_details"
                  value={formData.payment_details_1}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_details_1: e.target.value }))}
                  placeholder="e.g., email@example.com, @username"
                />
                <p className="text-xs text-muted-foreground">You can add this later in pool settings</p>
              </div>
            </>
          )}

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