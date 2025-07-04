import { ValidationResult, ParsedData } from './types.ts';
import { SOURCE_RELIABILITY } from './config.ts';

export async function validateDataPoints(sourceData: ParsedData[], contestants: string[]): Promise<ValidationResult[]> {
  const fields = ['hoh_winner', 'pov_winner', 'nominees', 'veto_used', 'replacement_nominee', 'evicted'];
  const results: ValidationResult[] = [];

  for (const field of fields) {
    const fieldData = sourceData
      .filter(data => data && data[field] !== null && data[field] !== undefined)
      .map(data => ({
        value: data[field],
        source: data.source_type || 'Unknown',
        indicators: data.confidence_indicators || []
      }));

    if (fieldData.length === 0) {
      results.push({
        field,
        value: null,
        confidence: 0,
        sources: [],
        conflicts: []
      });
      continue;
    }

    // Calculate consensus and confidence
    const consensus = findConsensusValue(fieldData, field);
    const confidence = calculateFieldConfidence(fieldData, consensus, field);
    const sources = fieldData.map(d => d.source);
    const conflicts = findConflicts(fieldData, field);

    results.push({
      field,
      value: consensus,
      confidence,
      sources: [...new Set(sources)], // Remove duplicates
      conflicts
    });
  }

  return results;
}

export function findConsensusValue(fieldData: any[], field: string): string | null {
  if (fieldData.length === 0) return null;

  // For arrays (nominees), find most common array
  if (field === 'nominees') {
    const nomineeCounts = new Map();
    fieldData.forEach(data => {
      const key = JSON.stringify(data.value);
      nomineeCounts.set(key, (nomineeCounts.get(key) || 0) + getSourceWeight(data.source));
    });
    
    const bestNominees = [...nomineeCounts.entries()]
      .sort((a, b) => b[1] - a[1])[0];
    
    return bestNominees ? JSON.parse(bestNominees[0]) : null;
  }

  // For other fields, find weighted consensus
  const valueCounts = new Map();
  fieldData.forEach(data => {
    const weight = getSourceWeight(data.source);
    valueCounts.set(data.value, (valueCounts.get(data.value) || 0) + weight);
  });

  const bestValue = [...valueCounts.entries()]
    .sort((a, b) => b[1] - a[1])[0];

  return bestValue ? bestValue[0] : null;
}

export function calculateFieldConfidence(fieldData: any[], consensus: any, field: string): number {
  if (!fieldData.length) return 0;

  let totalWeight = 0;
  let consensusWeight = 0;

  fieldData.forEach(data => {
    const weight = getSourceWeight(data.source);
    totalWeight += weight;
    
    const matches = field === 'nominees' 
      ? JSON.stringify(data.value) === JSON.stringify(consensus)
      : data.value === consensus;
      
    if (matches) {
      consensusWeight += weight;
      // Bonus for quality indicators
      if (data.indicators.includes('verified')) consensusWeight += 5;
      if (data.indicators.includes('multiple_sources')) consensusWeight += 3;
      if (data.indicators.includes('official')) consensusWeight += 7;
    }
  });

  const baseConfidence = totalWeight > 0 ? (consensusWeight / totalWeight) * 100 : 0;
  
  // Boost confidence for multiple agreeing sources
  const agreeingSourceCount = fieldData.filter(data => {
    return field === 'nominees' 
      ? JSON.stringify(data.value) === JSON.stringify(consensus)
      : data.value === consensus;
  }).length;
  
  const sourceBonus = Math.min(agreeingSourceCount * 5, 20);
  
  return Math.min(baseConfidence + sourceBonus, 100);
}

export function getSourceWeight(sourceName: string): number {
  const source = SOURCE_RELIABILITY.find(s => 
    sourceName && sourceName.toLowerCase().includes(s.name.toLowerCase())
  );
  return source ? source.weight : 50; // Default weight for unknown sources
}

export function findConflicts(fieldData: any[], field: string): string[] {
  const conflicts = [];
  const valueGroups = new Map();

  fieldData.forEach(data => {
    const key = field === 'nominees' ? JSON.stringify(data.value) : data.value;
    if (!valueGroups.has(key)) {
      valueGroups.set(key, []);
    }
    valueGroups.get(key).push(data.source);
  });

  if (valueGroups.size > 1) {
    valueGroups.forEach((sources, value) => {
      conflicts.push(`${sources.join(', ')}: ${value}`);
    });
  }

  return conflicts;
}

export function calculateOverallConfidence(results: ValidationResult[]): number {
  if (results.length === 0) return 0;
  
  const totalConfidence = results.reduce((sum, result) => sum + result.confidence, 0);
  return Math.round(totalConfidence / results.length);
}

export function extractPopulatedFields(highConfidenceResults: ValidationResult[]): any {
  const populated = {};
  
  highConfidenceResults.forEach(result => {
    if (result.value !== null) {
      populated[result.field] = result.value;
    }
  });
  
  return populated;
}