import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePool } from '@/contexts/PoolContext';
import { Calculator, Plus, Save, X, Zap, Settings } from 'lucide-react';
import { CustomEventSelector } from '@/components/admin/weekly-events/CustomEventSelector';
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

export const CustomScoringPanel: React.FC = () => {
  const { toast } = useToast();
  const { activePool, updatePool } = usePool();
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>([]);
  const [enabledEvents, setEnabledEvents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCustomEventForm, setShowCustomEventForm] = useState(false);

  useEffect(() => {
    loadScoringRules();
    loadEnabledEvents();
  }, [activePool]);

  const loadScoringRules = async () => {
    try {
      const { data, error } = await supabase
        .from('detailed_scoring_rules')
        .select('*')
        .order('category', { ascending: true })
        .order('subcategory', { ascending: true });

      if (error) throw error;
      setScoringRules(data || []);
    } catch (error) {
      console.error('Error loading scoring rules:', error);
      toast({
        title: "Error",
        description: "Failed to load scoring rules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEnabledEvents = () => {
    if (activePool?.enabled_special_events) {
      setEnabledEvents(activePool.enabled_special_events);
    }
  };

  const updateRule = (id: string, field: keyof ScoringRule, value: any) => {
    setScoringRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };

  const toggleSpecialEvent = (eventId: string) => {
    setEnabledEvents(prev => 
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleCustomEventAdd = async (eventData: { description: string; emoji: string; points: number }) => {
    try {
      const { error } = await supabase
        .from('detailed_scoring_rules')
        .insert({
          category: 'special_events',
          subcategory: 'custom_permanent',
          description: `${eventData.emoji} ${eventData.description}`,
          points: eventData.points,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Custom special event added",
      });

      setShowCustomEventForm(false);
      await loadScoringRules();
    } catch (error) {
      console.error('Error adding custom event:', error);
      toast({
        title: "Error",
        description: "Failed to add custom event",
        variant: "destructive",
      });
    }
  };

  const saveConfiguration = async () => {
    if (!activePool) return;

    setSaving(true);
    try {
      // Save scoring rules
      const updates = scoringRules.map(rule => ({
        id: rule.id,
        points: rule.points,
        is_active: rule.is_active
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('detailed_scoring_rules')
          .update({ points: update.points, is_active: update.is_active })
          .eq('id', update.id);

        if (error) throw error;
      }

      // Save enabled special events
      const result = await updatePool(activePool.id, {
        enabled_special_events: enabledEvents
      });

      if (!result.success) {
        throw new Error('Failed to update enabled events');
      }

      toast({
        title: "Configuration Saved",
        description: "Scoring rules and special events updated successfully",
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const groupedRules = scoringRules.reduce((acc, rule) => {
    const category = rule.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    if (!acc[category]) acc[category] = [];
    acc[category].push(rule);
    return acc;
  }, {} as Record<string, ScoringRule[]>);

  if (loading) {
    return <div className="text-center py-8">Loading scoring configuration...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Scoring Configuration
          </CardTitle>
          <CardDescription>
            Configure point values and enable/disable scoring rules for your pool. Special events can be enabled for weekly tracking.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Scoring Rules */}
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
                      setShowCustomEventForm(true);
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
                              onChange={() => toggleSpecialEvent(event.id)}
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
                            {rule.subcategory && (
                              <p className="text-xs text-muted-foreground mt-1">
                                ID: {rule.subcategory}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={rule.is_active}
                              onCheckedChange={(checked) => updateRule(rule.id, 'is_active', checked)}
                            />
                            <Label className="text-sm">Active</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">Points:</Label>
                            <Input
                              type="number"
                              value={rule.points}
                              onChange={(e) => updateRule(rule.id, 'points', parseInt(e.target.value) || 0)}
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

      {/* Save Button */}
      <Button 
        onClick={saveConfiguration} 
        disabled={saving}
        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
        size="lg"
      >
        <Settings className="h-4 w-4 mr-2" />
        {saving ? 'Saving Configuration...' : 'Save All Configuration'}
      </Button>

      {/* Custom Event Modal */}
      {showCustomEventForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-lg w-full">
            <CustomEventSelector
              onAddCustomEvent={handleCustomEventAdd}
              onCancel={() => setShowCustomEventForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};