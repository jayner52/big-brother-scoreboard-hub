import React, { useState } from 'react';
import { ChatMessage as ChatMessageType } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { DeleteConfirmDialog } from '@/components/chat/DeleteConfirmDialog';
import { useToast } from '@/hooks/use-toast';

interface ChatMessageProps {
  message: ChatMessageType;
  isOwn: boolean;
  isMentioned: boolean;
  currentUserId: string;
  onDelete?: (messageId: string) => Promise<boolean>;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isOwn, 
  isMentioned,
  currentUserId,
  onDelete 
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const bgColor = isMentioned 
    ? 'bg-yellow-50 border-yellow-200' 
    : isOwn 
      ? 'bg-primary/5 border-primary/20' 
      : 'bg-muted/50 border-border';

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

  const renderMessageText = (text: string) => {
    // Check if message is a GIF URL
    if (text.includes('giphy.com') && (text.endsWith('.gif') || text.includes('/giphy.gif'))) {
      return `<img src="${text}" alt="GIF" class="max-w-48 max-h-48 rounded-md mt-1" loading="lazy" />`;
    }
    
    // Simple mention highlighting
    const mentionRegex = /@(\w+)/g;
    return text.replace(mentionRegex, '<span class="bg-primary/20 text-primary px-1 rounded text-sm font-medium">@$1</span>');
  };

  return (
    <div className={`p-3 rounded-lg border ${bgColor} ${isOwn ? 'ml-auto' : 'mr-auto'} max-w-[70%] relative group`}>
      {isMentioned && (
        <div className="absolute -left-1 top-0 bottom-0 w-1 bg-yellow-400 rounded-l-lg" />
      )}
      
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-foreground">
              {message.user_name}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.created_at)}
            </span>
            {message.is_edited && (
              <span className="text-xs text-muted-foreground italic">(edited)</span>
            )}
          </div>
          <div 
            className="text-sm whitespace-pre-wrap text-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: renderMessageText(message.message) 
            }}
          />
        </div>
        
        {isOwn && onDelete && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowDeleteDialog(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
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