import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Star } from 'lucide-react';
import { ContestantGroup, Pool } from '@/types/pool';

interface DynamicTeamDraftSectionProps {
  contestantGroups: ContestantGroup[];
  poolData: Pool;
  formData: any; // More flexible type to handle dynamic player fields
  onFormDataChange: (updates: any) => void;
}

export const DynamicTeamDraftSection: React.FC<DynamicTeamDraftSectionProps> = ({
  contestantGroups,
  poolData,
  formData,
  onFormDataChange,
}) => {
  const picksPerTeam = poolData?.picks_per_team || 5;
  
  // **FIXED: Create unique groups list to prevent duplicates**
  const uniqueGroups = contestantGroups.filter((group, index, self) => 
    index === self.findIndex(g => g.group_name === group.group_name)
  );

  // **FIXED: Dynamic player slots based on pool settings**
  const playerSlots = Array.from({ length: picksPerTeam }, (_, i) => `player_${i + 1}`);
  
  const selectedPlayers = playerSlots.map(slot => formData[slot]).filter(player => player?.trim());
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
            Select {picksPerTeam} houseguests strategically from {uniqueGroups.length} groups
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
        {playerSlots.map((playerSlot, slotIndex) => {
          // **FIXED: Each slot maps to a specific group in order, cycling if needed**
          const groupIndex = slotIndex % uniqueGroups.length;
          const group = uniqueGroups[groupIndex];
          
          const playerKey = playerSlot;
          const currentSelection = formData[playerKey];
          const hasSelection = currentSelection && currentSelection.trim();

          return (
            <Card 
              key={`${playerKey}-${group.id}`} // **CRITICAL FIX: Use playerKey for unique keys**
              className={`transition-all duration-200 hover:shadow-md border-2 ${
                hasSelection ? 'border-green-200 bg-green-50/50' : 'hover:border-purple-200'
              }`}
            >
              <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold">
                    {slotIndex + 1}
                  </div>
                  Pick {slotIndex + 1} - {group.group_name}
                </div>
                  {hasSelection && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Selected
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Choose your player from {group.group_name}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Select 
                  value={currentSelection || ''} 
                  onValueChange={(value) => onFormDataChange({ 
                    [playerKey]: value 
                  })}
                >
                  <SelectTrigger className={`transition-all duration-200 ${
                    hasSelection ? 'border-green-300 bg-green-50' : ''
                  }`}>
                    <SelectValue placeholder={`Select from ${group.group_name}`} />
                  </SelectTrigger>
                   <SelectContent className="z-50">
                    {(group.contestants || []).map(contestant => (
                      <SelectItem 
                        key={`${contestant.id}-${playerKey}`}
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

      {duplicateCheck && !poolData?.allow_duplicate_picks && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            ⚠️ You have selected the same player multiple times. This pool doesn't allow duplicate picks.
          </p>
        </div>
      )}
      
      {duplicateCheck && poolData?.allow_duplicate_picks && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700 text-sm">
            ℹ️ You have selected duplicate players. This is allowed in this pool.
          </p>
        </div>
      )}
    </div>
  );
};