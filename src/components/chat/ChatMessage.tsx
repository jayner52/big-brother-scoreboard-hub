import React from 'react';
import { ChatMessage as ChatMessageType } from '@/hooks/useChat';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: ChatMessageType;
  isOwn: boolean;
  isMentioned: boolean;
  currentUserId: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isOwn, 
  isMentioned,
  currentUserId 
}) => {
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

  const renderMessageText = (text: string) => {
    // Simple mention highlighting - could be enhanced with proper parsing
    const mentionRegex = /@(\w+)/g;
    return text.replace(mentionRegex, '<span class="bg-primary/20 text-primary px-1 rounded text-sm font-medium">@$1</span>');
  };

  return (
    <div className={`p-3 rounded-lg border ${bgColor} ${isOwn ? 'ml-auto' : 'mr-auto'} max-w-[70%] relative`}>
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
      </div>
    </div>
  );
};