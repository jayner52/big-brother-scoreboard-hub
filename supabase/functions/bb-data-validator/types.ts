export interface ValidationRequest {
  season: string;
  week: number;
  contestants: string[];
}

export interface ValidationResult {
  field: string;
  value: string | null;
  confidence: number;
  sources: string[];
  conflicts: string[];
}

export interface SourceReliability {
  name: string;
  weight: number;
}

export interface ScrapedSource {
  url: string;
  content: string;
  source_type: string;
  timestamp: string;
}

export interface ParsedData {
  hoh_winner?: string | null;
  pov_winner?: string | null;
  nominees?: string[];
  veto_used?: boolean;
  replacement_nominee?: string | null;
  evicted?: string | null;
  source_type?: string;
  confidence_indicators?: string[];
  found_data?: boolean;
}

export interface ValidationResponse {
  success: boolean;
  overall_confidence: number;
  validation_results: ValidationResult[];
  summary: {
    high_confidence_count: number;
    low_confidence_count: number;
    unreliable_count: number;
    total_fields: number;
  };
  populated_fields: any;
  warnings: string[];
  errors: string[];
}