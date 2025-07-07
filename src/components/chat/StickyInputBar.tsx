import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Smile, Image } from 'lucide-react';
import { BigBrotherEmojis } from '@/components/chat/BigBrotherEmojis';
import { EnhancedGifPicker } from '@/components/chat/EnhancedGifPicker';

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

  const handleEmojiSelect = (emoji: string) => {
    onEmojiSelect(emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="
      sticky bottom-0 
      bg-cream/95 backdrop-blur-md 
      border-t-2 border-brand-teal 
      p-4 
      shadow-[0_-2px_10px_rgba(0,0,0,0.1)]
      z-20
    ">
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
      <div className="flex items-center gap-3">
        {/* Emoji Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleEmojis}
          className="
            shrink-0 h-10 w-10
            hover:bg-brand-teal/10 
            text-brand-teal 
            transition-all duration-200
            hover:scale-105
          "
        >
          <Smile className="h-5 w-5" />
        </Button>

        {/* GIF Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleGifs}
          className="
            shrink-0 h-10 w-10
            hover:bg-brand-teal/10 
            text-brand-teal 
            transition-all duration-200
            hover:scale-105
          "
        >
          <Image className="h-5 w-5" />
        </Button>

        {/* Message Input */}
        <Input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={onMessageChange}
          onKeyPress={onKeyPress}
          placeholder="Type a message... Use @ to mention someone 🏊"
          className="
            flex-1 h-12
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
          "
          maxLength={1000}
        />

        {/* Send Button */}
        <Button
          onClick={onSendMessage}
          disabled={!newMessage.trim()}
          size="icon"
          className="
            h-12 w-12 rounded-full
            bg-gradient-to-r from-coral to-coral/80 
            hover:from-coral/90 hover:to-coral/70 
            shadow-lg
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            hover:scale-105
            active:scale-95
          "
        >
          <Send className="h-5 w-5 text-white" />
        </Button>
      </div>

      {/* Helper Text */}
      <div className="text-xs text-muted-foreground mt-2 text-center font-rounded">
        Press <kbd className="bg-white/50 px-1 rounded text-dark">Enter</kbd> to send • <kbd className="bg-white/50 px-1 rounded text-dark">Shift+Enter</kbd> for new line
      </div>
    </div>
  );
};