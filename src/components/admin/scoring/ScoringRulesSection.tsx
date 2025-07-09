
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Zap, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

import { getScoringRuleEmoji, getCategoryHeaderEmoji } from '@/utils/scoringCategoryEmojis';

interface ScoringRule {
  id: string;
  category: string;
  subcategory: string;
  points: number;
  description: string;
  is_active: boolean;
  emoji?: string;
}

interface ScoringRulesSectionProps {
  groupedRules: Record<string, ScoringRule[]>;
  onUpdateRule: (id: string, field: keyof ScoringRule, value: any) => void;
  onShowCustomEventForm: () => void;
}

export const ScoringRulesSection: React.FC<ScoringRulesSectionProps> = ({
  groupedRules,
  onUpdateRule,
  onShowCustomEventForm
}) => {
  const { toast } = useToast();

  const handleDeleteCustomEvent = async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from('detailed_scoring_rules')
        .update({ is_active: false })
        .eq('id', ruleId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Custom special event deleted",
      });

      // Force a page reload to refresh the data
      window.location.reload();
    } catch (error) {
      console.error('Error deleting custom event:', error);
      toast({
        title: "Error",
        description: "Failed to delete custom event",
        variant: "destructive",
      });
    }
  };

  return (
    <Accordion type="multiple" defaultValue={Object.keys(groupedRules)} className="space-y-4">
      {Object.entries(groupedRules).map(([category, rules]) => {
        const categoryKey = category.toLowerCase().replace(/ /g, '_');
        const categoryEmoji = getCategoryHeaderEmoji(categoryKey);
        
        return (
          <AccordionItem key={category} value={category} className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 font-semibold text-left">
              <div className="flex items-center gap-2">
                <span className="text-lg">{categoryEmoji}</span>
                <span>{category}</span>
                <Badge variant="secondary" className="ml-2">
                  {rules.filter(r => r.is_active).length}/{rules.length} active
                </Badge>
              </div>
              {category === 'Special Events' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowCustomEventForm();
                  }}
                  className="ml-2 h-7"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Custom
                </Button>
              )}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">

              {/* Scoring Rules Grid */}
              <div className="space-y-3">
                {rules.map((rule) => {
                  const ruleEmoji = rule.emoji || getScoringRuleEmoji(rule.category, rule.subcategory);
                  const isCustomEvent = rule.subcategory === 'custom_permanent';
                  
                  return (
                    <div key={rule.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-lg">{ruleEmoji}</span>
                        <div className="flex-1">
                          <Label className="font-medium">{rule.description}</Label>
                          {isCustomEvent && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Custom
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rule.is_active}
                            onCheckedChange={(checked) => onUpdateRule(rule.id, 'is_active', checked)}
                          />
                          <Label className="text-sm">Active</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Points:</Label>
                          <Input
                            type="number"
                            value={rule.points}
                            onChange={(e) => onUpdateRule(rule.id, 'points', parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                        </div>
                        {isCustomEvent && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCustomEvent(rule.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};
