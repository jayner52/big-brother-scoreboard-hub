import { useState } from 'react';
import { Copy, Share2, Users, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePool } from '@/contexts/PoolContext';
import { generateInviteLink } from '@/utils/domains';

export const InviteFriendsButton = () => {
  const { activePool } = usePool();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  if (!activePool) return null;

  const inviteCode = activePool.invite_code;
  const shareLink = generateInviteLink(inviteCode);

  const copyToClipboard = async (text: string, type: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast({
        title: "Copied!",
        description: `${type === 'code' ? 'Invite code' : 'Share link'} copied to clipboard`,
      });
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join my Big Brother Fantasy Pool: ${activePool.name}`,
          text: `Join my fantasy pool "${activePool.name}" using invite code: ${inviteCode}`,
          url: shareLink,
        });
      } catch (error) {
        // User cancelled sharing or sharing not supported
        copyToClipboard(shareLink, 'link');
      }
    } else {
      copyToClipboard(shareLink, 'link');
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Join my Big Brother Fantasy Pool: ${activePool.name}`);
    const body = encodeURIComponent(`Hi! I'd like to invite you to join my fantasy pool "${activePool.name}".

You can join by visiting this link: ${shareLink}

Or use invite code: ${inviteCode}

Let's see who picks the best team!`);
    
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const shareViaText = () => {
    const message = encodeURIComponent(`Join my Big Brother Fantasy Pool "${activePool.name}"! Use code: ${inviteCode} or visit: ${shareLink}`);
    window.open(`sms:?body=${message}`, '_blank');
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Users className="h-4 w-4" />
        Invite Friends
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Friends to {activePool.name}</DialogTitle>
            <DialogDescription>
              Share your pool with friends and family so they can join the fun!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite_code">Invite Code</Label>
              <div className="flex gap-2">
                <Input
                  id="invite_code"
                  value={inviteCode}
                  readOnly
                  className="font-mono tracking-wider text-center text-lg font-bold"
                />
                <Button
                  variant="outline"
                  size="sm" 
                  onClick={() => copyToClipboard(inviteCode, 'code')}
                  className="px-3"
                >
                  {copied === 'code' ? 'Copied!' : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="share_link">Direct Link</Label>
              <div className="flex gap-2">
                <Input
                  id="share_link"
                  value={shareLink}
                  readOnly
                  className="text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(shareLink, 'link')}
                  className="px-3"
                >
                  {copied === 'link' ? 'Copied!' : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={shareNative} className="flex-1" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button onClick={shareViaEmail} variant="outline" size="sm">
                <Mail className="h-4 w-4" />
              </Button>
              <Button onClick={shareViaText} variant="outline" size="sm">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};