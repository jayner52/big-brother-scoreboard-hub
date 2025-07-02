import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Draft Your Team (5 Players)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contestantGroups.map((group, groupIndex) => (
          <div key={group.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{group.group_name}</Badge>
              {group.group_name === 'Free Pick' && (
                <span className="text-sm text-gray-500">(Any player)</span>
              )}
            </div>
            
            {groupIndex < 4 && (
              <Select 
                value={formData[`player_${groupIndex + 1}` as keyof typeof formData] as string} 
                onValueChange={(value) => onFormDataChange({ 
                  [`player_${groupIndex + 1}`]: value 
                } as Partial<TeamDraftSectionProps['formData']>)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select from ${group.group_name}`} />
                </SelectTrigger>
                <SelectContent>
                  {group.contestants?.map(contestant => (
                    <SelectItem key={contestant.id} value={contestant.name}>
                      {contestant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {group.group_name === 'Free Pick' && (
              <Select 
                value={formData.player_5} 
                onValueChange={(value) => onFormDataChange({ player_5: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Free pick - any player" />
                </SelectTrigger>
                <SelectContent>
                  {contestantGroups.flatMap(g => 
                    g.contestants?.map(contestant => (
                      <SelectItem key={contestant.id} value={contestant.name}>
                        {contestant.name}
                      </SelectItem>
                    )) || []
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};