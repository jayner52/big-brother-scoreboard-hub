import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Contestant, ContestantGroup } from '@/types/pool';


interface ContestantGroupsOverviewProps {
  contestants: Contestant[];
  contestantGroups: ContestantGroup[];
}

export const ContestantGroupsOverview: React.FC<ContestantGroupsOverviewProps> = ({
  contestants,
  contestantGroups,
}) => {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contestant Groups</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contestantGroups.map(group => {
            const groupContestants = contestants.filter(c => c.group_id === group.id);
            const activeCount = groupContestants.filter(c => c.is_active).length;
            
            return (
              <div key={group.id} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">{group.group_name}</h4>
                <p className="text-sm text-gray-600 mb-2">
                  {activeCount} of {groupContestants.length} still active
                </p>
                <div className="space-y-1">
                  {groupContestants.map(contestant => {
                    const isEvicted = !contestant.is_active;
                    return (
                      <div key={contestant.id} className="flex justify-between items-center">
                        <span className={isEvicted ? 'text-red-600 opacity-70' : ''}>
                          {contestant.name}
                        </span>
                        <Badge variant={isEvicted ? "destructive" : "default"} className="text-xs">
                          {isEvicted ? "Out" : "Active"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};