export interface ContestantProfile {
  name: string;
  age: number;
  hometown: string;
  occupation: string;
  photo: string;
  bio: string;
}

export interface GenerationRequest {
  season_number: number;
  season_theme: string;
  season_format: string;
  cast_size: number;
  special_twists: string;
  count: number;
  pool_id?: string | null;
}

export interface BatchProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  currentBatch: number;
  totalBatches: number;
}

export interface ProcessingResult {
  successful: number;
  failed: Array<{ name: string; error: string }>;
}