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
  
  // **CRITICAL FIX: Filter groups by those that have contestants to avoid empty dropdowns**
  const groupsWithContestants = contestantGroups.filter(group => 
    group.contestants && group.contestants.length > 0
  );
  
  const regularGroups = groupsWithContestants.filter(g => g.group_name !== 'Free Pick');
  const freePickGroup = contestantGroups.find(g => g.group_name === 'Free Pick'); // Free Pick can be empty initially
  
  // **FIXED: Create draft slots with proper Free Pick handling**
  const createDraftSlots = () => {
    const slots = [];
    
    // Regular group slots (first N-1 picks)
    for (let i = 0; i < Math.min(regularGroups.length, picksPerTeam - 1); i++) {
      slots.push({
        slotNumber: i + 1,
        group: regularGroups[i],
        isFreePick: false,
        playerKey: `player_${i + 1}`
      });
    }
    
    // Free pick slot (always last if we have more picks than regular groups)
    if (picksPerTeam > regularGroups.length && freePickGroup) {
      slots.push({
        slotNumber: picksPerTeam,
        group: freePickGroup,
        isFreePick: true,
        playerKey: `player_${picksPerTeam}`
      });
    }
    
    return slots;
  };
  
  const draftSlots = createDraftSlots();
  const selectedPlayers = draftSlots.map(slot => formData[slot.playerKey]).filter(player => player?.trim());
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
            Select {picksPerTeam} houseguests strategically from {regularGroups.length} groups + free pick
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
        {draftSlots.map((slot) => {
          const currentSelection = formData[slot.playerKey];
          const hasSelection = currentSelection && currentSelection.trim();
          
          // For Free Pick, allow selection from all contestants across all groups
          const availableContestants = slot.isFreePick 
            ? regularGroups.flatMap(g => g.contestants || [])
            : (slot.group.contestants || []);

          return (
            <Card 
              key={`${slot.playerKey}-${slot.group.id}`}
              className={`transition-all duration-200 hover:shadow-md border-2 ${
                hasSelection ? 'border-green-200 bg-green-50/50' : 'hover:border-purple-200'
              } ${slot.isFreePick ? 'border-yellow-200 bg-yellow-50/30' : ''}`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    {slot.isFreePick ? (
                      <Star className="h-5 w-5 text-yellow-600 fill-yellow-500" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold">
                        {slot.slotNumber}
                      </div>
                    )}
                    {slot.isFreePick ? 'Free Pick' : `Pick ${slot.slotNumber} - ${slot.group.group_name}`}
                  </div>
                  {hasSelection && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Selected
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {slot.isFreePick 
                    ? 'Pick any remaining houseguest as your wildcard' 
                    : `Choose your houseguest from ${slot.group.group_name}`
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Select 
                  value={currentSelection || ''} 
                  onValueChange={(value) => onFormDataChange({ 
                    [slot.playerKey]: value 
                  })}
                >
                  <SelectTrigger className={`transition-all duration-200 ${
                    hasSelection ? 'border-green-300 bg-green-50' : ''
                  } ${slot.isFreePick ? 'border-yellow-300 bg-yellow-50' : ''}`}>
                  <SelectValue placeholder={
                    slot.isFreePick 
                      ? 'Free pick - any houseguest' 
                      : `Select from ${slot.group.group_name}`
                  } />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {availableContestants.map(contestant => (
                      <SelectItem 
                        key={`${contestant.id}-${slot.playerKey}`}
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