import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WeeklyEventForm } from '@/types/admin';

interface ValidationResult {
  field: string;
  value: string | null;
  confidence: number;
  sources: string[];
  conflicts: string[];
}

interface ValidationResponse {
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

export const useAIPopulate = (
  eventForm: WeeklyEventForm,
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>,
  contestants: any[] = []
) => {
  const [isAIPopulating, setIsAIPopulating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationData, setValidationData] = useState<ValidationResponse | null>(null);
  const { toast } = useToast();

  const populateFieldsSequentially = async (data: any) => {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    console.log('Populating fields with data:', data.populated_fields);
    
    // Step 1: HOH Winner
    if (data.populated_fields.hoh_winner && data.confidence_scores.hoh_winner >= 0.95) {
      console.log('Setting HOH Winner:', data.populated_fields.hoh_winner);
      toast({ title: "AI Populating", description: "Setting HOH Winner..." });
      setEventForm(prev => ({ ...prev, hohWinner: data.populated_fields.hoh_winner }));
      await delay(700);
    }
    
    // Step 2: Initial nominees (including 3rd for AI Arena)
    const nomineesToUse = data.populated_fields.nominees || data.populated_fields.initial_nominees;
    if (nomineesToUse && data.confidence_scores.nominees >= 0.95) {
      toast({ title: "AI Populating", description: "Setting Nominees..." });
      // Ensure we have proper number of nominees and slots
      let nomineeSlots = ['', ''];
      if (nomineesToUse.length >= 3) {
        nomineeSlots = ['', '', ''];
      }
      
      // Fill the slots with actual nominees
      nomineesToUse.forEach((nominee, index) => {
        if (index < nomineeSlots.length && nominee) {
          nomineeSlots[index] = nominee;
        }
      });
      
      setEventForm(prev => ({ ...prev, nominees: nomineeSlots }));
      await delay(700);
    }
    
    // Step 3: POV Winner
    if (data.populated_fields.pov_winner && data.confidence_scores.pov_winner >= 0.95) {
      toast({ title: "AI Populating", description: "Setting POV Winner..." });
      setEventForm(prev => ({ ...prev, povWinner: data.populated_fields.pov_winner }));
      await delay(700);
    }
    
    // Step 4: POV Usage
    if (data.populated_fields.pov_used !== undefined) {
      toast({ title: "AI Populating", description: "Setting POV Usage..." });
      setEventForm(prev => ({ ...prev, povUsed: data.populated_fields.pov_used }));
      await delay(500);
      
      // Step 5: POV Used On and Replacement
      if (data.populated_fields.pov_used && data.populated_fields.pov_used_on) {
        console.log('Setting POV Used On:', data.populated_fields.pov_used_on);
        toast({ title: "AI Populating", description: "Setting POV Details..." });
        setEventForm(prev => ({ ...prev, povUsedOn: data.populated_fields.pov_used_on }));
        await delay(500);
        
        if (data.populated_fields.replacement_nominee) {
          console.log('Setting Replacement Nominee:', data.populated_fields.replacement_nominee);
          setEventForm(prev => ({ ...prev, replacementNominee: data.populated_fields.replacement_nominee }));
          await delay(500);
        }
      }
    }
    
    // Step 6: AI Arena Toggle and Winner
    if ((data.populated_fields.bb_arena_played || data.populated_fields.ai_arena_winner) && 
        data.confidence_scores.ai_arena_winner >= 0.95) {
      toast({ title: "AI Populating", description: "Setting AI Arena..." });
      setEventForm(prev => ({ ...prev, aiArenaEnabled: true }));
      await delay(500);
      
      if (data.populated_fields.ai_arena_winner) {
        setEventForm(prev => ({ ...prev, aiArenaWinner: data.populated_fields.ai_arena_winner }));
        await delay(500);
      }
    }
    
    // Step 7: Evicted Contestant
    if (data.populated_fields.evicted && data.confidence_scores.evicted >= 0.95) {
      console.log('Setting Evicted Contestant:', data.populated_fields.evicted);
      toast({ title: "AI Populating", description: "Setting Evicted Contestant..." });
      setEventForm(prev => ({ ...prev, evicted: data.populated_fields.evicted }));
      await delay(500);
    }
    
    toast({
      title: "AI Population Complete!",
      description: `Successfully populated all fields from ${data.sources_used?.length || 0} sources.`,
    });
  };

  const handleValidateData = async () => {
    setIsValidating(true);
    setValidationData(null);
    
    try {
      const contestantNames = contestants.map(c => c.name);
      
      const { data, error } = await supabase.functions.invoke('bb-data-validator', {
        body: {
          season: '26', // Current season - could be made configurable
          week: eventForm.week,
          contestants: contestantNames
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        setValidationData(data);
        
        if (data.overall_confidence >= 90) {
          toast({
            title: "Validation Successful",
            description: `${data.summary.high_confidence_count} fields validated with high confidence`,
          });
        } else if (data.overall_confidence >= 80) {
          toast({
            title: "Validation Complete - Review Needed",
            description: `${data.summary.low_confidence_count} fields need manual review`,
            variant: "default",
          });
        } else {
          toast({
            title: "Validation Warning",
            description: `Low confidence data - manual entry recommended`,
            variant: "destructive",
          });
        }
      } else {
        throw new Error(data?.error || 'Validation failed');
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Validation Failed",
        description: "Could not validate data. Manual entry required.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handlePopulateValidatedData = async () => {
    if (!validationData?.populated_fields) return;
    
    setIsAIPopulating(true);
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    try {
      const fields = validationData.populated_fields;
      
      // Only populate fields with 90%+ confidence
      const highConfidenceFields = validationData.validation_results.filter(r => r.confidence >= 90);
      
      for (const result of highConfidenceFields) {
        const fieldValue = fields[result.field];
        if (fieldValue === null || fieldValue === undefined) continue;
        
        toast({ 
          title: "Populating Field", 
          description: `Setting ${result.field.replace(/_/g, ' ')} (${result.confidence}% confidence)...` 
        });
        
        switch (result.field) {
          case 'hoh_winner':
            setEventForm(prev => ({ ...prev, hohWinner: fieldValue }));
            break;
          case 'pov_winner':
            setEventForm(prev => ({ ...prev, povWinner: fieldValue }));
            break;
          case 'nominees':
            const nominees = Array.isArray(fieldValue) ? fieldValue : [];
            setEventForm(prev => ({ ...prev, nominees: [...nominees, ...Array(Math.max(0, 2 - nominees.length)).fill('')] }));
            break;
          case 'veto_used':
            setEventForm(prev => ({ ...prev, povUsed: fieldValue }));
            break;
          case 'replacement_nominee':
            setEventForm(prev => ({ ...prev, replacementNominee: fieldValue }));
            break;
          case 'evicted':
            setEventForm(prev => ({ ...prev, evicted: fieldValue }));
            break;
        }
        
        await delay(700);
      }
      
      toast({
        title: "Population Complete!",
        description: `Successfully populated ${highConfidenceFields.length} validated fields.`,
      });
      
    } catch (error) {
      console.error('Population error:', error);
      toast({
        title: "Population Failed",
        description: "Error occurred while populating fields.",
        variant: "destructive",
      });
    } finally {
      setIsAIPopulating(false);
    }
  };

  const handleAIPopulate = async () => {
    // First validate, then populate if confidence is good
    await handleValidateData();
  };

  return {
    isAIPopulating,
    isValidating,
    validationData,
    handleAIPopulate,
    handleValidateData,
    handlePopulateValidatedData
  };
};