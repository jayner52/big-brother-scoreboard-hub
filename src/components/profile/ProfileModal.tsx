import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

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
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setDisplayName(userProfile?.display_name || '');
    setAvatarUrl(userProfile?.avatar_url || '');
  }, [userProfile]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // For now, use a placeholder URL service or convert to base64
      // In a real app, you'd upload to Supabase Storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setAvatarUrl(dataUrl);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image",
        variant: "destructive",
      });
      setUploading(false);
    }
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
            Update your display name and profile picture
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-coral to-brand-teal text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              {avatarUrl && (
                <button
                  onClick={() => setAvatarUrl('')}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      Change Photo
                    </>
                  )}
                </Button>
              </Label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </div>
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