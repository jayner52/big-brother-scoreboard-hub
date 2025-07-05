import { useState } from 'react';
import { Copy, Share2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePool } from '@/contexts/PoolContext';

export const PoolInviteShare = () => {
  const { activePool } = usePool();
  const { toast } = useToast();
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  if (!activePool) return null;

  const inviteCode = activePool.invite_code;
  const shareLink = `${window.location.origin}/welcome?code=${inviteCode}`;

  const copyToClipboard = async (text: string, type: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast({
        title: "Copied!",
        description: `Invite ${type} copied to clipboard`,
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

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-3">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl">Invite Friends to {activePool.name}</CardTitle>
        <CardDescription>
          Share your pool with friends and family so they can join the fun!
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
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
          <p className="text-xs text-muted-foreground">
            Share this code with friends so they can join your pool
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="share_link">Share Link</Label>
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

        <div className="pt-2">
          <Button onClick={shareNative} className="w-full" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share Pool
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};