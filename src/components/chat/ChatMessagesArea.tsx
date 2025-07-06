import React, { useRef, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/hooks/useChat';
import { ChatMessage } from '@/components/chat/ChatMessage';

interface ChatMessagesAreaProps {
  messages: ChatMessageType[];
  loading: boolean;
  userId: string | null;
  onDeleteMessage?: (messageId: string) => Promise<boolean>;
}

export const ChatMessagesArea: React.FC<ChatMessagesAreaProps> = ({
  messages,
  loading,
  userId,
  onDeleteMessage
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-muted/10 to-muted/30">
      {loading ? (
        <div className="text-center text-muted-foreground">Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No messages yet. Be the first to say hello!</p>
        </div>
      ) : (
        <>
          {messages.map((msg) => (
            <ChatMessage 
              key={msg.id} 
              message={msg} 
              isOwn={msg.user_id === userId}
              isMentioned={msg.mentioned_user_ids?.includes(userId || '')}
              currentUserId={userId || ''}
              onDelete={onDeleteMessage}
            />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};