import React, { useState, useEffect } from 'react';
import { ChatMessage as ChatMessageType } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { DeleteConfirmDialog } from '@/components/chat/DeleteConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PoolsideMessageBubbleProps {
  message: ChatMessageType;
  isOwn: boolean;
  isMentioned: boolean;
  currentUserId: string;
  onDelete?: (messageId: string) => Promise<boolean>;
}

export const PoolsideMessageBubble: React.FC<PoolsideMessageBubbleProps> = ({ 
  message, 
  isOwn, 
  isMentioned,
  currentUserId,
  onDelete 
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    display_name?: string;
    avatar_url?: string;
    background_color?: string;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, avatar_url, background_color')
          .eq('user_id', message.user_id)
          .maybeSingle();
        
        setUserProfile(profile);
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    loadUserProfile();
  }, [message.user_id]);

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch {
      return '';
    }
  };

  const handleDeleteConfirm = async () => {
    if (onDelete) {
      const success = await onDelete(message.id);
      if (success) {
        toast({
          title: "Message deleted",
          description: "Your message has been deleted successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete message. Please try again.",
          variant: "destructive",
        });
      }
    }
    setShowDeleteDialog(false);
  };

  const isGifMessage = (text: string) => {
    return text.includes('giphy.com') && (text.endsWith('.gif') || text.includes('/giphy.gif'));
  };

  const renderMessageContent = () => {
    const text = message.message;
    
    if (isGifMessage(text) && !imageError) {
      return (
        <div className="gif-container">
          <img 
            src={text} 
            alt="GIF" 
            className="max-w-[250px] max-h-[250px] rounded-lg shadow-sm object-contain"
            loading="lazy"
            onError={() => setImageError(true)}
            style={{ width: 'auto', height: 'auto' }}
          />
        </div>
      );
    }
    
    // Regular text message with mention highlighting
    const mentionRegex = /@(\w+)/g;
    const processedText = text.replace(mentionRegex, '<span class="bg-brand-teal/20 text-brand-teal px-1.5 py-0.5 rounded-md text-sm font-medium">@$1</span>');
    
    return (
      <div 
        className="text-sm leading-relaxed font-rounded"
        dangerouslySetInnerHTML={{ __html: processedText }}
      />
    );
  };

  // Bubble styling based on message type
  const getBubbleStyles = () => {
    if (isMentioned) {
      return 'bg-yellow/20 border-2 border-yellow/40 text-dark shadow-lg';
    }
    
    if (isOwn) {
      return 'bg-coral text-white shadow-md';
    }
    
    return 'bg-white text-dark shadow-sm border border-border/20';
  };

  const getAlignment = () => isOwn ? 'ml-auto' : 'mr-auto';

  return (
    <div className={`
      ${getBubbleStyles()} 
      ${getAlignment()} 
      max-w-[75%] sm:max-w-[60%] 
      rounded-2xl p-4 
      relative group 
      transition-all duration-200 
      hover:shadow-lg
      animate-fade-in
    `}>
      {/* Mention indicator */}
      {isMentioned && (
        <div className="absolute -left-1 top-2 bottom-2 w-1 bg-yellow rounded-full" />
      )}
      
      <div className="flex items-start gap-3">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <Avatar className="w-8 h-8">
            {userProfile?.avatar_url ? (
              <div className={`w-full h-full flex items-center justify-center text-lg rounded-full ${
                userProfile.background_color ? `bg-gradient-to-br ${userProfile.background_color}` : 'bg-gradient-to-br from-brand-teal/20 to-coral/20'
              }`}>
                {userProfile.avatar_url}
              </div>
            ) : (
              <AvatarFallback className={`text-xs text-white ${
                userProfile?.background_color ? `bg-gradient-to-br ${userProfile.background_color}` : 'bg-gradient-to-br from-coral to-brand-teal'
              }`}>
                {(userProfile?.display_name || message.user_name || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header with username and timestamp */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`
              font-bold text-sm font-rounded
              ${isOwn ? 'text-white/90' : 'text-dark'}
            `}>
              {userProfile?.display_name || message.user_name}
            </span>
            <span className={`
              text-xs opacity-70 
              ${isOwn ? 'text-white/70' : 'text-muted-foreground'}
            `}>
              {formatTime(message.created_at)}
            </span>
            {message.is_edited && (
              <span className={`
                text-xs italic opacity-60
                ${isOwn ? 'text-white/60' : 'text-muted-foreground'}
              `}>
                (edited)
              </span>
            )}
          </div>
          
          {/* Message content */}
          <div className={isOwn && !isGifMessage(message.message) ? 'text-white' : ''}>
            {renderMessageContent()}
          </div>
        </div>
        
        {/* Delete button */}
        {isOwn && onDelete && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowDeleteDialog(true)}
            className={`
              opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0
              ${isOwn 
                ? 'text-white/70 hover:text-white hover:bg-white/20' 
                : 'text-red-500 hover:text-red-700 hover:bg-red-50'
              }
            `}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
};