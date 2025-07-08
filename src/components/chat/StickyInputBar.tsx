import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Smile, Image } from 'lucide-react';
import { BigBrotherEmojis } from '@/components/chat/BigBrotherEmojis';
import { EnhancedGifPicker } from '@/components/chat/EnhancedGifPicker';
import { useIsMobile } from '@/hooks/use-mobile';

interface StickyInputBarProps {
  newMessage: string;
  onMessageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  showEmojis: boolean;
  onToggleEmojis: () => void;
  onEmojiSelect: (emoji: string) => void;
  showGifs: boolean;
  onToggleGifs: () => void;
  onGifSelect: (gifUrl: string) => void;
}

export const StickyInputBar: React.FC<StickyInputBarProps> = ({
  newMessage,
  onMessageChange,
  onSendMessage,
  onKeyPress,
  showEmojis,
  onToggleEmojis,
  onEmojiSelect,
  showGifs,
  onToggleGifs,
  onGifSelect
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const handleEmojiSelect = (emoji: string) => {
    onEmojiSelect(emoji);
    inputRef.current?.focus();
  };

  return (
    <div className={`
      sticky bottom-0 
      bg-cream/95 backdrop-blur-md 
      border-t-2 border-brand-teal 
      shadow-[0_-2px_10px_rgba(0,0,0,0.1)]
      z-20
      ${isMobile ? 'p-3 pb-safe' : 'p-4'}
    `}>
      {/* Emoji and GIF Pickers */}
      <div className="relative">
        <BigBrotherEmojis 
          isOpen={showEmojis}
          onEmojiSelect={handleEmojiSelect}
        />
        <EnhancedGifPicker
          isOpen={showGifs}
          onGifSelect={onGifSelect}
          onClose={onToggleGifs}
        />
      </div>

      {/* Input Controls */}
      <div className={`flex items-center chat-input-container ${isMobile ? 'gap-2' : 'gap-3'}`}>
        {/* Emoji Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleEmojis}
          className={`
            shrink-0 text-brand-teal
            hover:bg-brand-teal/10 
            transition-all duration-200
            hover:scale-105
            active:scale-95
            ${isMobile ? 'h-12 w-12' : 'h-10 w-10'}
          `}
        >
          <Smile className={isMobile ? "h-6 w-6" : "h-5 w-5"} />
        </Button>

        {/* GIF Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleGifs}
          className={`
            shrink-0 text-brand-teal
            hover:bg-brand-teal/10 
            transition-all duration-200
            hover:scale-105
            active:scale-95
            ${isMobile ? 'h-12 w-12' : 'h-10 w-10'}
          `}
        >
          <Image className={isMobile ? "h-6 w-6" : "h-5 w-5"} />
        </Button>

        {/* Message Input */}
        <Input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={onMessageChange}
          onKeyPress={onKeyPress}
          placeholder={isMobile ? "Type a message... 🏊" : "Type a message... Use @ to mention someone 🏊"}
          className={`
            flex-1 chat-input
            border-2 border-brand-teal/20 
            focus:border-brand-teal 
            rounded-full
            bg-white
            font-rounded
            placeholder:text-muted-foreground/60
            text-dark
            transition-all duration-200
            focus:ring-2 focus:ring-brand-teal/20
            focus:shadow-md
            ${isMobile ? 'h-14 text-lg px-5' : 'h-12 text-base px-4'}
          `}
          style={{ fontSize: isMobile ? '18px' : '16px' }} // Prevent iOS zoom, better mobile UX
          maxLength={1000}
        />

        {/* Send Button */}
        <Button
          onClick={onSendMessage}
          disabled={!newMessage.trim()}
          size="icon"
          className={`
            rounded-full
            bg-gradient-to-r from-coral to-coral/80 
            hover:from-coral/90 hover:to-coral/70 
            shadow-lg
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            hover:scale-105
            active:scale-95
            ${isMobile ? 'h-14 w-14' : 'h-12 w-12'}
          `}
        >
          <Send className={`text-white ${isMobile ? 'h-6 w-6' : 'h-5 w-5'}`} />
        </Button>
      </div>

      {/* Helper Text - Hide on mobile to save space */}
      {!isMobile && (
        <div className="text-xs text-muted-foreground mt-2 text-center font-rounded">
          Press <kbd className="bg-white/50 px-1 rounded text-dark">Enter</kbd> to send • <kbd className="bg-white/50 px-1 rounded text-dark">Shift+Enter</kbd> for new line
        </div>
      )}
    </div>
  );
};