import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ValidationResult {
  field: string;
  value: string | null;
  confidence: number;
  sources: string[];
  conflicts: string[];
}

interface ValidationStatusProps {
  validationResults?: ValidationResult[];
  overallConfidence?: number;
  isValidating?: boolean;
  summary?: {
    high_confidence_count: number;
    low_confidence_count: number;
    unreliable_count: number;
    total_fields: number;
  };
  warnings?: string[];
  errors?: string[];
}

export const ValidationStatusDisplay: React.FC<ValidationStatusProps> = ({
  validationResults = [],
  overallConfidence = 0,
  isValidating = false,
  summary,
  warnings = [],
  errors = []
}) => {
  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 90) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (confidence >= 80) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) return <Badge variant="default" className="bg-green-100 text-green-800">High Confidence</Badge>;
    if (confidence >= 80) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Needs Review</Badge>;
    return <Badge variant="destructive">Low Confidence</Badge>;
  };

  const formatFieldName = (field: string) => {
    return field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isValidating) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-blue-800">Validating data with AI...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!validationResults.length) return null;

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="h-5 w-5" />
            Validation Results
            <Badge variant="outline" className="ml-auto">
              {overallConfidence}% Overall Confidence
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary && (
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summary.high_confidence_count}</div>
                <div className="text-muted-foreground">High Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{summary.low_confidence_count}</div>
                <div className="text-muted-foreground">Needs Review</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{summary.unreliable_count}</div>
                <div className="text-muted-foreground">Unreliable</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Field Details */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:underline">
          <span>View Field Details ({validationResults.length} fields)</span>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-2">
          {validationResults.map((result, index) => (
            <Card key={index} className="border-l-4 border-l-gray-200">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getConfidenceIcon(result.confidence)}
                      <span className="font-medium">{formatFieldName(result.field)}</span>
                      <span className="text-sm text-muted-foreground">
                        ({result.confidence}%)
                      </span>
                    </div>
                    
                    {result.value && (
                      <div className="text-sm mb-2">
                        <strong>Value:</strong> {Array.isArray(result.value) ? result.value.join(', ') : result.value}
                      </div>
                    )}
                    
                    {result.sources.length > 0 && (
                      <div className="text-xs text-muted-foreground mb-1">
                        <strong>Sources:</strong> {result.sources.join(', ')}
                      </div>
                    )}
                    
                    {result.conflicts.length > 0 && (
                      <div className="text-xs text-orange-600">
                        <strong>Conflicts:</strong> {result.conflicts.join(' | ')}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    {getConfidenceBadge(result.confidence)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-yellow-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Warnings ({warnings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="text-sm text-yellow-700 space-y-1">
              {warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-800 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Validation Errors ({errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="text-sm text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};