import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Heart, Trophy, Zap, Smile, ThumbsUp } from 'lucide-react';

interface GifItem {
  id: string;
  url: string;
  title: string;
  preview_url: string;
  category: string;
}

interface GifCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  gifs: GifItem[];
}

interface EnhancedGifPickerProps {
  isOpen: boolean;
  onGifSelect: (gifUrl: string) => void;
  onClose: () => void;
}

export const EnhancedGifPicker: React.FC<EnhancedGifPickerProps> = ({
  isOpen,
  onGifSelect,
  onClose
}) => {
  const [activeCategory, setActiveCategory] = useState('reactions');

  const gifCategories: GifCategory[] = [
    {
      id: 'reactions',
      name: 'Reactions',
      icon: Smile,
      gifs: [
        { id: '1', url: 'https://media.giphy.com/media/l0MYGb8Ka6cjcDqbS/giphy.gif', title: 'Excited', preview_url: 'https://media.giphy.com/media/l0MYGb8Ka6cjcDqbS/200w.gif', category: 'reactions' },
        { id: '6', url: 'https://media.giphy.com/media/3oKIPf3C7HqqYBVcCk/giphy.gif', title: 'Shocked', preview_url: 'https://media.giphy.com/media/3oKIPf3C7HqqYBVcCk/200w.gif', category: 'reactions' },
        { id: '7', url: 'https://media.giphy.com/media/l0MYJlFoXdAzskM5G/giphy.gif', title: 'Mind Blown', preview_url: 'https://media.giphy.com/media/l0MYJlFoXdAzskM5G/200w.gif', category: 'reactions' },
        { id: '8', url: 'https://media.giphy.com/media/3oKIPa2TdahY8LAAxy/giphy.gif', title: 'Eye Roll', preview_url: 'https://media.giphy.com/media/3oKIPa2TdahY8LAAxy/200w.gif', category: 'reactions' },
        { id: '9', url: 'https://media.giphy.com/media/l0MYzTq4gvPdaWYZa/giphy.gif', title: 'Thinking', preview_url: 'https://media.giphy.com/media/l0MYzTq4gvPdaWYZa/200w.gif', category: 'reactions' },
        { id: '14', url: 'https://media.giphy.com/media/l0MYP6WAFfaR7Q1jO/giphy.gif', title: 'Confused', preview_url: 'https://media.giphy.com/media/l0MYP6WAFfaR7Q1jO/200w.gif', category: 'reactions' },
        { id: '15', url: 'https://media.giphy.com/media/3oKIPnAi1GG8kN7S96/giphy.gif', title: 'Disappointed', preview_url: 'https://media.giphy.com/media/3oKIPnAi1GG8kN7S96/200w.gif', category: 'reactions' },
        { id: '16', url: 'https://media.giphy.com/media/l0MYrLY3ksRmTXTC0/giphy.gif', title: 'Laugh', preview_url: 'https://media.giphy.com/media/l0MYrLY3ksRmTXTC0/200w.gif', category: 'reactions' },
        { id: '17', url: 'https://media.giphy.com/media/3oKIPtSxFEqwKH9rQA/giphy.gif', title: 'Laughing Hard', preview_url: 'https://media.giphy.com/media/3oKIPtSxFEqwKH9rQA/200w.gif', category: 'reactions' },
        { id: '18', url: 'https://media.giphy.com/media/3o6UBlHJQT19wSgJQk/giphy.gif', title: 'Crying', preview_url: 'https://media.giphy.com/media/3o6UBlHJQT19wSgJQk/200w.gif', category: 'reactions' },
        { id: '19', url: 'https://media.giphy.com/media/l0MYEqEzwMWFCg8rm/giphy.gif', title: 'Facepalm', preview_url: 'https://media.giphy.com/media/l0MYEqEzwMWFCg8rm/200w.gif', category: 'reactions' },
        { id: '20', url: 'https://media.giphy.com/media/3o6fJgDKIa7hHppVjO/giphy.gif', title: 'Surprised', preview_url: 'https://media.giphy.com/media/3o6fJgDKIa7hHppVjO/200w.gif', category: 'reactions' }
      ]
    },
    {
      id: 'celebrations',
      name: 'Celebrations',
      icon: Trophy,
      gifs: [
        { id: '3', url: 'https://media.giphy.com/media/26BRrSvJUa0crqw4E/giphy.gif', title: 'Clap', preview_url: 'https://media.giphy.com/media/26BRrSvJUa0crqw4E/200w.gif', category: 'celebrations' },
        { id: '5', url: 'https://media.giphy.com/media/3o6Zt4HU9uwXmXSAuI/giphy.gif', title: 'Dance', preview_url: 'https://media.giphy.com/media/3o6Zt4HU9uwXmXSAuI/200w.gif', category: 'celebrations' },
        { id: '10', url: 'https://media.giphy.com/media/3o7TKF1fSIs1R19B8k/giphy.gif', title: 'Cheering', preview_url: 'https://media.giphy.com/media/3o7TKF1fSIs1R19B8k/200w.gif', category: 'celebrations' },
        { id: '13', url: 'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif', title: 'Applause', preview_url: 'https://media.giphy.com/media/l3q2K5jinAlChoCLS/200w.gif', category: 'celebrations' },
        { id: '21', url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif', title: 'Victory Dance', preview_url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/200w.gif', category: 'celebrations' },
        { id: '22', url: 'https://media.giphy.com/media/3oz8xAFtqoOUUrsh7W/giphy.gif', title: 'Celebration', preview_url: 'https://media.giphy.com/media/3oz8xAFtqoOUUrsh7W/200w.gif', category: 'celebrations' },
        { id: '23', url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif', title: 'Party Time', preview_url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/200w.gif', category: 'celebrations' },
        { id: '24', url: 'https://media.giphy.com/media/Is1O1TWV0LEJi/giphy.gif', title: 'Happy Dance', preview_url: 'https://media.giphy.com/media/Is1O1TWV0LEJi/200w.gif', category: 'celebrations' },
        { id: '25', url: 'https://media.giphy.com/media/3o7qDEZ1eVdAmM6GgM/giphy.gif', title: 'Winner', preview_url: 'https://media.giphy.com/media/3o7qDEZ1eVdAmM6GgM/200w.gif', category: 'celebrations' },
        { id: '26', url: 'https://media.giphy.com/media/3oKIPbNb1vWdftiVLq/giphy.gif', title: 'Success', preview_url: 'https://media.giphy.com/media/3oKIPbNb1vWdftiVLq/200w.gif', category: 'celebrations' }
      ]
    },
    {
      id: 'competition',
      name: 'Competition',
      icon: Zap,
      gifs: [
        { id: '27', url: 'https://media.giphy.com/media/l0MYGb8Ka6cjcDqbS/giphy.gif', title: 'Game On', preview_url: 'https://media.giphy.com/media/l0MYGb8Ka6cjcDqbS/200w.gif', category: 'competition' },
        { id: '28', url: 'https://media.giphy.com/media/3o7TKO4OOBT6Wj3TlC/giphy.gif', title: 'Challenge Accepted', preview_url: 'https://media.giphy.com/media/3o7TKO4OOBT6Wj3TlC/200w.gif', category: 'competition' },
        { id: '29', url: 'https://media.giphy.com/media/3oz8xIsloV7zOmt81G/giphy.gif', title: 'Intense', preview_url: 'https://media.giphy.com/media/3oz8xIsloV7zOmt81G/200w.gif', category: 'competition' },
        { id: '30', url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', title: 'Thumbs Up', preview_url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/200w.gif', category: 'competition' },
        { id: '31', url: 'https://media.giphy.com/media/3o6fJ1BM7R2EBRDnxK/giphy.gif', title: 'Bring It On', preview_url: 'https://media.giphy.com/media/3o6fJ1BM7R2EBRDnxK/200w.gif', category: 'competition' },
        { id: '32', url: 'https://media.giphy.com/media/3o7btNa0RUYa5E7iiQ/giphy.gif', title: 'Focused', preview_url: 'https://media.giphy.com/media/3o7btNa0RUYa5E7iiQ/200w.gif', category: 'competition' },
        { id: '33', url: 'https://media.giphy.com/media/l0MYO7fl7UepFLdmw/giphy.gif', title: 'Strategy', preview_url: 'https://media.giphy.com/media/l0MYO7fl7UepFLdmw/200w.gif', category: 'competition' },
        { id: '34', url: 'https://media.giphy.com/media/3o6fJeAiIpk5EeoC8o/giphy.gif', title: 'Determined', preview_url: 'https://media.giphy.com/media/3o6fJeAiIpk5EeoC8o/200w.gif', category: 'competition' }
      ]
    },
    {
      id: 'bigbrother',
      name: 'Big Brother',
      icon: Heart,
      gifs: [
        { id: '35', url: 'https://media.giphy.com/media/3oKIPf3C7HqqYBVcCk/giphy.gif', title: 'House Meeting', preview_url: 'https://media.giphy.com/media/3oKIPf3C7HqqYBVcCk/200w.gif', category: 'bigbrother' },
        { id: '36', url: 'https://media.giphy.com/media/l0MYJlFoXdAzskM5G/giphy.gif', title: 'Diary Room', preview_url: 'https://media.giphy.com/media/l0MYJlFoXdAzskM5G/200w.gif', category: 'bigbrother' },
        { id: '37', url: 'https://media.giphy.com/media/3oKIPa2TdahY8LAAxy/giphy.gif', title: 'Eviction Night', preview_url: 'https://media.giphy.com/media/3oKIPa2TdahY8LAAxy/200w.gif', category: 'bigbrother' },
        { id: '38', url: 'https://media.giphy.com/media/l0MYzTq4gvPdaWYZa/giphy.gif', title: 'HOH Winner', preview_url: 'https://media.giphy.com/media/l0MYzTq4gvPdaWYZa/200w.gif', category: 'bigbrother' },
        { id: '39', url: 'https://media.giphy.com/media/l0MYP6WAFfaR7Q1jO/giphy.gif', title: 'Power of Veto', preview_url: 'https://media.giphy.com/media/l0MYP6WAFfaR7Q1jO/200w.gif', category: 'bigbrother' },
        { id: '40', url: 'https://media.giphy.com/media/3oKIPnAi1GG8kN7S96/giphy.gif', title: 'Alliance', preview_url: 'https://media.giphy.com/media/3oKIPnAi1GG8kN7S96/200w.gif', category: 'bigbrother' },
        { id: '41', url: 'https://media.giphy.com/media/l0MYrLY3ksRmTXTC0/giphy.gif', title: 'Backstab', preview_url: 'https://media.giphy.com/media/l0MYrLY3ksRmTXTC0/200w.gif', category: 'bigbrother' },
        { id: '42', url: 'https://media.giphy.com/media/3oKIPtSxFEqwKH9rQA/giphy.gif', title: 'Jury House', preview_url: 'https://media.giphy.com/media/3oKIPtSxFEqwKH9rQA/200w.gif', category: 'bigbrother' }
      ]
    },
    {
      id: 'positive',
      name: 'Positive',
      icon: ThumbsUp,
      gifs: [
        { id: '43', url: 'https://media.giphy.com/media/3o6UBlHJQT19wSgJQk/giphy.gif', title: 'Good Job', preview_url: 'https://media.giphy.com/media/3o6UBlHJQT19wSgJQk/200w.gif', category: 'positive' },
        { id: '44', url: 'https://media.giphy.com/media/l0MYEqEzwMWFCg8rm/giphy.gif', title: 'Great Work', preview_url: 'https://media.giphy.com/media/l0MYEqEzwMWFCg8rm/200w.gif', category: 'positive' },
        { id: '45', url: 'https://media.giphy.com/media/3o6fJgDKIa7hHppVjO/giphy.gif', title: 'Amazing', preview_url: 'https://media.giphy.com/media/3o6fJgDKIa7hHppVjO/200w.gif', category: 'positive' },
        { id: '46', url: 'https://media.giphy.com/media/l0MYB1L7sQ3E9fQmk/giphy.gif', title: 'Awesome', preview_url: 'https://media.giphy.com/media/l0MYB1L7sQ3E9fQmk/200w.gif', category: 'positive' },
        { id: '47', url: 'https://media.giphy.com/media/3o7TKF1fSIs1R19B8k/giphy.gif', title: 'Perfect', preview_url: 'https://media.giphy.com/media/3o7TKF1fSIs1R19B8k/200w.gif', category: 'positive' },
        { id: '48', url: 'https://media.giphy.com/media/l0MYxKqF6uKkHqmvC/giphy.gif', title: 'Love It', preview_url: 'https://media.giphy.com/media/l0MYxKqF6uKkHqmvC/200w.gif', category: 'positive' },
        { id: '49', url: 'https://media.giphy.com/media/3o6UBiK8xJb0C6T5AY/giphy.gif', title: 'Fantastic', preview_url: 'https://media.giphy.com/media/3o6UBiK8xJb0C6T5AY/200w.gif', category: 'positive' },
        { id: '50', url: 'https://media.giphy.com/media/l0MYRKqC5xdZD6t8Y/giphy.gif', title: 'Brilliant', preview_url: 'https://media.giphy.com/media/l0MYRKqC5xdZD6t8Y/200w.gif', category: 'positive' }
      ]
    }
  ];

  const activeGifs = gifCategories.find(cat => cat.id === activeCategory)?.gifs || [];

  if (!isOpen) return null;

  return (
    <Card className="absolute bottom-full left-0 right-0 mb-2 z-50 h-[500px] overflow-hidden shadow-xl border-primary/20">
      <CardContent className="p-0 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-base">Choose a GIF</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Category Tabs */}
        <div className="flex border-b border-border bg-muted/30">
          {gifCategories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/50 ${
                  activeCategory === category.id
                    ? 'border-b-2 border-primary text-primary bg-background'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* GIF Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-3">
            {activeGifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => {
                  onGifSelect(gif.url);
                  onClose();
                }}
                className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-primary/60 hover:scale-105 transition-all duration-200 bg-muted/20"
                title={gif.title}
              >
                <img
                  src={gif.preview_url}
                  alt={gif.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            Click any GIF to send • {activeGifs.length} GIFs in {gifCategories.find(cat => cat.id === activeCategory)?.name}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};