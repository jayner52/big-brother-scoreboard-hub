import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Star, AlertCircle } from 'lucide-react';
import { ContestantGroup } from '@/types/pool';

interface TeamDraftSectionProps {
  contestantGroups: ContestantGroup[];
  formData: {
    player_1: string;
    player_2: string;
    player_3: string;
    player_4: string;
    player_5: string;
  };
  onFormDataChange: (updates: Partial<TeamDraftSectionProps['formData']>) => void;
}

export const TeamDraftSection: React.FC<TeamDraftSectionProps> = ({
  contestantGroups,
  formData,
  onFormDataChange,
}) => {
  const selectedPlayers = Object.values(formData).filter(player => player.trim());
  const duplicateCheck = new Set(selectedPlayers).size !== selectedPlayers.length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white py-4 px-6 rounded-lg mb-4 shadow-lg">
          <h3 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Users className="h-7 w-7" />
            Draft Your Dream Team
          </h3>
          <p className="text-emerald-100 text-lg">
            Select 5 houseguests strategically - one from each group plus a free pick
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
        {contestantGroups.map((group, groupIndex) => {
          const isFreePick = group.group_name === 'Free Pick';
          const playerKey = isFreePick ? 'player_5' : `player_${groupIndex + 1}`;
          const currentSelection = formData[playerKey as keyof typeof formData];
          const hasSelection = currentSelection && currentSelection.trim();

          return (
            <Card 
              key={group.id} 
              className={`transition-all duration-200 hover:shadow-md border-2 ${
                hasSelection ? 'border-green-200 bg-green-50/50' : 'hover:border-purple-200'
              }`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    {isFreePick ? (
                      <Star className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold">
                        {groupIndex + 1}
                      </div>
                    )}
                    {group.group_name}
                  </div>
                  {hasSelection && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Selected
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {isFreePick 
                    ? 'Pick any remaining houseguest as your wildcard' 
                    : `Choose your player from ${group.group_name}`
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Select 
                  value={currentSelection || ''} 
                  onValueChange={(value) => onFormDataChange({ 
                    [playerKey]: value 
                  } as Partial<TeamDraftSectionProps['formData']>)}
                >
                  <SelectTrigger className={`transition-all duration-200 ${
                    hasSelection ? 'border-green-300 bg-green-50' : ''
                  }`}>
                    <SelectValue placeholder={
                      isFreePick 
                        ? 'Free pick - any player' 
                        : `Select from ${group.group_name}`
                    } />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {(isFreePick 
                      ? contestantGroups.flatMap(g => g.contestants || [])
                      : group.contestants || []
                    ).map(contestant => (
                      <SelectItem 
                        key={contestant.id} 
                        value={contestant.name}
                      >
                        {contestant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
    </div>
  );
};