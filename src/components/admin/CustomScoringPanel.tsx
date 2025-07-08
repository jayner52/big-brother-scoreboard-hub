import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePool } from '@/contexts/PoolContext';
import { Calculator, Settings } from 'lucide-react';
import { CustomEventSelector } from '@/components/admin/weekly-events/CustomEventSelector';
import { ScoringRulesSection } from '@/components/admin/scoring/ScoringRulesSection';

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
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCustomEventForm, setShowCustomEventForm] = useState(false);

  useEffect(() => {
    loadScoringRules();
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


  const updateRule = (id: string, field: keyof ScoringRule, value: any) => {
    setScoringRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
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


      toast({
        title: "Configuration Saved",
        description: "Scoring rules updated successfully",
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
            Custom Scoring Rules
          </CardTitle>
          <CardDescription>
            Configure point values and enable/disable scoring rules for your pool. Special events can be enabled for weekly tracking.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Scoring Rules */}
      <ScoringRulesSection
        groupedRules={groupedRules}
        onUpdateRule={updateRule}
        onShowCustomEventForm={() => setShowCustomEventForm(true)}
      />

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