import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Wand2, Users, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIContestantProfile {
  name: string;
  age: number;
  hometown: string;
  occupation: string;
  bio: string;
  relationship_status: string;
  family_info: string;
  physical_description: any;
  personality_traits: any;
  gameplay_strategy: any;
  backstory: any;
}

interface AIGenerationPanelProps {
  onProfilesGenerated: (profiles: AIContestantProfile[]) => void;
}

export const AIGenerationPanel: React.FC<AIGenerationPanelProps> = ({ onProfilesGenerated }) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [seasonConfig, setSeasonConfig] = useState({
    season_number: 27,
    season_theme: 'All Stars',
    season_format: 'Standard',
    cast_size: 16,
    special_twists: 'America\'s Player twist',
    count: 1
  });

  const generateProfiles = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      const { data, error } = await supabase.functions.invoke('generate-contestant-profile', {
        body: seasonConfig
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Generation failed');
      }

      setProgress(100);
      onProfilesGenerated(data.profiles);

      toast({
        title: "Success!",
        description: `Generated ${data.profiles.length} contestant profile(s)`,
      });

    } catch (error) {
      console.error('Error generating profiles:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate contestant profiles",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const generateFullCast = async () => {
    setSeasonConfig(prev => ({ ...prev, count: 16 }));
    await generateProfiles();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          AI Contestant Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Season Configuration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="season_number">Season Number</Label>
            <Input
              id="season_number"
              type="number"
              value={seasonConfig.season_number}
              onChange={(e) => setSeasonConfig(prev => ({ 
                ...prev, 
                season_number: parseInt(e.target.value) || 27 
              }))}
            />
          </div>
          <div>
            <Label htmlFor="cast_size">Cast Size</Label>
            <Input
              id="cast_size"
              type="number"
              value={seasonConfig.cast_size}
              onChange={(e) => setSeasonConfig(prev => ({ 
                ...prev, 
                cast_size: parseInt(e.target.value) || 16 
              }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="season_theme">Season Theme</Label>
            <Input
              id="season_theme"
              value={seasonConfig.season_theme}
              onChange={(e) => setSeasonConfig(prev => ({ 
                ...prev, 
                season_theme: e.target.value 
              }))}
              placeholder="e.g., All Stars, Newbies, Heroes vs Villains"
            />
          </div>
          <div>
            <Label htmlFor="season_format">Format</Label>
            <Input
              id="season_format"
              value={seasonConfig.season_format}
              onChange={(e) => setSeasonConfig(prev => ({ 
                ...prev, 
                season_format: e.target.value 
              }))}
              placeholder="e.g., Standard, Fast Forward, Double Eviction"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="special_twists">Special Twists</Label>
          <Textarea
            id="special_twists"
            value={seasonConfig.special_twists}
            onChange={(e) => setSeasonConfig(prev => ({ 
              ...prev, 
              special_twists: e.target.value 
            }))}
            placeholder="Describe any special twists, powers, or unique elements for this season"
            rows={2}
          />
        </div>

        {isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Generating contestants...</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Generation Buttons */}
        <div className="flex gap-4">
          <Button 
            onClick={() => {
              setSeasonConfig(prev => ({ ...prev, count: 1 }));
              generateProfiles();
            }}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <Wand2 className="h-4 w-4" />
            Generate Single Contestant
          </Button>
          
          <Button 
            onClick={generateFullCast}
            disabled={isGenerating}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Generate Full Cast (16)
          </Button>
        </div>

        {/* AI Settings */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">AI Settings</h4>
          <div className="flex gap-2">
            <Badge variant="secondary">Model: GPT-4o-mini</Badge>
            <Badge variant="secondary">Creativity: High</Badge>
            <Badge variant="secondary">Diversity: Enabled</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};