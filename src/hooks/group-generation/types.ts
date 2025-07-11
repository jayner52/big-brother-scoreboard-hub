export interface GroupOperation {
  pool_id: string;
  group_name: string;
  sort_order: number;
}

export interface GroupData {
  id: string;
  group_name: string;
  sort_order: number;
}

export interface HouseguestData {
  id: string;
  name: string;
  sort_order: number;
}

export interface GroupRedistributionParams {
  poolId: string;
  numberOfGroups: number;
  enableFreePick?: boolean;
}