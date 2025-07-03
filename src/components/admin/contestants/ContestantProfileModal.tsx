import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Bot, User, Target, BookOpen, Heart } from 'lucide-react';

interface EnhancedContestant {
  name: string;
  age?: number;
  hometown?: string;
  occupation?: string;
  bio?: string;
  relationship_status?: string;
  family_info?: string;
  physical_description?: any;
  personality_traits?: any;
  gameplay_strategy?: any;
  backstory?: any;
  ai_generated?: boolean;
  photo_url?: string;
}

interface ContestantProfileModalProps {
  contestant: EnhancedContestant | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ContestantProfileModal: React.FC<ContestantProfileModalProps> = ({
  contestant,
  isOpen,
  onClose,
}) => {
  if (!contestant) return null;

  const { 
    name, 
    age, 
    hometown, 
    occupation, 
    bio,
    relationship_status,
    family_info,
    physical_description,
    personality_traits,
    gameplay_strategy,
    backstory,
    ai_generated,
    photo_url
  } = contestant;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {photo_url && (
              <img 
                src={photo_url} 
                alt={name}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <DialogTitle className="text-2xl">{name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-muted-foreground">
                  {age && `${age} years old`}
                  {age && hometown && ' • '}
                  {hometown}
                </span>
                {ai_generated && (
                  <Badge variant="secondary">
                    <Bot className="h-3 w-3 mr-1" />
                    AI Generated
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <strong>Occupation:</strong> {occupation}
              </div>
              {relationship_status && (
                <div>
                  <strong>Relationship Status:</strong> {relationship_status}
                </div>
              )}
              {family_info && (
                <div>
                  <strong>Family:</strong> {family_info}
                </div>
              )}
              {bio && (
                <div>
                  <strong>Bio:</strong> {bio}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Physical Description */}
          {physical_description && (
            <Card>
              <CardHeader>
                <CardTitle>Physical Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {physical_description.height && (
                  <div><strong>Height:</strong> {physical_description.height}</div>
                )}
                {physical_description.build && (
                  <div><strong>Build:</strong> {physical_description.build}</div>
                )}
                {physical_description.hair_color && (
                  <div><strong>Hair:</strong> {physical_description.hair_color}</div>
                )}
                {physical_description.eye_color && (
                  <div><strong>Eyes:</strong> {physical_description.eye_color}</div>
                )}
                {physical_description.distinguishing_features && (
                  <div><strong>Features:</strong> {physical_description.distinguishing_features}</div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Personality Traits */}
          {personality_traits && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Personality
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {personality_traits.archetype && (
                  <div>
                    <strong>Archetype:</strong>
                    <Badge className="ml-2">{personality_traits.archetype}</Badge>
                  </div>
                )}
                {personality_traits.catchphrase && (
                  <div>
                    <strong>Catchphrase:</strong> "{personality_traits.catchphrase}"
                  </div>
                )}
                {personality_traits.motivation && (
                  <div>
                    <strong>Motivation:</strong> {personality_traits.motivation}
                  </div>
                )}
                {personality_traits.strengths && (
                  <div>
                    <strong>Strengths:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {personality_traits.strengths.map((strength: string, index: number) => (
                        <Badge key={index} variant="secondary">{strength}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {personality_traits.weaknesses && (
                  <div>
                    <strong>Weaknesses:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {personality_traits.weaknesses.map((weakness: string, index: number) => (
                        <Badge key={index} variant="outline">{weakness}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Gameplay Strategy */}
          {gameplay_strategy && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Gameplay Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {gameplay_strategy.alliance_tendency && (
                  <div>
                    <strong>Alliance Style:</strong> {gameplay_strategy.alliance_tendency}
                  </div>
                )}
                {gameplay_strategy.competition_strength && (
                  <div>
                    <strong>Competition Strength:</strong> {gameplay_strategy.competition_strength}
                  </div>
                )}
                {gameplay_strategy.threat_level && (
                  <div>
                    <strong>Threat Level:</strong>
                    <Badge className="ml-2" variant={
                      gameplay_strategy.threat_level >= 7 ? "destructive" : 
                      gameplay_strategy.threat_level >= 4 ? "default" : "secondary"
                    }>
                      {gameplay_strategy.threat_level}/10
                    </Badge>
                  </div>
                )}
                {gameplay_strategy.predicted_placement && (
                  <div>
                    <strong>Predicted Placement:</strong> {gameplay_strategy.predicted_placement}
                  </div>
                )}
                {gameplay_strategy.strategy_description && (
                  <div>
                    <strong>Strategy:</strong> {gameplay_strategy.strategy_description}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Backstory */}
          {backstory && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Backstory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {backstory.life_story && (
                  <div>
                    <strong>Life Story:</strong> {backstory.life_story}
                  </div>
                )}
                {backstory.fears && (
                  <div>
                    <strong>Fears:</strong> {backstory.fears}
                  </div>
                )}
                {backstory.guilty_pleasure && (
                  <div>
                    <strong>Guilty Pleasure:</strong> {backstory.guilty_pleasure}
                  </div>
                )}
                {backstory.hobbies && (
                  <div>
                    <strong>Hobbies:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {backstory.hobbies.map((hobby: string, index: number) => (
                        <Badge key={index} variant="outline">{hobby}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {backstory.fun_facts && (
                  <div>
                    <strong>Fun Facts:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {backstory.fun_facts.map((fact: string, index: number) => (
                        <li key={index} className="text-sm">{fact}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};