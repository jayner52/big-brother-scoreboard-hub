import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WeeklyEventForm } from '@/types/admin';

export const useAIPopulate = (
  eventForm: WeeklyEventForm,
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>
) => {
  const [isAIPopulating, setIsAIPopulating] = useState(false);
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

  const handleAIPopulate = async () => {
    setIsAIPopulating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('bb-ai-populate', {
        body: {
          week: eventForm.week,
          season: 'current',
          confidence_threshold: 0.95
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        console.log('AI Populate response:', data);
        toast({
          title: "AI Population Starting...",
          description: "Populating fields sequentially...",
        });

        // Sequential population with delays for visual feedback
        await populateFieldsSequentially(data);
      } else {
        console.error('AI Populate failed:', data);
        throw new Error(data?.message || 'Failed to populate data');
      }
    } catch (error) {
      console.error('AI populate error:', error);
      toast({
        title: "AI Population Failed",
        description: "Failed to populate with AI. Please try again or enter data manually.",
        variant: "destructive",
      });
    } finally {
      setIsAIPopulating(false);
    }
  };

  return {
    isAIPopulating,
    handleAIPopulate
  };
};