import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Target, Plus, Save, X } from 'lucide-react';

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
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddSpecialEvent, setShowAddSpecialEvent] = useState(false);
  const [newSpecialEvent, setNewSpecialEvent] = useState({
    description: '',
    points: 5
  });

  useEffect(() => {
    loadScoringRules();
  }, []);

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

  const updateRule = (id: string, field: keyof ScoringRule, value: any) => {
    setScoringRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };

  const handleAddSpecialEvent = async () => {
    try {
      const { error } = await supabase
        .from('detailed_scoring_rules')
        .insert({
          category: 'special_events',
          subcategory: 'custom_event',
          description: newSpecialEvent.description,
          points: newSpecialEvent.points,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Special event rule added",
      });

      setNewSpecialEvent({ description: '', points: 5 });
      setShowAddSpecialEvent(false);
      await loadScoringRules();
    } catch (error) {
      console.error('Error adding special event:', error);
      toast({
        title: "Error",
        description: "Failed to add special event",
        variant: "destructive",
      });
    }
  };

  const saveRules = async () => {
    setSaving(true);
    try {
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

      toast({
        title: "Success!",
        description: "Scoring rules updated successfully",
      });
    } catch (error) {
      console.error('Error saving scoring rules:', error);
      toast({
        title: "Error",
        description: "Failed to save scoring rules",
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
    return <div className="text-center py-8">Loading scoring rules...</div>;
  }

  return (
    <div className="p-6">
        
        <Accordion type="multiple" defaultValue={Object.keys(groupedRules)} className="space-y-4">
          {Object.entries(groupedRules).map(([category, rules]) => (
            <AccordionItem key={category} value={category} className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 font-semibold text-left">
                {category} ({rules.length} rules)
                {category === 'Special Events' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddSpecialEvent(!showAddSpecialEvent);
                    }}
                    className="ml-2 h-7"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Event
                  </Button>
                )}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {category === 'Special Events' && showAddSpecialEvent && (
                  <div className="mb-4 p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-3">Add New Special Event Rule</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="new-description">Event Description</Label>
                        <Input
                          id="new-description"
                          value={newSpecialEvent.description}
                          onChange={(e) => setNewSpecialEvent({ ...newSpecialEvent, description: e.target.value })}
                          placeholder="e.g., Won luxury competition, Received punishment..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-points">Points Value</Label>
                        <Input
                          id="new-points"
                          type="number"
                          value={newSpecialEvent.points}
                          onChange={(e) => setNewSpecialEvent({ ...newSpecialEvent, points: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={handleAddSpecialEvent} size="sm">
                        <Save className="h-3 w-3 mr-1" />
                        Add Event
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddSpecialEvent(false)} size="sm">
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                <div className="grid gap-3">
                  {rules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <Label className="font-medium">{rule.description}</Label>
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
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Button 
          onClick={saveRules} 
          disabled={saving}
          className="w-full mt-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
          size="lg"
        >
          {saving ? 'Saving...' : 'Save Scoring Rules'}
        </Button>
    </div>
  );
};