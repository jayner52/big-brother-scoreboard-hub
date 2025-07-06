import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface GifItem {
  id: string;
  url: string;
  title: string;
  preview_url: string;
}

interface GifPickerProps {
  isOpen: boolean;
  onGifSelect: (gifUrl: string) => void;
  onClose: () => void;
}

export const GifPicker: React.FC<GifPickerProps> = ({
  isOpen,
  onGifSelect,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gifs, setGifs] = useState<GifItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Popular GIFs for initial display
  const popularGifs = [
    { id: '1', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', title: 'Excited', preview_url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/200w.gif' },
    { id: '2', url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', title: 'Thumbs Up', preview_url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/200w.gif' },
    { id: '3', url: 'https://media.giphy.com/media/26BRrSvJUa0crqw4E/giphy.gif', title: 'Clap', preview_url: 'https://media.giphy.com/media/26BRrSvJUa0crqw4E/200w.gif' },
    { id: '4', url: 'https://media.giphy.com/media/l3q2XhfQ8oCkm1Ts4/giphy.gif', title: 'Laugh', preview_url: 'https://media.giphy.com/media/l3q2XhfQ8oCkm1Ts4/200w.gif' },
    { id: '5', url: 'https://media.giphy.com/media/3o6Zt4HU9uwXmXSAuI/giphy.gif', title: 'Dance', preview_url: 'https://media.giphy.com/media/3o6Zt4HU9uwXmXSAuI/200w.gif' },
    { id: '6', url: 'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif', title: 'Shocked', preview_url: 'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/200w.gif' }
  ];

  useEffect(() => {
    if (!searchTerm) {
      setGifs(popularGifs);
    }
  }, [searchTerm]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setGifs(popularGifs);
      return;
    }

    setLoading(true);
    try {
      // For now, use mock data - in production you'd integrate with Giphy API
      const mockResults = popularGifs.filter(gif => 
        gif.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setGifs(mockResults.length > 0 ? mockResults : popularGifs);
    } catch (error) {
      console.error('Error searching GIFs:', error);
      setGifs(popularGifs);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <Card className="absolute bottom-full left-0 right-0 mb-2 z-50 max-h-80 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-sm">Choose a GIF</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Search GIFs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 h-8"
          />
          <Button
            size="sm"
            onClick={handleSearch}
            disabled={loading}
            className="h-8 px-3"
          >
            <Search className="h-3 w-3" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
          {gifs.map((gif) => (
            <button
              key={gif.id}
              onClick={() => {
                onGifSelect(gif.url);
                onClose();
              }}
              className="aspect-square rounded-md overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all"
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
      </CardContent>
    </Card>
  );
};