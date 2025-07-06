import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Smile } from 'lucide-react';
import { BigBrotherEmojis } from '@/components/chat/BigBrotherEmojis';

interface ChatInputProps {
  newMessage: string;
  onMessageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  showEmojis: boolean;
  onToggleEmojis: () => void;
  onEmojiSelect: (emoji: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  newMessage,
  onMessageChange,
  onSendMessage,
  onKeyPress,
  showEmojis,
  onToggleEmojis,
  onEmojiSelect
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEmojiSelect = (emoji: string) => {
    onEmojiSelect(emoji);
    inputRef.current?.focus();
  };

  return (
    <Card className="rounded-none border-x-0 border-b-0 bg-gradient-to-r from-background to-muted/20">
      <CardContent className="p-4 relative">
        <BigBrotherEmojis 
          isOpen={showEmojis}
          onEmojiSelect={handleEmojiSelect}
        />
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleEmojis}
            className="shrink-0 hover:bg-primary/10"
          >
            <Smile className="h-4 w-4 text-primary" />
          </Button>
          <Input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={onMessageChange}
            onKeyPress={onKeyPress}
            placeholder="Type a message... Use @ to mention someone"
            className="flex-1 border-primary/20 focus:border-primary/40"
            maxLength={1000}
          />
          <Button
            onClick={onSendMessage}
            disabled={!newMessage.trim()}
            size="icon"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Press Enter to send, Shift+Enter for new line
        </div>
      </CardContent>
    </Card>
  );
};