import { GroupOperation, GroupData, HouseguestData } from './types';

export const validateRedistributionParams = (poolId: string, numberOfGroups: number): boolean => {
  if (!poolId || numberOfGroups < 1 || numberOfGroups > 8) {
    console.error('Invalid parameters for group generation:', { poolId, numberOfGroups });
    return false;
  }
  return true;
};

export const generateGroupOperations = (
  poolId: string, 
  numberOfGroups: number, 
  enableFreePick: boolean,
  freePickExists: boolean
): GroupOperation[] => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const groupOperations: GroupOperation[] = [];

  // Create regular groups
  for (let i = 0; i < numberOfGroups; i++) {
    const groupName = `Group ${alphabet[i]}`;
    groupOperations.push({
      pool_id: poolId,
      group_name: groupName,
      sort_order: i + 1
    });
  }

  // Ensure Free Pick group exists if enabled
  if (enableFreePick && !freePickExists) {
    groupOperations.push({
      pool_id: poolId,
      group_name: 'Free Pick',
      sort_order: numberOfGroups + 1
    });
  }

  return groupOperations;
};

export const distributeHouseguests = (
  houseguests: HouseguestData[], 
  regularGroups: GroupData[]
): { groupId: string; houseguestIds: string[] }[] => {
  if (regularGroups.length === 0) {
    throw new Error('No regular groups created for houseguest distribution');
  }

  const houseguestsPerGroup = Math.floor(houseguests.length / regularGroups.length);
  const remainder = houseguests.length % regularGroups.length;
  const assignments: { groupId: string; houseguestIds: string[] }[] = [];

  let currentIndex = 0;
  for (let i = 0; i < regularGroups.length; i++) {
    const group = regularGroups[i];
    const groupSize = houseguestsPerGroup + (i < remainder ? 1 : 0);
    
    console.log(`🔧 Assigning ${groupSize} houseguests to ${group.group_name}`);

    const houseguestsForThisGroup = houseguests.slice(currentIndex, currentIndex + groupSize);
    assignments.push({
      groupId: group.id,
      houseguestIds: houseguestsForThisGroup.map(h => h.id)
    });
    
    currentIndex += groupSize;
  }

  return assignments;
};

export const calculatePicksPerTeam = (numberOfGroups: number, enableFreePick: boolean): number => {
  return numberOfGroups + (enableFreePick ? 1 : 0);
};

export const filterRegularGroups = (existingGroups: GroupData[]): string[] => {
  return existingGroups.filter(g => g.group_name !== 'Free Pick').map(g => g.id);
};

export const checkFreePickExists = (existingGroups: GroupData[]): boolean => {
  return existingGroups.some(g => g.group_name === 'Free Pick');
};