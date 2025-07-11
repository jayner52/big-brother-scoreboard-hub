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
import { usePool } from '@/contexts/PoolContext';
import { populateSeason26Houseguests } from '@/data/season26Houseguests';

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
  const { activePool } = usePool();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // Season configurations with accurate cast counts
  const showConfigs = {
    'big-brother': {
      name: 'Big Brother',
      seasons: {
        27: { cast: 16, theme: 'New School vs Old School', format: 'Standard', twists: 'BB AI, Arena, Multiverse' },
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
    season_number: 27,
    season_theme: 'New School vs Old School',
    season_format: 'Standard',
    cast_size: 16,
    special_twists: 'BB AI, Arena, Multiverse',
    count: 16,
    pool_id: null as string | null
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
    
    // Handle Season 27 via Parade scraping
    if (seasonConfig.season_number === 27) {
      setIsGenerating(true);
      setProgress(10);
      setError(null);
      
      try {
        setProgress(30);
        console.log('🏠 BB27: Starting Season 27 population...');
        
        // Import the BB27 function
        const { populateSeason27Houseguests } = await import('@/data/season27Houseguests');
        
        setProgress(60);
        const result = await populateSeason27Houseguests(activePool?.id || '');
        setProgress(100);
        
        if (result.success) {
          toast({
            title: "✅ Season 27 Populated!",
            description: `Successfully added ${result.count} Season 27 houseguests from Parade!`,
          });
          
          // Trigger parent component refresh
          onProfilesGenerated([]);
        } else {
          throw new Error(result.error || 'Failed to populate Season 27 houseguests');
        }
      } catch (error) {
        console.error('❌ Season 27 population failed:', error);
        setError(error.message || 'Failed to populate Season 27 houseguests');
        toast({
          title: "Population Failed",
          description: error.message || 'Failed to populate Season 27 houseguests',
          variant: "destructive",
        });
      } finally {
        setIsGenerating(false);
        setProgress(0);
      }
      return;
    }

    // CRITICAL FIX: Handle Season 26 with instant population (no AI)
    if (seasonConfig.season_number === 26) {
      setIsGenerating(true);
      setProgress(10);
      setError(null);
      
      try {
        setProgress(50);
        const result = await populateSeason26Houseguests(activePool?.id || '');
        setProgress(100);
        
        if (result.success) {
          toast({
            title: "✅ Season 26 Populated!",
            description: `Successfully added ${result.count} Season 26 houseguests instantly!`,
          });
          
          // Trigger parent component refresh
          onProfilesGenerated([]);
        } else {
          throw new Error(result.error || 'Failed to populate Season 26 houseguests');
        }
      } catch (error) {
        console.error('❌ Season 26 population failed:', error);
        setError(error.message || 'Failed to populate Season 26 houseguests');
        toast({
          title: "Population Failed",
          description: error.message || 'Failed to populate Season 26 houseguests',
          variant: "destructive",
        });
      } finally {
        setIsGenerating(false);
        setProgress(0);
      }
      return;
    }

    // Check if season number is below 26
    if (seasonConfig.season_number < 26) {
      toast({
        title: "Season Not Supported",
        description: "Only Season 26+ contestants are processed. Please select a newer season.",
        variant: "destructive",
      });
      return;
    }
    
    // Continue with AI generation for non-Season 26 seasons
    const fullCastConfig = { 
      ...seasonConfig, 
      count: season.cast,
      pool_id: activePool?.id || null
    };
    
    setIsGenerating(true);
    setProgress(10);
    setError(null);

    try {
      console.log('🔥 STARTING AI GENERATION DEBUG');
      console.log('🔥 Pool ID:', activePool?.id);
      console.log('🔥 Full Cast Config:', fullCastConfig);
      
      // Simulate progress during the long operation
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 2000);

      console.log('🔥 CALLING EDGE FUNCTION...');
      const { data, error } = await supabase.functions.invoke('generate-contestant-profile', {
        body: fullCastConfig
      });

      console.log('🔥 EDGE FUNCTION RESPONSE:', { data, error });
      clearInterval(progressInterval);

      if (error) {
        console.error('Edge function invocation error:', error);
        throw error;
      }

      if (!data.success && !data.metadata?.successful_inserts) {
        throw new Error(data.error || 'Generation failed completely');
      }

      console.log('📊 Generation response:', data);

      // Check for partial success
      if (data.statistics) {
        const { total_contestants, successful, failed, success_rate } = data.statistics;
        
        if (successful === total_contestants) {
          // Complete success
          toast({
            title: "✅ Complete Success!",
            description: `Successfully added all ${successful} contestants (${success_rate}% success rate)`,
          });
        } else if (successful > 0) {
          // Partial success
          toast({
            title: "⚠️ Partial Success",
            description: `Added ${successful}/${total_contestants} contestants (${success_rate}% success rate). Check console for details.`,
            variant: "destructive",
          });
          console.log('❌ Failed contestants:', data.failures);
        } else {
          // Complete failure
          throw new Error(`Failed to add any contestants. ${failed} failures occurred.`);
        }
      }

      setProgress(100);
      
      // Pass the profiles to the parent component for UI updates
      if (data.profiles && data.profiles.length > 0) {
        onProfilesGenerated(data.profiles);
      }

    } catch (error) {
      console.error('❌ Error generating profiles:', error);
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
              <span className="text-sm">
              {seasonConfig.season_number === 26 ? 
                (progress < 50 ? "Populating Season 26 houseguests..." : "Finalizing houseguest setup...") :
                seasonConfig.season_number === 27 ?
                (progress < 30 ? "Scraping Parade.com for BB27 cast..." :
                 progress < 60 ? "Processing contestant data..." :
                 "Setting up global defaults...") :
                (progress < 20 ? "Starting web scraping..." :
                 progress < 40 ? "Validating contestant photos..." :
                 progress < 60 ? "Processing batch 1 of 2..." :
                 progress < 80 ? "Processing batch 2 of 2..." :
                 "Finalizing database operations...")}
              </span>
            </div>
            <Progress value={progress} className="w-full" />
            <div className="text-xs text-muted-foreground">
              {seasonConfig.season_number === 26 ? 
                "Instant population with verified Season 26 cast" :
                seasonConfig.season_number === 27 ?
                "Live scraping from Parade.com with AI processing" :
                "Robust processing with retry logic and rate limiting"}
            </div>
          </div>
        )}

        {/* Generation Button */}
        <div className="flex justify-center">
          <Button 
            onClick={generateFullCast}
            disabled={isGenerating}
            className="flex items-center gap-2 px-8"
          >
            <Users className="h-4 w-4" />
            {isGenerating ? "Processing..." : 
             seasonConfig.season_number === 26 ? `Populate Season 26 (${showConfigs[selectedShow].seasons[seasonConfig.season_number].cast})` :
             seasonConfig.season_number === 27 ? `Populate Season 27 (${showConfigs[selectedShow].seasons[seasonConfig.season_number].cast})` :
             `Generate Full Cast (${showConfigs[selectedShow].seasons[seasonConfig.season_number].cast})`}
          </Button>
        </div>

        {seasonConfig.season_number === 27 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-green-800">Season 27 Available</h4>
                <p className="text-sm text-green-700 mt-1">Big Brother 27 cast is now available via live scraping from Parade.com. Data is refreshed automatically.</p>
              </div>
            </div>
          </div>
        )}

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