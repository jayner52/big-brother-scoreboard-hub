
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Sparkles } from 'lucide-react';
import { getAvailableEmojis } from '@/utils/availableEmojis';

interface CustomEventSelectorProps {
  onAddCustomEvent: (eventData: { description: string; emoji: string; points: number }) => void;
  onCancel: () => void;
}

export const CustomEventSelector: React.FC<CustomEventSelectorProps> = ({
  onAddCustomEvent,
  onCancel
}) => {
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [points, setPoints] = useState(1);

  const availableEmojis = getAvailableEmojis();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim() && selectedEmoji && points > 0) {
      onAddCustomEvent({
        description: description.trim(),
        emoji: selectedEmoji,
        points
      });
      setDescription('');
      setSelectedEmoji('');
      setPoints(1);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Create Custom Special Event
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">Event Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Won luxury vacation"
              required
            />
          </div>

          <div>
            <Label>Choose Emoji</Label>
            <div className="grid grid-cols-8 gap-2 mt-2 max-h-32 overflow-y-auto border rounded-md p-2">
              {availableEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`p-2 text-lg hover:bg-muted rounded transition-colors ${
                    selectedEmoji === emoji ? 'bg-primary text-primary-foreground' : ''
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            {selectedEmoji && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {selectedEmoji}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="points">Points Value</Label>
            <Input
              id="points"
              type="number"
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
              min="1"
              max="100"
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1" disabled={!description.trim() || !selectedEmoji}>
              Create Event
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
