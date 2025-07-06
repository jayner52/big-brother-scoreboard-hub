import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhotoManager } from './PhotoManager';
import { User, Camera, Info, Target, Trophy } from 'lucide-react';
import { ContestantWithBio } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EnhancedContestantProfileModalProps {
  contestant: ContestantWithBio | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export const EnhancedContestantProfileModal: React.FC<EnhancedContestantProfileModalProps> = ({
  contestant,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  if (!contestant) return null;

  const handlePhotoUpdate = async (newPhotoUrl: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('contestants')
        .update({ photo_url: newPhotoUrl })
        .eq('id', contestant.id);

      if (error) throw error;

      toast({
        title: "Photo updated!",
        description: `Photo updated for ${contestant.name}`,
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error updating photo:', error);
      toast({
        title: "Error",
        description: "Failed to update photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const personalityTraits = Array.isArray(contestant.personalityTraits) 
    ? contestant.personalityTraits 
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {contestant.name} - Profile Details
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="photo" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Photo
            </TabsTrigger>
            <TabsTrigger value="strategy" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Strategy
            </TabsTrigger>
            <TabsTrigger value="game" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Game Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Age:</span>
                    <span>{contestant.age || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Hometown:</span>
                    <span>{contestant.hometown || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Occupation:</span>
                    <span>{contestant.occupation || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <Badge variant={contestant.isActive ? "default" : "destructive"}>
                      {contestant.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-medium block mb-1">Bio:</span>
                    <p className="text-sm text-muted-foreground">
                      {contestant.bio || 'No bio available'}
                    </p>
                  </div>
                  {contestant.familyInfo && (
                    <div>
                      <span className="font-medium block mb-1">Family:</span>
                      <p className="text-sm text-muted-foreground">
                        {contestant.familyInfo}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {personalityTraits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personality Traits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {personalityTraits.map((trait, index) => (
                      <Badge key={index} variant="secondary">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="photo">
            <PhotoManager
              contestantName={contestant.name}
              currentPhotoUrl={contestant.photo_url || undefined}
              onPhotoUpdate={handlePhotoUpdate}
            />
          </TabsContent>

          <TabsContent value="strategy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gameplay Strategy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {contestant.gameplayStrategy || 'No strategy information available'}
                </p>
              </CardContent>
            </Card>
            
            {contestant.backStory && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Backstory</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {contestant.backStory}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="game" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">HOH Winner:</span>
                    <Badge variant={contestant.currentHoh ? "default" : "outline"}>
                      {contestant.currentHoh ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">POV Winner:</span>
                    <Badge variant={contestant.currentPovWinner ? "default" : "outline"}>
                      {contestant.currentPovWinner ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Nominated:</span>
                    <Badge variant={contestant.currentlyNominated ? "destructive" : "outline"}>
                      {contestant.currentlyNominated ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Game Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Times on Block:</span>
                    <span>{contestant.times_on_block_at_eviction || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Saved by Veto:</span>
                    <span>{contestant.times_saved_by_veto || 0}</span>
                  </div>
                  {contestant.final_placement && (
                    <div className="flex justify-between">
                      <span className="font-medium">Final Placement:</span>
                      <span>{contestant.final_placement}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};