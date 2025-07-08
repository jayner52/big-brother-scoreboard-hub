
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CUSTOM_EVENT_EMOJIS } from '@/constants/specialEvents';
import { Plus, X } from 'lucide-react';

interface CustomEventData {
  description: string;
  emoji: string;
  points: number;
}

interface CustomEventSelectorProps {
  onAddCustomEvent: (eventData: CustomEventData) => void;
  onCancel: () => void;
}

export const CustomEventSelector: React.FC<CustomEventSelectorProps> = ({
  onAddCustomEvent,
  onCancel
}) => {
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('✨');
  const [points, setPoints] = useState(1);

  const handleSubmit = () => {
    if (!description.trim()) return;
    
    // Don't include emoji in description - it will be handled separately
    onAddCustomEvent({
      description: description.trim(),
      emoji: selectedEmoji,
      points
    });
    
    // Reset form
    setDescription('');
    setSelectedEmoji('✨');
    setPoints(1);
  };

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || value === '-') {
      setPoints(0);
      return;
    }
    const numValue = parseInt(value);
    setPoints(isNaN(numValue) ? 0 : numValue);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create Custom Event
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="description">Event Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the special event (don't include emoji here)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1"
            rows={2}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Just describe the event - the emoji will be added automatically
          </p>
        </div>

        <div>
          <Label htmlFor="emoji">Event Emoji</Label>
          <Select value={selectedEmoji} onValueChange={setSelectedEmoji}>
            <SelectTrigger className="mt-1">
              <SelectValue>
                <span className="text-lg">{selectedEmoji}</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-48 z-[1000] bg-background border border-border shadow-lg">
              {CUSTOM_EVENT_EMOJIS.map(emoji => (
                 <SelectItem key={emoji} value={emoji} className="cursor-pointer hover:bg-accent">
                   <span className="text-lg">{emoji}</span>
                 </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="points">Point Value</Label>
          <Input
            id="points"
            type="number"
            value={points}
            onChange={handlePointsChange}
            className="mt-1"
            placeholder="Enter points (can be negative)"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter positive or negative number (e.g., -5 for penalty)
          </p>
        </div>

        {/* Preview */}
        {description.trim() && (
          <div className="p-3 bg-muted/20 rounded border">
            <p className="text-sm font-medium text-muted-foreground mb-1">Preview:</p>
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedEmoji}</span>
              <span className="text-sm">{description.trim()}</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                {points > 0 ? '+' : ''}{points} pts
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleSubmit}
            disabled={!description.trim()}
            className="flex-1"
          >
            Add Event
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
