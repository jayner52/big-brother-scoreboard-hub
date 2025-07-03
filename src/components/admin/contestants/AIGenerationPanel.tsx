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
  const [error, setError] = useState<string | null>(null);
  // Season configurations with accurate cast counts
  const showConfigs = {
    'big-brother': {
      name: 'Big Brother',
      seasons: {
        26: { cast: 16, theme: 'AI Arena', format: 'Standard', twists: 'AI Arena competition, America\'s Veto' },
        25: { cast: 17, theme: 'Regular Season', format: 'Standard', twists: 'Invisible HOH, Comic-Verse Power' },
        24: { cast: 16, theme: 'Regular Season', format: 'Standard', twists: 'Backstage Boss, Festie Besties' },
        23: { cast: 16, theme: 'Regular Season', format: 'Standard', twists: 'High Roller\'s Room, Wildcard Competition' },
        22: { cast: 16, theme: 'All Stars', format: 'Standard', twists: 'Safety Suite, Neighbor\'s Twist' }
      }
    }
  } as const;

  type ShowConfig = {
    cast: number;
    theme: string;
    format: string;
    twists: string;
  };

  const [selectedShow, setSelectedShow] = useState('big-brother');
  const [seasonConfig, setSeasonConfig] = useState({
    season_number: 26,
    season_theme: 'AI Arena',
    season_format: 'Standard',
    cast_size: 16,
    special_twists: 'AI Arena competition, America\'s Veto',
    count: 1
  });

  const validateContestantData = (contestants: AIContestantProfile[]) => {
    const issues: string[] = [];
    
    contestants.forEach((contestant, index) => {
      if (!contestant.name || contestant.name.includes('Generated')) {
        issues.push(`Contestant ${index + 1}: Invalid name`);
      }
      if (!contestant.age || contestant.age < 18 || contestant.age > 80) {
        issues.push(`${contestant.name}: Invalid age (${contestant.age})`);
      }
      if (!contestant.hometown || !contestant.hometown.includes(',')) {
        issues.push(`${contestant.name}: Invalid hometown format`);
      }
      if (!contestant.occupation || contestant.occupation === 'Unknown') {
        issues.push(`${contestant.name}: Missing occupation`);
      }
    });
    
    if (issues.length > 0) {
      console.warn('Data validation issues:', issues);
      setError(`Data validation issues: ${issues.join(', ')}`);
    }
    
    return issues.length === 0;
  };

  const generateProfiles = async () => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-contestant-profile', {
        body: seasonConfig
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Generation failed');
      }

      // Validate the generated data
      if (data.profiles && data.profiles.length > 0) {
        validateContestantData(data.profiles);
      }

      setProgress(100);
      onProfilesGenerated(data.profiles);

      toast({
        title: "Success!",
        description: `Generated ${data.profiles.length} contestant profile(s)`,
      });

    } catch (error) {
      console.error('Error generating profiles:', error);
      const errorMessage = error.message || "Failed to generate contestant profiles";
      setError(errorMessage);
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const generateFullCast = async () => {
    const season = showConfigs[selectedShow].seasons[seasonConfig.season_number];
    setSeasonConfig(prev => ({ ...prev, count: season.cast }));
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
        {/* Show and Season Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="show_select">Show</Label>
            <select
              id="show_select"
              value={selectedShow}
              onChange={(e) => setSelectedShow(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {Object.entries(showConfigs).map(([key, config]) => (
                <option key={key} value={key}>{config.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="season_select">Season</Label>
            <select
              id="season_select"
              value={seasonConfig.season_number}
              onChange={(e) => {
                const newSeason = parseInt(e.target.value);
                const config = showConfigs[selectedShow].seasons[newSeason];
                setSeasonConfig(prev => ({
                  ...prev,
                  season_number: newSeason,
                  season_theme: config.theme,
                  season_format: config.format,
                  cast_size: config.cast,
                  special_twists: config.twists
                }));
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {Object.entries(showConfigs[selectedShow].seasons).map(([seasonNum, config]) => (
                <option key={seasonNum} value={seasonNum}>
                  Season {seasonNum} ({(config as ShowConfig).theme})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Auto-populated Configuration */}
        <div className="grid grid-cols-2 gap-4">
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

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

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
            Generate Full Cast ({showConfigs[selectedShow].seasons[seasonConfig.season_number].cast})
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