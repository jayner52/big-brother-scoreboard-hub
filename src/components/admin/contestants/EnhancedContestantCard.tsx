import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ContestantWithBio } from '@/types/admin';
import { Pencil, Bot, Eye, Trash2 } from 'lucide-react';
import { useEvictedContestants } from '@/hooks/useEvictedContestants';

interface EnhancedContestantCardProps {
  contestant: ContestantWithBio & {
    relationship_status?: string;
    family_info?: string;
    physical_description?: any;
    personality_traits?: any;
    gameplay_strategy?: any;
    backstory?: any;
    ai_generated?: boolean;
  };
  onEdit: () => void;
  onView: () => void;
  onDelete?: () => void;
}

export const EnhancedContestantCard: React.FC<EnhancedContestantCardProps> = ({
  contestant,
  onEdit,
  onView,
  onDelete,
}) => {
  const { evictedContestants } = useEvictedContestants();
  const isEvicted = evictedContestants.includes(contestant.name);
  
  const archetype = contestant.personality_traits?.archetype;
  const threatLevel = contestant.gameplay_strategy?.threat_level;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            {contestant.photo_url ? (
              <img 
                src={contestant.photo_url} 
                alt={contestant.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  // First fallback: try a generic CBS URL pattern
                  const nameSlug = contestant.name.toLowerCase().replace(/\s+/g, '-');
                  const fallbackUrl = `https://www.cbs.com/shows/big_brother/cast/26/${nameSlug}/`;
                  
                  if (e.currentTarget.src !== fallbackUrl) {
                    e.currentTarget.src = fallbackUrl;
                  } else {
                    // Final fallback: generated avatar
                    e.currentTarget.src = `https://api.dicebear.com/7.x/personas/svg?seed=${contestant.name}&backgroundColor=b6e3f4`;
                  }
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-2 border-gray-200">
                <span className="text-lg font-semibold text-gray-600">
                  {contestant.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            )}
            <div>
              <h3 className={`font-bold text-lg ${isEvicted ? 'text-red-600' : 'text-green-600'}`}>
                {contestant.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {contestant.age && `${contestant.age} years old`}
                {contestant.age && contestant.hometown && ' • '}
                {contestant.hometown}
              </p>
              <p className="text-sm text-muted-foreground">
                {contestant.occupation}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            {contestant.ai_generated && (
              <Badge variant="secondary" className="text-xs">
                <Bot className="h-3 w-3 mr-1" />
                AI Generated
              </Badge>
            )}
            {isEvicted && (
              <Badge variant="destructive" className="text-xs">
                Evicted
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Personality & Strategy Info */}
        {archetype && (
          <div className="flex items-center gap-2">
            <Badge variant="outline">{archetype}</Badge>
            {threatLevel && (
              <Badge variant={threatLevel >= 7 ? "destructive" : threatLevel >= 4 ? "default" : "secondary"}>
                Threat: {threatLevel}/10
              </Badge>
            )}
          </div>
        )}

        {/* Bio */}
        {contestant.bio && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {contestant.bio}
          </p>
        )}

        {/* Quick Stats */}
        {contestant.personality_traits && (
          <div className="text-xs text-muted-foreground">
            <p><strong>Strategy:</strong> {contestant.gameplay_strategy?.alliance_tendency}</p>
            <p><strong>Strength:</strong> {contestant.gameplay_strategy?.competition_strength}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={onView}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          {onDelete && (
            <Button size="sm" variant="outline" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};