
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
    background_color?: string;
  };
  onProfileUpdate?: () => void;
}

const backgroundColors = [
  { name: 'Default', value: '' },
  { name: 'Ocean Blue', value: 'from-blue-500 to-cyan-400' },
  { name: 'Sunset', value: 'from-orange-500 to-pink-500' },
  { name: 'Forest', value: 'from-green-500 to-emerald-400' },
  { name: 'Purple Dream', value: 'from-purple-500 to-violet-400' },
  { name: 'Coral Reef', value: 'from-coral to-brand-teal' },
  { name: 'Golden Hour', value: 'from-yellow-400 to-orange-400' },
  { name: 'Night Sky', value: 'from-slate-800 to-slate-600' },
  { name: 'Rose Garden', value: 'from-pink-400 to-rose-300' },
  { name: 'Lavender Fields', value: 'from-purple-400 to-indigo-300' },
  { name: 'Mint Fresh', value: 'from-emerald-400 to-teal-300' },
  { name: 'Autumn Sunset', value: 'from-orange-400 to-amber-300' },
];

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
  const [backgroundColor, setBackgroundColor] = useState(userProfile?.background_color || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDisplayName(userProfile?.display_name || '');
    setAvatarUrl(userProfile?.avatar_url || '');
    setBackgroundColor(userProfile?.background_color || '');
  }, [userProfile]);

  const handleIconSelect = (icon: string) => {
    console.log('Icon selected:', icon);
    setAvatarUrl(icon);
  };

  const handleClearIcon = () => {
    setAvatarUrl('');
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not found",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Saving profile for user:', user.id);
      console.log('Profile data:', {
        display_name: displayName || null,
        avatar_url: avatarUrl || null,
        background_color: backgroundColor || null,
      });

      // Use upsert to handle both insert and update cases
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: displayName || null,
          avatar_url: avatarUrl || null,
          background_color: backgroundColor || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving profile:', error);
        throw error;
      }

      console.log('Profile saved successfully');

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully",
      });

      onProfileUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Provide more specific error messages
      let errorMessage = "Failed to update profile. Please try again.";
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = `Update failed: ${error.message}`;
      }
      
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initials = (displayName || user.email || 'U').charAt(0).toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your display name, choose a fun pool icon, and customize your background
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pb-4">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
                {avatarUrl ? (
                  <div className={`w-full h-full flex items-center justify-center text-5xl rounded-full ${
                    backgroundColor ? `bg-gradient-to-br ${backgroundColor}` : 'bg-gradient-to-br from-brand-teal/20 to-coral/20'
                  }`}>
                    {avatarUrl}
                  </div>
                ) : (
                  <AvatarFallback className={`text-2xl text-white ${
                    backgroundColor ? `bg-gradient-to-br ${backgroundColor}` : 'bg-gradient-to-br from-coral to-brand-teal'
                  }`}>
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

          {/* Background Color */}
          <div className="space-y-2">
            <Label>Background Color</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {backgroundColors.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  className={`p-3 rounded-lg border-2 transition-all ${
                    backgroundColor === color.value
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setBackgroundColor(color.value)}
                >
                  <div className={`w-full h-8 rounded ${
                    color.value ? `bg-gradient-to-br ${color.value}` : 'bg-gradient-to-br from-brand-teal/20 to-coral/20'
                  }`} />
                  <div className="text-xs mt-1 text-center">{color.name}</div>
                </button>
              ))}
            </div>
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
