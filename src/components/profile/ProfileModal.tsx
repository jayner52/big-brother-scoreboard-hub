import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { PoolIconSelector } from './PoolIconSelector';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SupabaseUser;
  userProfile?: {
    display_name?: string;
    avatar_url?: string;
  };
  onProfileUpdate?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  userProfile,
  onProfileUpdate
}) => {
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(userProfile?.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatar_url || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDisplayName(userProfile?.display_name || '');
    setAvatarUrl(userProfile?.avatar_url || '');
  }, [userProfile]);

  const handleIconSelect = (icon: string) => {
    console.log('Icon selected:', icon);
    setAvatarUrl(icon);
  };

  const handleClearIcon = () => {
    setAvatarUrl('');
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: displayName || null,
          avatar_url: avatarUrl || null,
        });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully",
      });

      onProfileUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initials = (displayName || user.email || 'U').charAt(0).toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your display name and choose a fun pool icon
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                {avatarUrl ? (
                  <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-blue-100 to-cyan-100">
                    {avatarUrl}
                  </div>
                ) : (
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-coral to-brand-teal text-white">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>

            <PoolIconSelector
              selectedIcon={avatarUrl}
              onIconSelect={handleIconSelect}
              onClear={handleClearIcon}
            />
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};