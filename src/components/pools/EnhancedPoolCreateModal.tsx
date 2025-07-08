import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePool } from '@/contexts/PoolContext';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Info } from 'lucide-react';

interface EnhancedPoolCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const EnhancedPoolCreateModal = ({ open, onOpenChange, onSuccess }: EnhancedPoolCreateModalProps) => {
  const { createPool, setActivePool } = usePool();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    has_buy_in: false,
    entry_fee_amount: 25,
    entry_fee_currency: 'CAD',
    payment_method_1: 'E-transfer',
    payment_details_1: '',
    buy_in_description: '',
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

    if (formData.has_buy_in && !formData.payment_details_1.trim()) {
      toast({
        title: "Error",
        description: "Payment details are required when buy-in is enabled",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const poolData = {
        ...formData,
        picks_per_team: 5,
        enable_bonus_questions: true,
      };
      
      const result = await createPool(poolData);
      if (result.success && result.data) {
        setActivePool(result.data);
        toast({
          title: "Success!",
          description: `Pool "${result.data.name}" created successfully`,
        });
        
        onOpenChange(false);
        navigate('/admin?newPool=true');
        onSuccess?.();
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          has_buy_in: false,
          entry_fee_amount: 25,
          entry_fee_currency: 'CAD',
          payment_method_1: 'E-transfer',
          payment_details_1: '',
          buy_in_description: '',
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create pool",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Pool creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create pool';
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Pool</DialogTitle>
          <DialogDescription>
            Set up a new fantasy pool with buy-in and payment options.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
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
          </div>

          {/* Buy-In Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Entry Fee Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="has-buy-in"
                  checked={formData.has_buy_in}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, has_buy_in: checked }))}
                />
                <Label htmlFor="has-buy-in">This pool has an entry fee</Label>
              </div>

              {formData.has_buy_in && (
                <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Entry Fee Amount *</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="1"
                        step="0.01"
                        value={formData.entry_fee_amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, entry_fee_amount: Number(e.target.value) }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={formData.entry_fee_currency}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, entry_fee_currency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CAD">CAD</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="payment-method">Payment Method</Label>
                    <Select
                      value={formData.payment_method_1}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method_1: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="E-transfer">E-Transfer</SelectItem>
                        <SelectItem value="Venmo">Venmo</SelectItem>
                        <SelectItem value="PayPal">PayPal</SelectItem>
                        <SelectItem value="Zelle">Zelle</SelectItem>
                        <SelectItem value="Cash App">Cash App</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="payment-details">Payment Details *</Label>
                    <Input
                      id="payment-details"
                      value={formData.payment_details_1}
                      onChange={(e) => setFormData(prev => ({ ...prev, payment_details_1: e.target.value }))}
                      placeholder="e.g., email@example.com, @username, phone number"
                      required={formData.has_buy_in}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the email, username, or phone number where participants should send payment
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="buy-in-description">Payment Instructions (Optional)</Label>
                    <Textarea
                      id="buy-in-description"
                      value={formData.buy_in_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, buy_in_description: e.target.value }))}
                      placeholder="e.g., Please include your team name in the payment reference"
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {!formData.has_buy_in && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                    <p className="text-sm text-blue-700">
                      This pool will be just for fun with no entry fee. You can always enable buy-in later in the admin settings.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Next steps:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Your pool will be invite-only for security</li>
              <li>• You can fine-tune all settings in the admin panel</li>
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
  );
};