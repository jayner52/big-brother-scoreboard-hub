import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Smile } from 'lucide-react';

interface BigBrotherEmojisProps {
  onEmojiSelect: (emoji: string) => void;
  isOpen: boolean;
}

export const BigBrotherEmojis: React.FC<BigBrotherEmojisProps> = ({
  onEmojiSelect,
  isOpen
}) => {
  const bigBrotherEmojis = [
    { emoji: '👁️', name: 'Big Brother Eye' },
    { emoji: '🏠', name: 'House' },
    { emoji: '🔥', name: 'Fire/Drama' },
    { emoji: '👑', name: 'HOH Crown' },
    { emoji: '🎯', name: 'Target' },
    { emoji: '⚔️', name: 'Battle/Competition' },
    { emoji: '🤝', name: 'Alliance' },
    { emoji: '💣', name: 'Bomb/Betrayal' },
    { emoji: '🎭', name: 'Strategy/Acting' },
    { emoji: '💪', name: 'Strength/Comp Beast' },
    { emoji: '🧠', name: 'Mastermind' },
    { emoji: '👥', name: 'Showmance' },
    { emoji: '🚪', name: 'Eviction Door' },
    { emoji: '📢', name: 'Diary Room' },
    { emoji: '🎪', name: 'Circus/Drama' },
    { emoji: '🐍', name: 'Snake/Backstabber' },
    { emoji: '🎲', name: 'Game/Risk' },
    { emoji: '💎', name: 'Golden Power of Veto' },
    { emoji: '🔑', name: 'Key/Power' },
    { emoji: '⭐', name: 'Star Player' },
    { emoji: '🎬', name: 'Show/Performance' },
    { emoji: '🌪️', name: 'Chaos' },
    { emoji: '🔒', name: 'Locked In' },
    { emoji: '💰', name: 'Prize Money' }
  ];

  if (!isOpen) return null;

  return (
    <Card className="absolute bottom-12 left-0 w-80 z-50 shadow-xl border-primary/20">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <Smile className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Big Brother Emojis</span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {bigBrotherEmojis.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 hover:bg-primary/10 transition-colors"
              onClick={() => onEmojiSelect(item.emoji)}
              title={item.name}
            >
              <span className="text-lg">{item.emoji}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};