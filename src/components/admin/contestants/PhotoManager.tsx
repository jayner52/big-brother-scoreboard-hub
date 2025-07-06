import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Link, RefreshCw, Check, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhotoManagerProps {
  contestantName: string;
  currentPhotoUrl?: string;
  onPhotoUpdate: (photoUrl: string) => void;
}

export const PhotoManager: React.FC<PhotoManagerProps> = ({
  contestantName,
  currentPhotoUrl,
  onPhotoUpdate
}) => {
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  // GoldDerby and CBS photo URL patterns for Season 26
  const generatePhotoUrls = (name: string) => {
    const cleanName = name.toLowerCase()
      .replace(/[''`]/g, '')
      .replace(/[-\s]/g, '-')
      .replace(/[^a-z-]/g, '');
    
    const firstName = name.split(' ')[0].toLowerCase();
    
    return [
      // GoldDerby high-res photos
      `https://www.goldderby.com/wp-content/uploads/2024/07/big-brother-26-${cleanName}.jpg`,
      `https://www.goldderby.com/wp-content/uploads/2024/07/bb26-${cleanName}.jpg`,
      `https://www.goldderby.com/wp-content/uploads/2024/07/${cleanName}-big-brother-26.jpg`,
      
      // CBS official photos
      `https://media.cbs.com/2024/07/10/bb26-cast-photos-${firstName}.jpg`,
      `https://media.cbs.com/2024/07/bb26-${firstName}-cast-photo.jpg`,
      `https://www.cbs.com/shows/big-brother/cast/${firstName}-${cleanName}/`,
      
      // Alternative sources
      `https://bigbrother.fandom.com/wiki/Special:FilePath/${name.replace(/\s/g, '_')}_BB26.jpg`,
      `https://static.wikia.nocookie.net/bigbrother/images/bb26-${firstName}.jpg`
    ];
  };

  const testPhotoUrl = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok && response.headers.get('content-type')?.includes('image');
    } catch {
      return false;
    }
  };

  const findBestPhoto = async () => {
    setIsLoading(true);
    const potentialUrls = generatePhotoUrls(contestantName);
    
    for (const url of potentialUrls) {
      const isValid = await testPhotoUrl(url);
      if (isValid) {
        setPhotoUrl(url);
        setPreviewUrl(url);
        toast({
          title: "Photo found!",
          description: `Found high-quality photo for ${contestantName}`,
        });
        setIsLoading(false);
        return;
      }
    }
    
    toast({
      title: "No photos found",
      description: "Please enter a photo URL manually",
      variant: "destructive",
    });
    setIsLoading(false);
  };

  const validateAndPreview = async (url: string) => {
    if (!url.trim()) {
      setPreviewUrl(null);
      return;
    }

    const isValid = await testPhotoUrl(url);
    if (isValid) {
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
      toast({
        title: "Invalid photo URL",
        description: "Please check the URL and try again",
        variant: "destructive",
      });
    }
  };

  const handleUrlChange = (url: string) => {
    setPhotoUrl(url);
    validateAndPreview(url);
  };

  const handleSave = () => {
    if (previewUrl) {
      onPhotoUpdate(photoUrl);
      toast({
        title: "Photo updated!",
        description: `Photo updated for ${contestantName}`,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Photo Manager - {contestantName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current Photo */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Current Photo</Label>
            <div className="aspect-square w-32 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
              {currentPhotoUrl ? (
                <img 
                  src={currentPhotoUrl} 
                  alt={contestantName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-muted-foreground text-sm text-center p-2">
                  No photo
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Preview</Label>
            <div className="aspect-square w-32 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt={`${contestantName} preview`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-muted-foreground text-sm text-center p-2">
                  Preview will appear here
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Auto-find photos */}
        <div className="flex items-center gap-2">
          <Button
            onClick={findBestPhoto}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Auto-find Photo
          </Button>
          <Badge variant="secondary" className="text-xs">
            Searches GoldDerby & CBS
          </Badge>
        </div>

        {/* Manual URL input */}
        <div className="space-y-2">
          <Label htmlFor="photo-url">Manual Photo URL</Label>
          <div className="flex gap-2">
            <Input
              id="photo-url"
              value={photoUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="flex-1"
            />
            <Button
              onClick={() => validateAndPreview(photoUrl)}
              variant="outline"
              size="icon"
            >
              <Link className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center pt-4">
          <div className="flex items-center gap-2">
            {previewUrl && (
              <Badge variant="default" className="flex items-center gap-1">
                <Check className="h-3 w-3" />
                Valid photo
              </Badge>
            )}
            {photoUrl && !previewUrl && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <X className="h-3 w-3" />
                Invalid URL
              </Badge>
            )}
          </div>
          
          <Button
            onClick={handleSave}
            disabled={!previewUrl}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Update Photo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};