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
      preview_url: 'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif',
      category: 'reactions' 
    },
    { 
      id: '2', 
      url: 'https://media.giphy.com/media/3o72FcJmLzIdYJdmDe/giphy.gif', 
      title: 'Shocked', 
      preview_url: 'https://media.giphy.com/media/3o72FcJmLzIdYJdmDe/giphy.gif',
      category: 'reactions' 
    },
    { 
      id: '5', 
      url: 'https://media.giphy.com/media/xTiTnGeUsWOEwsGoG4/giphy.gif', 
      title: 'Thinking', 
      preview_url: 'https://media.giphy.com/media/xTiTnGeUsWOEwsGoG4/giphy.gif',
      category: 'reactions' 
    },
    { 
      id: '6', 
      url: 'https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif', 
      title: 'Laughing', 
      preview_url: 'https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif',
      category: 'reactions' 
    },
    { 
      id: '7', 
      url: 'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif', 
      title: 'OMG', 
      preview_url: 'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif',
      category: 'reactions' 
    },
    { 
      id: '8', 
      url: 'https://media.giphy.com/media/3ohhwxmNcPvwyRBpm8/giphy.gif', 
      title: 'Eye Roll', 
      preview_url: 'https://media.giphy.com/media/3ohhwxmNcPvwyRBpm8/giphy.gif',
      category: 'reactions' 
    },
    { 
      id: '40', 
      url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif', 
      title: 'Confused', 
      preview_url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
      category: 'reactions' 
    },
    { 
      id: '41', 
      url: 'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif', 
      title: 'Nervous', 
      preview_url: 'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif',
      category: 'reactions' 
    },
    { 
      id: '42', 
      url: 'https://media.giphy.com/media/3o6Zt4HU9uwXmXSAuI/giphy.gif', 
      title: 'Facepalm', 
      preview_url: 'https://media.giphy.com/media/3o6Zt4HU9uwXmXSAuI/giphy.gif',
      category: 'reactions' 
    },
    { 
      id: '43', 
      url: 'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif', 
      title: 'Mind Blown', 
      preview_url: 'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif',
      category: 'reactions' 
    },
    { 
      id: '44', 
      url: 'https://media.giphy.com/media/3o7abkhi6F9EWdczXW/giphy.gif', 
      title: 'Yikes', 
      preview_url: 'https://media.giphy.com/media/3o7abkhi6F9EWdczXW/giphy.gif',
      category: 'reactions' 
    },
    { 
      id: '45', 
      url: 'https://media.giphy.com/media/26n6Gx9moCgs1pUuk/giphy.gif', 
      title: 'Surprise', 
      preview_url: 'https://media.giphy.com/media/26n6Gx9moCgs1pUuk/giphy.gif',
      category: 'reactions' 
    },
    { 
      id: '46', 
      url: 'https://media.giphy.com/media/3o7abrH8o4HMgEAV9e/giphy.gif', 
      title: 'Annoyed', 
      preview_url: 'https://media.giphy.com/media/3o7abrH8o4HMgEAV9e/giphy.gif',
      category: 'reactions' 
    },
    { 
      id: '47', 
      url: 'https://media.giphy.com/media/26n6WywJyh39n1pBu/giphy.gif', 
      title: 'Crying Laughing', 
      preview_url: 'https://media.giphy.com/media/26n6WywJyh39n1pBu/giphy.gif',
      category: 'reactions' 
    },
    { 
      id: '48', 
      url: 'https://media.giphy.com/media/l41lGvinEgARjB2HC/giphy.gif', 
      title: 'Dead', 
      preview_url: 'https://media.giphy.com/media/l41lGvinEgARjB2HC/giphy.gif',
      category: 'reactions' 
    }
  ],
  celebrations: [
    { 
      id: '9', 
      url: 'https://media.giphy.com/media/l0MYxKqF6uKkHqmvC/giphy.gif', 
      title: 'Clapping', 
      preview_url: 'https://media.giphy.com/media/l0MYxKqF6uKkHqmvC/giphy.gif',
      category: 'celebrations' 
    },
    { 
      id: '10', 
      url: 'https://media.giphy.com/media/Is1O1TWV0LEJi/giphy.gif', 
      title: 'Victory Dance', 
      preview_url: 'https://media.giphy.com/media/Is1O1TWV0LEJi/giphy.gif',
      category: 'celebrations' 
    },
    { 
      id: '12', 
      url: 'https://media.giphy.com/media/7rj2ZgttvgomY/giphy.gif', 
      title: 'Applause', 
      preview_url: 'https://media.giphy.com/media/7rj2ZgttvgomY/giphy.gif',
      category: 'celebrations' 
    },
    { 
      id: '13', 
      url: 'https://media.giphy.com/media/3oKIPnAi1GG8kN7S96/giphy.gif', 
      title: 'Happy Dance', 
      preview_url: 'https://media.giphy.com/media/3oKIPnAi1GG8kN7S96/giphy.gif',
      category: 'celebrations' 
    },
    { 
      id: '14', 
      url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif', 
      title: 'Celebration', 
      preview_url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif',
      category: 'celebrations' 
    },
    { 
      id: '15', 
      url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif', 
      title: 'Party Time', 
      preview_url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif',
      category: 'celebrations' 
    },
    { 
      id: '50', 
      url: 'https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif', 
      title: 'Cheering', 
      preview_url: 'https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif',
      category: 'celebrations' 
    },
    { 
      id: '51', 
      url: 'https://media.giphy.com/media/xT5LMzIK1AdZJ4cYW4/giphy.gif', 
      title: 'Yes!', 
      preview_url: 'https://media.giphy.com/media/xT5LMzIK1AdZJ4cYW4/giphy.gif',
      category: 'celebrations' 
    },
    { 
      id: '52', 
      url: 'https://media.giphy.com/media/3o6fJeAiIpk5EeoC8o/giphy.gif', 
      title: 'Confetti', 
      preview_url: 'https://media.giphy.com/media/3o6fJeAiIpk5EeoC8o/giphy.gif',
      category: 'celebrations' 
    },
    { 
      id: '53', 
      url: 'https://media.giphy.com/media/26u4lOMA8JKSnL9Uk/giphy.gif', 
      title: 'Champagne', 
      preview_url: 'https://media.giphy.com/media/26u4lOMA8JKSnL9Uk/giphy.gif',
      category: 'celebrations' 
    },
    { 
      id: '54', 
      url: 'https://media.giphy.com/media/l41lUJ1YoZB1lHVPG/giphy.gif', 
      title: 'Fireworks', 
      preview_url: 'https://media.giphy.com/media/l41lUJ1YoZB1lHVPG/giphy.gif',
      category: 'celebrations' 
    },
    { 
      id: '55', 
      url: 'https://media.giphy.com/media/26BROrSHlmyzzHf3i/giphy.gif', 
      title: 'Air Punch', 
      preview_url: 'https://media.giphy.com/media/26BROrSHlmyzzHf3i/giphy.gif',
      category: 'celebrations' 
    },
    { 
      id: '56', 
      url: 'https://media.giphy.com/media/3o6fJgEOrF1lky8WFa/giphy.gif', 
      title: 'Jump for Joy', 
      preview_url: 'https://media.giphy.com/media/3o6fJgEOrF1lky8WFa/giphy.gif',
      category: 'celebrations' 
    },
    { 
      id: '57', 
      url: 'https://media.giphy.com/media/l1ughbsd9qXz2s9SE/giphy.gif', 
      title: 'High Five', 
      preview_url: 'https://media.giphy.com/media/l1ughbsd9qXz2s9SE/giphy.gif',
      category: 'celebrations' 
    }
  ],
  drama: [
    { 
      id: '21', 
      url: 'https://media.giphy.com/media/3o7absbD7PbTFQa0c8/giphy.gif', 
      title: 'Game On', 
      preview_url: 'https://media.giphy.com/media/3o7absbD7PbTFQa0c8/giphy.gif',
      category: 'drama' 
    },
    { 
      id: '22', 
      url: 'https://media.giphy.com/media/BjHIjM2YFC3rEUaMrw/giphy.gif', 
      title: 'Challenge Accepted', 
      preview_url: 'https://media.giphy.com/media/BjHIjM2YFC3rEUaMrw/giphy.gif',
      category: 'drama' 
    },
    { 
      id: '25', 
      url: 'https://media.giphy.com/media/kyLYXonQYYfwYDIeZl/giphy.gif', 
      title: 'Winning', 
      preview_url: 'https://media.giphy.com/media/kyLYXonQYYfwYDIeZl/giphy.gif',
      category: 'drama' 
    },
    { 
      id: '60', 
      url: 'https://media.giphy.com/media/13cptIwW9bgzk6UVyr/giphy.gif', 
      title: 'Popcorn', 
      preview_url: 'https://media.giphy.com/media/13cptIwW9bgzk6UVyr/giphy.gif',
      category: 'drama' 
    },
    { 
      id: '61', 
      url: 'https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif', 
      title: 'Tea Spill', 
      preview_url: 'https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif',
      category: 'drama' 
    },
    { 
      id: '62', 
      url: 'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif', 
      title: 'Gasping', 
      preview_url: 'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif',
      category: 'drama' 
    },
    { 
      id: '63', 
      url: 'https://media.giphy.com/media/3o7abrH8o4HMgEAV9e/giphy.gif', 
      title: 'Side Eye', 
      preview_url: 'https://media.giphy.com/media/3o7abrH8o4HMgEAV9e/giphy.gif',
      category: 'drama' 
    },
    { 
      id: '64', 
      url: 'https://media.giphy.com/media/l0MYGb8173drMQx5S/giphy.gif', 
      title: 'Oh No', 
      preview_url: 'https://media.giphy.com/media/l0MYGb8173drMQx5S/giphy.gif',
      category: 'drama' 
    },
    { 
      id: '65', 
      url: 'https://media.giphy.com/media/26n6WywJyh39n1pBu/giphy.gif', 
      title: 'Messy', 
      preview_url: 'https://media.giphy.com/media/26n6WywJyh39n1pBu/giphy.gif',
      category: 'drama' 
    },
    { 
      id: '66', 
      url: 'https://media.giphy.com/media/3o6Zt4HU9uwXmXSAuI/giphy.gif', 
      title: 'Drama Alert', 
      preview_url: 'https://media.giphy.com/media/3o6Zt4HU9uwXmXSAuI/giphy.gif',
      category: 'drama' 
    },
    { 
      id: '67', 
      url: 'https://media.giphy.com/media/l41lGvinEgARjB2HC/giphy.gif', 
      title: 'Stirring Pot', 
      preview_url: 'https://media.giphy.com/media/l41lGvinEgARjB2HC/giphy.gif',
      category: 'drama' 
    }
  ],
  competition: [
    { 
      id: '27', 
      url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif', 
      title: 'Thumbs Up', 
      preview_url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif',
      category: 'competition' 
    },
    { 
      id: '29', 
      url: 'https://media.giphy.com/media/dM2xuxnJCg4H6/giphy.gif', 
      title: 'Amazing', 
      preview_url: 'https://media.giphy.com/media/dM2xuxnJCg4H6/giphy.gif',
      category: 'competition' 
    },
    { 
      id: '30', 
      url: 'https://media.giphy.com/media/3o6fJ1BM7R2EBRDnxK/giphy.gif', 
      title: 'Awesome', 
      preview_url: 'https://media.giphy.com/media/3o6fJ1BM7R2EBRDnxK/giphy.gif',
      category: 'competition' 
    },
    { 
      id: '70', 
      url: 'https://media.giphy.com/media/26BROrSHlmyzzHf3i/giphy.gif', 
      title: 'Winner', 
      preview_url: 'https://media.giphy.com/media/26BROrSHlmyzzHf3i/giphy.gif',
      category: 'competition' 
    },
    { 
      id: '71', 
      url: 'https://media.giphy.com/media/l0MYxKqF6uKkHqmvC/giphy.gif', 
      title: 'Strong', 
      preview_url: 'https://media.giphy.com/media/l0MYxKqF6uKkHqmvC/giphy.gif',
      category: 'competition' 
    },
    { 
      id: '72', 
      url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif', 
      title: 'Beast Mode', 
      preview_url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif',
      category: 'competition' 
    },
    { 
      id: '73', 
      url: 'https://media.giphy.com/media/3o6Zt4HU9uwXmXSAuI/giphy.gif', 
      title: 'Thumbs Down', 
      preview_url: 'https://media.giphy.com/media/3o6Zt4HU9uwXmXSAuI/giphy.gif',
      category: 'competition' 
    },
    { 
      id: '74', 
      url: 'https://media.giphy.com/media/xT5LMzIK1AdZJ4cYW4/giphy.gif', 
      title: 'Victory', 
      preview_url: 'https://media.giphy.com/media/xT5LMzIK1AdZJ4cYW4/giphy.gif',
      category: 'competition' 
    },
    { 
      id: '75', 
      url: 'https://media.giphy.com/media/l1ughbsd9qXz2s9SE/giphy.gif', 
      title: 'Challenge', 
      preview_url: 'https://media.giphy.com/media/l1ughbsd9qXz2s9SE/giphy.gif',
      category: 'competition' 
    },
    { 
      id: '76', 
      url: 'https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif', 
      title: 'Dominating', 
      preview_url: 'https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif',
      category: 'competition' 
    }
  ],
  positive: [
    { 
      id: '31', 
      url: 'https://media.giphy.com/media/3o7abAHdYvZdBNnGZq/giphy.gif', 
      title: 'Perfect', 
      preview_url: 'https://media.giphy.com/media/3o7abAHdYvZdBNnGZq/giphy.gif',
      category: 'positive' 
    },
    { 
      id: '32', 
      url: 'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif', 
      title: 'Love It', 
      preview_url: 'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif',
      category: 'positive' 
    },
    { 
      id: '80', 
      url: 'https://media.giphy.com/media/3oKIPnAi1GG8kN7S96/giphy.gif', 
      title: 'Good Vibes', 
      preview_url: 'https://media.giphy.com/media/3oKIPnAi1GG8kN7S96/giphy.gif',
      category: 'positive' 
    },
    { 
      id: '81', 
      url: 'https://media.giphy.com/media/26u4lOMA8JKSnL9Uk/giphy.gif', 
      title: 'Blessed', 
      preview_url: 'https://media.giphy.com/media/26u4lOMA8JKSnL9Uk/giphy.gif',
      category: 'positive' 
    },
    { 
      id: '82', 
      url: 'https://media.giphy.com/media/3o6fJeAiIpk5EeoC8o/giphy.gif', 
      title: 'So Good', 
      preview_url: 'https://media.giphy.com/media/3o6fJeAiIpk5EeoC8o/giphy.gif',
      category: 'positive' 
    },
    { 
      id: '83', 
      url: 'https://media.giphy.com/media/l41lUJ1YoZB1lHVPG/giphy.gif', 
      title: 'Fantastic', 
      preview_url: 'https://media.giphy.com/media/l41lUJ1YoZB1lHVPG/giphy.gif',
      category: 'positive' 
    },
    { 
      id: '84', 
      url: 'https://media.giphy.com/media/3o6fJgEOrF1lky8WFa/giphy.gif', 
      title: 'Amazing', 
      preview_url: 'https://media.giphy.com/media/3o6fJgEOrF1lky8WFa/giphy.gif',
      category: 'positive' 
    },
    { 
      id: '85', 
      url: 'https://media.giphy.com/media/26n6Gx9moCgs1pUuk/giphy.gif', 
      title: 'Wonderful', 
      preview_url: 'https://media.giphy.com/media/26n6Gx9moCgs1pUuk/giphy.gif',
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
                    console.log('🎯 GIF Selected - Preview URL:', gif.preview_url);
                    console.log('🎯 GIF Selected - Full URL:', gif.url);
                    // Use the same URL that's shown in preview for consistency
                    onGifSelect(gif.url);
                    onClose();
                  }}
                  className="group aspect-square rounded-xl overflow-hidden hover:ring-2 hover:ring-coral/60 hover:scale-105 transition-all duration-300 bg-muted/30 hover:shadow-lg"
                  title={gif.title}
                >
                  <img
                    src={gif.url}
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