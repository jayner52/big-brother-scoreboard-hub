import React, { useRef, useEffect, useState } from 'react';
import { MessageCircle, Waves, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage as ChatMessageType } from '@/hooks/useChat';
import { PoolsideMessageBubble } from './PoolsideMessageBubble';
import { useIsMobile } from '@/hooks/use-mobile';

interface BrandedChatContainerProps {
  messages: ChatMessageType[];
  loading: boolean;
  userId: string | null;
  onDeleteMessage?: (messageId: string) => Promise<boolean>;
}

export const BrandedChatContainer: React.FC<BrandedChatContainerProps> = ({
  messages,
  loading,
  userId,
  onDeleteMessage
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const isMobile = useIsMobile();

  // Smooth auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
  }, [messages]);

  // Show/hide scroll to bottom button on mobile
  useEffect(() => {
    if (!isMobile) return;

    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isAtBottom && messages.length > 0);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isMobile, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      <div className="relative mb-6">
        <div className="absolute inset-0 animate-pulse">
          <Waves className="h-16 w-16 text-brand-teal/30" />
        </div>
        <MessageCircle className="h-16 w-16 text-brand-teal relative z-10" />
      </div>
      <h3 className="text-xl font-bold text-dark font-rounded mb-2">
        No messages yet! 
      </h3>
      <p className="text-muted-foreground font-rounded text-lg">
        Break the ice 🏊‍♀️ Start the conversation!
      </p>
      <div className="mt-4 text-sm text-brand-teal font-rounded">
        Share your picks, strategies, and Big Brother thoughts
      </div>
    </div>
  );

  const LoadingState = () => (
    <div className="flex items-center justify-center h-full">
      <div className="flex items-center gap-3 text-brand-teal">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-teal border-t-transparent"></div>
        <span className="font-rounded text-lg">Loading pool chat...</span>
      </div>
    </div>
  );

  return (
    <div className="
      flex-1 
      bg-cream
      relative 
      overflow-hidden
    ">
      {/* Subtle pool wave pattern background */}
      <div className="
        absolute inset-0 
        opacity-[0.02]
        bg-gradient-to-br from-brand-teal via-transparent to-coral
        pointer-events-none
      " />
      
      {/* Floating wave decorations */}
      <div className="absolute top-4 right-8 opacity-5 pointer-events-none">
        <Waves className="h-24 w-24 text-brand-teal rotate-12" />
      </div>
      <div className="absolute bottom-20 left-8 opacity-5 pointer-events-none">
        <Waves className="h-32 w-32 text-coral -rotate-12" />
      </div>

      {/* Messages Container */}
      <div 
        ref={containerRef}
        className={`
          h-full chat-container
          overflow-y-auto 
          space-y-4
          scroll-smooth
          ${isMobile ? 'px-3 py-4 pb-safe-4' : 'px-4 py-6 pb-6'}
        `}
      >
        {loading ? (
          <LoadingState />
        ) : messages.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Welcome message for first chat */}
            {messages.length === 1 && (
              <div className="text-center mb-6 py-4">
                <div className="bg-white/60 rounded-xl p-4 inline-block border border-brand-teal/20">
                  <p className="text-brand-teal font-rounded font-medium">
                    🏊‍♀️ Welcome to the Poolside Chat! 🏊‍♂️
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 font-rounded">
                    Share your Big Brother insights and connect with your pool
                  </p>
                </div>
              </div>
            )}

            {/* Message bubbles with slide-in animation */}
            {messages.map((msg, index) => (
              <div 
                key={msg.id}
                className="animate-slide-up"
                style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}
              >
                <PoolsideMessageBubble
                  message={msg} 
                  isOwn={msg.user_id === userId}
                  isMentioned={msg.mentioned_user_ids?.includes(userId || '')}
                  currentUserId={userId || ''}
                  onDelete={onDeleteMessage}
                />
              </div>
            ))}
            
            {/* Scroll anchor */}
            <div ref={messagesEndRef} className="h-1" />
          </>
        )}
      </div>

      {/* Mobile Scroll to Bottom Button */}
      {isMobile && showScrollButton && (
        <Button
          onClick={scrollToBottom}
          size="icon"
          className="
            fixed bottom-24 right-4 z-30
            h-12 w-12 rounded-full
            bg-brand-teal hover:bg-brand-teal/90
            shadow-lg border-2 border-white
            transition-all duration-200
            hover:scale-105 active:scale-95
          "
        >
          <ArrowDown className="h-5 w-5 text-white" />
        </Button>
      )}
    </div>
  );
};