import { supabase } from '@/integrations/supabase/client';

export const useEventTypeMapping = () => {
  const getEventTypeMapping = async (): Promise<Map<string, string>> => {
    const { data: scoringRulesData } = await supabase
      .from('detailed_scoring_rules')
      .select('id, subcategory')
      .eq('is_active', true);

    const eventTypeMapping = new Map();
    scoringRulesData?.forEach(rule => {
      if (rule.subcategory) {
        eventTypeMapping.set(rule.subcategory, rule.id);
      }
    });

    console.log('🔍 Event type mapping:', Object.fromEntries(eventTypeMapping));
    return eventTypeMapping;
  };

  return { getEventTypeMapping };
};