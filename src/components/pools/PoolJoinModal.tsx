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
import { usePool } from '@/contexts/PoolContext';
import { useToast } from '@/hooks/use-toast';

interface PoolJoinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const PoolJoinModal = ({ open, onOpenChange, onSuccess }: PoolJoinModalProps) => {
  const { joinPoolByCode, setActivePool } = usePool();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter an invite code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await joinPoolByCode(inviteCode.trim().toUpperCase());
      
      if (result.success) {
        if (result.pool) {
          setActivePool(result.pool);
        }
        toast({
          title: "Success!",
          description: `Successfully joined the pool`,
        });
        onSuccess?.();
        setInviteCode('');
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to join pool",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join pool",
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
          <DialogTitle>Join a Pool</DialogTitle>
          <DialogDescription>
            Enter the invite code you received to join an existing pool.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">How to join:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Get an invite code or link from a pool member</li>
              <li>• Enter the 8-character code below</li>
              <li>• Start drafting your team!</li>
            </ul>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite_code">Invite Code</Label>
              <Input
                id="invite_code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g., ABC12345"
                className="font-mono tracking-wider"
                maxLength={8}
                required
              />
            </div>
          </form>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !inviteCode.trim()}>
            {loading ? 'Joining...' : 'Join Pool'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};