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

// Curated library of verified working GIFs from reliable sources
const VERIFIED_GIFS = {
  reactions: [
    { 
      id: '1', 
      url: 'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif', 
      title: 'Excited', 
      preview_url: 'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/200w.gif',
      category: 'reactions' 
    },
    { 
      id: '2', 
      url: 'https://media.giphy.com/media/3o72FcJmLzIdYJdmDe/giphy.gif', 
      title: 'Shocked', 
      preview_url: 'https://media.giphy.com/media/3o72FcJmLzIdYJdmDe/200w.gif',
      category: 'reactions' 
    },
    { 
      id: '3', 
      url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif', 
      title: 'Mind Blown', 
      preview_url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/200w.gif',
      category: 'reactions' 
    },
    { 
      id: '4', 
      url: 'https://media.giphy.com/media/Fjr6v88OPk7U4/giphy.gif', 
      title: 'Eye Roll', 
      preview_url: 'https://media.giphy.com/media/Fjr6v88OPk7U4/200w.gif',
      category: 'reactions' 
    },
    { 
      id: '5', 
      url: 'https://media.giphy.com/media/xTiTnGeUsWOEwsGoG4/giphy.gif', 
      title: 'Thinking', 
      preview_url: 'https://media.giphy.com/media/xTiTnGeUsWOEwsGoG4/200w.gif',
      category: 'reactions' 
    },
    { 
      id: '6', 
      url: 'https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif', 
      title: 'Laughing', 
      preview_url: 'https://media.giphy.com/media/10JhviFuU2gWD6/200w.gif',
      category: 'reactions' 
    },
    { 
      id: '7', 
      url: 'https://media.giphy.com/media/OPU6wzx8JrHna/giphy.gif', 
      title: 'Crying', 
      preview_url: 'https://media.giphy.com/media/OPU6wzx8JrHna/200w.gif',
      category: 'reactions' 
    },
    { 
      id: '8', 
      url: 'https://media.giphy.com/media/XuBJvrKHutnkQ/giphy.gif', 
      title: 'Facepalm', 
      preview_url: 'https://media.giphy.com/media/XuBJvrKHutnkQ/200w.gif',
      category: 'reactions' 
    }
  ],
  celebrations: [
    { 
      id: '9', 
      url: 'https://media.giphy.com/media/l0MYxKqF6uKkHqmvC/giphy.gif', 
      title: 'Clapping', 
      preview_url: 'https://media.giphy.com/media/l0MYxKqF6uKkHqmvC/200w.gif',
      category: 'celebrations' 
    },
    { 
      id: '10', 
      url: 'https://media.giphy.com/media/Is1O1TWV0LEJi/giphy.gif', 
      title: 'Victory Dance', 
      preview_url: 'https://media.giphy.com/media/Is1O1TWV0LEJi/200w.gif',
      category: 'celebrations' 
    },
    { 
      id: '11', 
      url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif', 
      title: 'Celebration', 
      preview_url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/200w.gif',
      category: 'celebrations' 
    },
    { 
      id: '12', 
      url: 'https://media.giphy.com/media/7rj2ZgttvgomY/giphy.gif', 
      title: 'Applause', 
      preview_url: 'https://media.giphy.com/media/7rj2ZgttvgomY/200w.gif',
      category: 'celebrations' 
    },
    { 
      id: '13', 
      url: 'https://media.giphy.com/media/3oKIPnAi1GG8kN7S96/giphy.gif', 
      title: 'Happy Dance', 
      preview_url: 'https://media.giphy.com/media/3oKIPnAi1GG8kN7S96/200w.gif',
      category: 'celebrations' 
    },
    { 
      id: '14', 
      url: 'https://media.giphy.com/media/26BRrSvJUa0crqw4E/giphy.gif', 
      title: 'Winner', 
      preview_url: 'https://media.giphy.com/media/26BRrSvJUa0crqw4E/200w.gif',
      category: 'celebrations' 
    }
  ],
  bigbrother: [
    { 
      id: '15', 
      url: 'https://media.giphy.com/media/26gsjCZpPolPr3sBy/giphy.gif', 
      title: 'Eviction', 
      preview_url: 'https://media.giphy.com/media/26gsjCZpPolPr3sBy/200w.gif',
      category: 'bigbrother' 
    },
    { 
      id: '16', 
      url: 'https://media.giphy.com/media/3o6ZsVl2hv8ZnhSXUQ/giphy.gif', 
      title: 'HOH Winner', 
      preview_url: 'https://media.giphy.com/media/3o6ZsVl2hv8ZnhSXUQ/200w.gif',
      category: 'bigbrother' 
    },
    { 
      id: '17', 
      url: 'https://media.giphy.com/media/xT1R9DPYQt60VHs4tW/giphy.gif', 
      title: 'Power of Veto', 
      preview_url: 'https://media.giphy.com/media/xT1R9DPYQt60VHs4tW/200w.gif',
      category: 'bigbrother' 
    },
    { 
      id: '18', 
      url: 'https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif', 
      title: 'Nomination', 
      preview_url: 'https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/200w.gif',
      category: 'bigbrother' 
    },
    { 
      id: '19', 
      url: 'https://media.giphy.com/media/l46Cy1rHbQ92uuLXa/giphy.gif', 
      title: 'Alliance', 
      preview_url: 'https://media.giphy.com/media/l46Cy1rHbQ92uuLXa/200w.gif',
      category: 'bigbrother' 
    },
    { 
      id: '20', 
      url: 'https://media.giphy.com/media/26gsjCZpPolPr3sBy/giphy.gif', 
      title: 'Drama', 
      preview_url: 'https://media.giphy.com/media/26gsjCZpPolPr3sBy/200w.gif',
      category: 'bigbrother' 
    }
  ],
  competition: [
    { 
      id: '21', 
      url: 'https://media.giphy.com/media/3o7absbD7PbTFQa0c8/giphy.gif', 
      title: 'Game On', 
      preview_url: 'https://media.giphy.com/media/3o7absbD7PbTFQa0c8/200w.gif',
      category: 'competition' 
    },
    { 
      id: '22', 
      url: 'https://media.giphy.com/media/BjHIjM2YFC3rEUaMrw/giphy.gif', 
      title: 'Challenge Accepted', 
      preview_url: 'https://media.giphy.com/media/BjHIjM2YFC3rEUaMrw/200w.gif',
      category: 'competition' 
    },
    { 
      id: '23', 
      url: 'https://media.giphy.com/media/3oKIPnAi1GG8kN7S96/giphy.gif', 
      title: 'Bring It On', 
      preview_url: 'https://media.giphy.com/media/3oKIPnAi1GG8kN7S96/200w.gif',
      category: 'competition' 
    },
    { 
      id: '24', 
      url: 'https://media.giphy.com/media/xT1XGU1AHz9Fe8tmp2/giphy.gif', 
      title: 'Focused', 
      preview_url: 'https://media.giphy.com/media/xT1XGU1AHz9Fe8tmp2/200w.gif',
      category: 'competition' 
    },
    { 
      id: '25', 
      url: 'https://media.giphy.com/media/kyLYXonQYYfwYDIeZl/giphy.gif', 
      title: 'Winning', 
      preview_url: 'https://media.giphy.com/media/kyLYXonQYYfwYDIeZl/200w.gif',
      category: 'competition' 
    },
    { 
      id: '26', 
      url: 'https://media.giphy.com/media/26ufcVAp3AiJJsrIs/giphy.gif', 
      title: 'Defeated', 
      preview_url: 'https://media.giphy.com/media/26ufcVAp3AiJJsrIs/200w.gif',
      category: 'competition' 
    }
  ],
  positive: [
    { 
      id: '27', 
      url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif', 
      title: 'Thumbs Up', 
      preview_url: 'https://media.giphy.com/media/111ebonMs90YLu/200w.gif',
      category: 'positive' 
    },
    { 
      id: '28', 
      url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', 
      title: 'Good Job', 
      preview_url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/200w.gif',
      category: 'positive' 
    },
    { 
      id: '29', 
      url: 'https://media.giphy.com/media/dM2xuxnJCg4H6/giphy.gif', 
      title: 'Amazing', 
      preview_url: 'https://media.giphy.com/media/dM2xuxnJCg4H6/200w.gif',
      category: 'positive' 
    },
    { 
      id: '30', 
      url: 'https://media.giphy.com/media/3o6fJ1BM7R2EBRDnxK/giphy.gif', 
      title: 'Awesome', 
      preview_url: 'https://media.giphy.com/media/3o6fJ1BM7R2EBRDnxK/200w.gif',
      category: 'positive' 
    },
    { 
      id: '31', 
      url: 'https://media.giphy.com/media/3o7abAHdYvZdBNnGZq/giphy.gif', 
      title: 'Perfect', 
      preview_url: 'https://media.giphy.com/media/3o7abAHdYvZdBNnGZq/200w.gif',
      category: 'positive' 
    },
    { 
      id: '32', 
      url: 'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif', 
      title: 'Love It', 
      preview_url: 'https://media.giphy.com/media/l3q2K5jinAlChoCLS/200w.gif',
      category: 'positive' 
    }
  ]
};

export const EnhancedGifPicker: React.FC<EnhancedGifPickerProps> = ({
  isOpen,
  onGifSelect,
  onClose
}) => {
  const [activeCategory, setActiveCategory] = useState('reactions');
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const gifCategories: GifCategory[] = [
    {
      id: 'reactions',
      name: 'Reactions',
      icon: Smile,
      gifs: VERIFIED_GIFS.reactions
    },
    {
      id: 'celebrations',
      name: 'Celebrations',
      icon: Trophy,
      gifs: VERIFIED_GIFS.celebrations
    },
    {
      id: 'bigbrother',
      name: 'Big Brother',
      icon: Heart,
      gifs: VERIFIED_GIFS.bigbrother
    },
    {
      id: 'competition',
      name: 'Competition',
      icon: Zap,
      gifs: VERIFIED_GIFS.competition
    },
    {
      id: 'positive',
      name: 'Positive',
      icon: ThumbsUp,
      gifs: VERIFIED_GIFS.positive
    }
  ];

  const handleImageError = (gifId: string) => {
    setImageErrors(prev => new Set(prev).add(gifId));
  };

  const activeGifs = gifCategories
    .find(cat => cat.id === activeCategory)?.gifs
    .filter(gif => !imageErrors.has(gif.id)) || [];

  // Debug logging for category switching
  console.log('🎯 GIF Picker - Active Category:', activeCategory);
  console.log('🎯 GIF Picker - Available Categories:', Object.keys(VERIFIED_GIFS));
  console.log('🎯 GIF Picker - Current Active GIFs:', activeGifs.length);

  if (!isOpen) return null;

  return (
    <Card className="absolute bottom-full left-0 right-0 mb-2 z-50 h-[600px] overflow-hidden shadow-xl border-primary/20 animate-scale-in">
      <CardContent className="p-0 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-coral/5 to-brand-teal/5">
          <div>
            <h3 className="font-semibold text-lg">Choose a GIF</h3>
            <p className="text-xs text-muted-foreground">Express yourself with GIFs</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Category Tabs */}
        <div className="flex border-b border-border bg-muted/30 overflow-x-auto relative z-10">
          {gifCategories.map(category => {
            const Icon = category.icon;
            const gifCount = category.gifs.filter(gif => !imageErrors.has(gif.id)).length;
            return (
              <button
                key={category.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🎯 GIF Category Clicked:', category.id, 'Current:', activeCategory);
                  setActiveCategory(category.id);
                }}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-muted/50 whitespace-nowrap cursor-pointer relative z-20 ${
                  activeCategory === category.id
                    ? 'border-b-2 border-coral text-coral bg-coral/5'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                style={{ 
                  pointerEvents: 'auto',
                  zIndex: 20,
                  position: 'relative'
                }}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.name}</span>
                <span className="text-xs opacity-60">({gifCount})</span>
              </button>
            );
          })}
        </div>

        {/* GIF Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-background to-muted/20">
          {activeGifs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Smile className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No GIFs available</p>
                <p className="text-xs">Some GIFs may have failed to load</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {activeGifs.map((gif) => (
                <button
                  key={gif.id}
                  onClick={() => {
                    onGifSelect(gif.url);
                    onClose();
                  }}
                  className="group aspect-square rounded-xl overflow-hidden hover:ring-2 hover:ring-coral/60 hover:scale-105 transition-all duration-300 bg-muted/30 hover:shadow-lg"
                  title={gif.title}
                >
                  <img
                    src={gif.preview_url}
                    alt={gif.title}
                    className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
                    loading="lazy"
                    onError={() => handleImageError(gif.id)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Click any GIF to send</span>
            <span className="font-medium">
              {activeGifs.length} GIFs • {gifCategories.find(cat => cat.id === activeCategory)?.name}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};