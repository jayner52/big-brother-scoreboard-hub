import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Zap } from 'lucide-react';
import { SPECIAL_EVENTS_CONFIG } from '@/constants/specialEvents';
import { getScoringRuleEmoji, getCategoryHeaderEmoji } from '@/utils/scoringCategoryEmojis';

interface ScoringRule {
  id: string;
  category: string;
  subcategory: string;
  points: number;
  description: string;
  is_active: boolean;
}

interface ScoringRulesSectionProps {
  groupedRules: Record<string, ScoringRule[]>;
  enabledEvents: string[];
  onUpdateRule: (id: string, field: keyof ScoringRule, value: any) => void;
  onToggleSpecialEvent: (eventId: string) => void;
  onShowCustomEventForm: () => void;
}

export const ScoringRulesSection: React.FC<ScoringRulesSectionProps> = ({
  groupedRules,
  enabledEvents,
  onUpdateRule,
  onToggleSpecialEvent,
  onShowCustomEventForm
}) => {
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
              {/* Special Events Configuration */}
              {category === 'Special Events' && (
                <>
                  <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-4 w-4" />
                      <h4 className="font-semibold">Pool Event Settings</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select which special events can be tracked during weekly events. Only enabled events will appear in the weekly events dropdown.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {SPECIAL_EVENTS_CONFIG.toggleable.map(event => (
                        <label 
                          key={event.id} 
                          className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer border transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={enabledEvents.includes(event.id)}
                            onChange={() => onToggleSpecialEvent(event.id)}
                            className="w-4 h-4 text-primary focus:ring-primary"
                          />
                          <span className="text-lg">{event.emoji}</span>
                          <div className="flex-1">
                            <span className="text-sm font-medium">{event.label}</span>
                            {event.points !== undefined && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                (Default: {event.points > 0 ? '+' : ''}{event.points} pts)
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {enabledEvents.length} of {SPECIAL_EVENTS_CONFIG.toggleable.length} events enabled for this pool
                    </div>
                  </div>
                  <Separator className="my-4" />
                </>
              )}

              {/* Scoring Rules Grid */}
              <div className="space-y-3">
                {rules.map((rule) => {
                  const ruleEmoji = getScoringRuleEmoji(rule.category, rule.subcategory);
                  
                  return (
                    <div key={rule.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-lg">{ruleEmoji}</span>
                        <div className="flex-1">
                          <Label className="font-medium">{rule.description}</Label>
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