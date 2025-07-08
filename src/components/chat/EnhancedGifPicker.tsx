import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Heart, Trophy, Zap, Smile, ThumbsUp } from 'lucide-react';

interface GifItem {
  id: string;
  url: string;
  title: string;
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

// Curated library of UNIQUE verified working GIFs - no duplicates across categories
const VERIFIED_GIFS = {
  reactions: [
    { 
      id: 'react-1', 
      url: 'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif', 
      title: 'Excited',
      category: 'reactions' 
    },
    { 
      id: 'react-2', 
      url: 'https://media.giphy.com/media/3o72FcJmLzIdYJdmDe/giphy.gif', 
      title: 'Shocked',
      category: 'reactions' 
    },
    { 
      id: 'react-3', 
      url: 'https://media.giphy.com/media/xTiTnGeUsWOEwsGoG4/giphy.gif', 
      title: 'Thinking',
      category: 'reactions' 
    },
    { 
      id: 'react-4', 
      url: 'https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif', 
      title: 'Laughing',
      category: 'reactions' 
    },
    { 
      id: 'react-5', 
      url: 'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif', 
      title: 'OMG',
      category: 'reactions' 
    },
    { 
      id: 'react-6', 
      url: 'https://media.giphy.com/media/3ohhwxmNcPvwyRBpm8/giphy.gif', 
      title: 'Eye Roll',
      category: 'reactions' 
    },
    { 
      id: 'react-7', 
      url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif', 
      title: 'Confused',
      category: 'reactions' 
    },
    { 
      id: 'react-8', 
      url: 'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif', 
      title: 'Nervous',
      category: 'reactions' 
    }
  ],
  celebrations: [
    { 
      id: 'celeb-1', 
      url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif', 
      title: 'Party Time',
      category: 'celebrations' 
    },
    { 
      id: 'celeb-2', 
      url: 'https://media.giphy.com/media/Is1O1TWV0LEJi/giphy.gif', 
      title: 'Victory Dance',
      category: 'celebrations' 
    },
    { 
      id: 'celeb-3', 
      url: 'https://media.giphy.com/media/7rj2ZgttvgomY/giphy.gif', 
      title: 'Applause',
      category: 'celebrations' 
    },
    { 
      id: 'celeb-4', 
      url: 'https://media.giphy.com/media/3oKIPnAi1GG8kN7S96/giphy.gif', 
      title: 'Happy Dance',
      category: 'celebrations' 
    },
    { 
      id: 'celeb-5', 
      url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif', 
      title: 'Celebration',
      category: 'celebrations' 
    },
    { 
      id: 'celeb-6', 
      url: 'https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif', 
      title: 'Cheering',
      category: 'celebrations' 
    },
    { 
      id: 'celeb-7', 
      url: 'https://media.giphy.com/media/xT5LMzIK1AdZJ4cYW4/giphy.gif', 
      title: 'Yes!',
      category: 'celebrations' 
    },
    { 
      id: 'celeb-8', 
      url: 'https://media.giphy.com/media/3o6fJeAiIpk5EeoC8o/giphy.gif', 
      title: 'Confetti',
      category: 'celebrations' 
    }
  ],
  drama: [
    { 
      id: 'drama-1', 
      url: 'https://media.giphy.com/media/3o7absbD7PbTFQa0c8/giphy.gif', 
      title: 'Game On',
      category: 'drama' 
    },
    { 
      id: 'drama-2', 
      url: 'https://media.giphy.com/media/BjHIjM2YFC3rEUaMrw/giphy.gif', 
      title: 'Challenge Accepted',
      category: 'drama' 
    },
    { 
      id: 'drama-3', 
      url: 'https://media.giphy.com/media/kyLYXonQYYfwYDIeZl/giphy.gif', 
      title: 'Winning',
      category: 'drama' 
    },
    { 
      id: 'drama-4', 
      url: 'https://media.giphy.com/media/13cptIwW9bgzk6UVyr/giphy.gif', 
      title: 'Popcorn',
      category: 'drama' 
    },
    { 
      id: 'drama-5', 
      url: 'https://media.giphy.com/media/3o6Zt4HU9uwXmXSAuI/giphy.gif', 
      title: 'Facepalm',
      category: 'drama' 
    },
    { 
      id: 'drama-6', 
      url: 'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif', 
      title: 'Mind Blown',
      category: 'drama' 
    },
    { 
      id: 'drama-7', 
      url: 'https://media.giphy.com/media/3o7abrH8o4HMgEAV9e/giphy.gif', 
      title: 'Side Eye',
      category: 'drama' 
    },
    { 
      id: 'drama-8', 
      url: 'https://media.giphy.com/media/l0MYGb8173drMQx5S/giphy.gif', 
      title: 'Oh No',
      category: 'drama' 
    }
  ],
  competition: [
    { 
      id: 'comp-1', 
      url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif', 
      title: 'Thumbs Up',
      category: 'competition' 
    },
    { 
      id: 'comp-2', 
      url: 'https://media.giphy.com/media/dM2xuxnJCg4H6/giphy.gif', 
      title: 'Amazing',
      category: 'competition' 
    },
    { 
      id: 'comp-3', 
      url: 'https://media.giphy.com/media/3o6fJ1BM7R2EBRDnxK/giphy.gif', 
      title: 'Awesome',
      category: 'competition' 
    },
    { 
      id: 'comp-4', 
      url: 'https://media.giphy.com/media/26BROrSHlmyzzHf3i/giphy.gif', 
      title: 'Air Punch',
      category: 'competition' 
    },
    { 
      id: 'comp-5', 
      url: 'https://media.giphy.com/media/l0MYxKqF6uKkHqmvC/giphy.gif', 
      title: 'Strong',
      category: 'competition' 
    },
    { 
      id: 'comp-6', 
      url: 'https://media.giphy.com/media/l1ughbsd9qXz2s9SE/giphy.gif', 
      title: 'High Five',
      category: 'competition' 
    },
    { 
      id: 'comp-7', 
      url: 'https://media.giphy.com/media/3o6fJgEOrF1lky8WFa/giphy.gif', 
      title: 'Jump for Joy',
      category: 'competition' 
    },
    { 
      id: 'comp-8', 
      url: 'https://media.giphy.com/media/l41lUJ1YoZB1lHVPG/giphy.gif', 
      title: 'Fireworks',
      category: 'competition' 
    }
  ],
  positive: [
    { 
      id: 'pos-1', 
      url: 'https://media.giphy.com/media/3o7abAHdYvZdBNnGZq/giphy.gif', 
      title: 'Perfect',
      category: 'positive' 
    },
    { 
      id: 'pos-2', 
      url: 'https://media.giphy.com/media/26u4lOMA8JKSnL9Uk/giphy.gif', 
      title: 'Champagne',
      category: 'positive' 
    },
    { 
      id: 'pos-3', 
      url: 'https://media.giphy.com/media/26n6Gx9moCgs1pUuk/giphy.gif', 
      title: 'Surprise',
      category: 'positive' 
    },
    { 
      id: 'pos-4', 
      url: 'https://media.giphy.com/media/26n6WywJyh39n1pBu/giphy.gif', 
      title: 'Crying Laughing',
      category: 'positive' 
    },
    { 
      id: 'pos-5', 
      url: 'https://media.giphy.com/media/l41lGvinEgARjB2HC/giphy.gif', 
      title: 'Dead',
      category: 'positive' 
    },
    { 
      id: 'pos-6', 
      url: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif', 
      title: 'Love It',
      category: 'positive' 
    },
    { 
      id: 'pos-7', 
      url: 'https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif', 
      title: 'Good Vibes',
      category: 'positive' 
    },
    { 
      id: 'pos-8', 
      url: 'https://media.giphy.com/media/3ohfFhG5VDtDTzQv2o/giphy.gif', 
      title: 'Fantastic',
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
  const [loadingGifs, setLoadingGifs] = useState<Set<string>>(new Set());

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
      id: 'drama',
      name: 'Drama',
      icon: Zap,
      gifs: VERIFIED_GIFS.drama
    },
    {
      id: 'competition',
      name: 'Competition',
      icon: Heart,
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
    console.error('🚫 GIF Failed to Load:', gifId);
    setImageErrors(prev => new Set(prev).add(gifId));
    setLoadingGifs(prev => {
      const newSet = new Set(prev);
      newSet.delete(gifId);
      return newSet;
    });
  };

  const handleImageLoad = (gifId: string) => {
    console.log('✅ GIF Loaded Successfully:', gifId);
    setLoadingGifs(prev => {
      const newSet = new Set(prev);
      newSet.delete(gifId);
      return newSet;
    });
  };

  const handleImageLoadStart = (gifId: string) => {
    setLoadingGifs(prev => new Set(prev).add(gifId));
  };

  const activeGifs = gifCategories
    .find(cat => cat.id === activeCategory)?.gifs
    .filter(gif => !imageErrors.has(gif.id)) || [];

  // Enhanced debugging for GIF selection
  console.log('🎯 GIF Picker - Active Category:', activeCategory);
  console.log('🎯 GIF Picker - Available GIFs:', activeGifs.length);
  console.log('🎯 GIF Picker - Failed GIFs:', Array.from(imageErrors));

  if (!isOpen) return null;

  return (
    <Card className="absolute bottom-full left-0 right-0 mb-2 z-50 h-[600px] gif-picker-modal overflow-hidden shadow-xl border-primary/20 animate-scale-in">
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
                    console.log('🎯 GIF CLICKED - ID:', gif.id, 'Title:', gif.title);
                    console.log('🎯 GIF CLICKED - URL Being Sent:', gif.url);
                    console.log('🎯 GIF CLICKED - Category:', gif.category);
                    
                    // Send exactly the same URL that's displayed
                    onGifSelect(gif.url);
                    onClose();
                  }}
                  className="group aspect-square rounded-xl overflow-hidden hover:ring-2 hover:ring-coral/60 hover:scale-105 transition-all duration-300 bg-muted/30 hover:shadow-lg relative"
                  title={gif.title}
                  disabled={loadingGifs.has(gif.id)}
                >
                  {loadingGifs.has(gif.id) && (
                    <div className="absolute inset-0 bg-muted/80 flex items-center justify-center z-10">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-coral border-t-transparent"></div>
                    </div>
                  )}
                  <img
                    src={gif.url}
                    alt={gif.title}
                    className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
                    loading="lazy"
                    onLoadStart={() => handleImageLoadStart(gif.id)}
                    onLoad={() => handleImageLoad(gif.id)}
                    onError={() => handleImageError(gif.id)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  
                  {/* Visual feedback for selection */}
                  <div className="absolute inset-0 opacity-0 group-active:opacity-100 bg-coral/20 transition-opacity duration-150" />
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