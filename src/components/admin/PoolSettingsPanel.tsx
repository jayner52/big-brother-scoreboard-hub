import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, DollarSign, Mail } from 'lucide-react';
import { PrizePoolPanel } from '@/components/admin/PrizePoolPanel';
import { CustomScoringPanel } from '@/components/admin/CustomScoringPanel';

interface PoolSettings {
  id: string;
  season_name: string;
  entry_fee_amount: number;
  entry_fee_currency: string;
  payment_method_1: string;
  payment_details_1: string;
  payment_method_2?: string;
  payment_details_2?: string;
  registration_deadline?: string;
  draft_open: boolean;
  season_active: boolean;
  number_of_groups: number;
  picks_per_team: number;
  enable_free_pick: boolean;
  group_names: string[];
}

export const PoolSettingsPanel: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PoolSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('pool_settings')
        .select('*')
        .single();

      if (error) throw error;

      setSettings({
        id: data.id,
        season_name: data.season_name,
        entry_fee_amount: data.entry_fee_amount,
        entry_fee_currency: data.entry_fee_currency,
        payment_method_1: data.payment_method_1,
        payment_details_1: data.payment_details_1,
        payment_method_2: data.payment_method_2,
        payment_details_2: data.payment_details_2,
        registration_deadline: data.registration_deadline,
        draft_open: data.draft_open,
        season_active: data.season_active,
        number_of_groups: data.number_of_groups || 4,
        picks_per_team: data.picks_per_team || 5,
        enable_free_pick: data.enable_free_pick ?? true,
        group_names: data.group_names || ['Group A', 'Group B', 'Group C', 'Group D']
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load pool settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('pool_settings')
        .update({
          season_name: settings.season_name,
          entry_fee_amount: settings.entry_fee_amount,
          entry_fee_currency: settings.entry_fee_currency,
          payment_method_1: settings.payment_method_1,
          payment_details_1: settings.payment_details_1,
          payment_method_2: settings.payment_method_2,
          payment_details_2: settings.payment_details_2,
          registration_deadline: settings.registration_deadline,
          draft_open: settings.draft_open,
          season_active: settings.season_active,
          number_of_groups: settings.number_of_groups,
          picks_per_team: settings.picks_per_team,
          enable_free_pick: settings.enable_free_pick,
          group_names: settings.group_names,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Pool settings updated successfully",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save pool settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateGroupNames = (index: number, name: string) => {
    if (!settings) return;
    const newNames = [...settings.group_names];
    newNames[index] = name;
    setSettings({ ...settings, group_names: newNames });
  };

  const updateNumberOfGroups = (count: number) => {
    if (!settings) return;
    const newNames = [];
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (let i = 0; i < count; i++) {
      newNames.push(settings.group_names[i] || `Group ${alphabet[i]}`);
    }
    
    setSettings({ 
      ...settings, 
      number_of_groups: count,
      group_names: newNames
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading pool settings...</div>;
  }

  if (!settings) {
    return <div className="text-center py-8">No pool settings found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Pool Settings */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Basic Settings
            </CardTitle>
            <CardDescription className="text-blue-100">
              Core pool configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="season_name">Season Name</Label>
              <Input
                id="season_name"
                value={settings.season_name}
                onChange={(e) => setSettings({ ...settings, season_name: e.target.value })}
                placeholder="e.g., Big Brother 27"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="entry_fee">Entry Fee Amount</Label>
                <Input
                  id="entry_fee"
                  type="number"
                  value={settings.entry_fee_amount}
                  onChange={(e) => setSettings({ ...settings, entry_fee_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select 
                  value={settings.entry_fee_currency} 
                  onValueChange={(value) => setSettings({ ...settings, entry_fee_currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAD">CAD</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.draft_open}
                  onCheckedChange={(checked) => setSettings({ ...settings, draft_open: checked })}
                />
                <Label>Draft Open</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.season_active}
                  onCheckedChange={(checked) => setSettings({ ...settings, season_active: checked })}
                />
                <Label>Season Active</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Methods
            </CardTitle>
            <CardDescription className="text-green-100">
              Configure payment options
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="payment_method_1">Primary Payment Method</Label>
              <Select 
                value={settings.payment_method_1} 
                onValueChange={(value) => setSettings({ ...settings, payment_method_1: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="E-transfer">E-transfer</SelectItem>
                  <SelectItem value="Venmo">Venmo</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                  <SelectItem value="Cash App">Cash App</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment_details_1">Primary Payment Details</Label>
              <Input
                id="payment_details_1"
                value={settings.payment_details_1}
                onChange={(e) => setSettings({ ...settings, payment_details_1: e.target.value })}
                placeholder="email@example.com or @username"
              />
            </div>

            <div>
              <Label htmlFor="payment_method_2">Secondary Payment Method (Optional)</Label>
              <Select 
                value={settings.payment_method_2 || 'none'} 
                onValueChange={(value) => setSettings({ ...settings, payment_method_2: value === 'none' ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="E-transfer">E-transfer</SelectItem>
                  <SelectItem value="Venmo">Venmo</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                  <SelectItem value="Cash App">Cash App</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {settings.payment_method_2 && (
              <div>
                <Label htmlFor="payment_details_2">Secondary Payment Details</Label>
                <Input
                  id="payment_details_2"
                  value={settings.payment_details_2 || ''}
                  onChange={(e) => setSettings({ ...settings, payment_details_2: e.target.value })}
                  placeholder="email@example.com or @username"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Group Configuration */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Draft Configuration
          </CardTitle>
          <CardDescription className="text-purple-100">
            Configure team draft settings and groups
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="number_of_groups">Number of Groups</Label>
              <Select 
                value={settings.number_of_groups.toString()} 
                onValueChange={(value) => updateNumberOfGroups(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="picks_per_team">Picks Per Team</Label>
              <Select 
                value={settings.picks_per_team.toString()} 
                onValueChange={(value) => setSettings({ ...settings, picks_per_team: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 mt-6">
              <Switch
                checked={settings.enable_free_pick}
                onCheckedChange={(checked) => setSettings({ ...settings, enable_free_pick: checked })}
              />
              <Label>Enable Free Pick</Label>
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold">Group Names</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {settings.group_names.map((name, index) => (
                <div key={index}>
                  <Label htmlFor={`group_${index}`}>Group {index + 1}</Label>
                  <Input
                    id={`group_${index}`}
                    value={name}
                    onChange={(e) => updateGroupNames(index, e.target.value)}
                    placeholder={`Group ${String.fromCharCode(65 + index)}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleSave} 
        disabled={saving}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        size="lg"
      >
        {saving ? 'Saving...' : 'Save Pool Settings'}
      </Button>

      <Separator className="my-6" />
      
      <div className="space-y-6">
        <CustomScoringPanel />
        <PrizePoolPanel />
      </div>
    </div>
  );
};