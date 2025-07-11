import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, DollarSign, UserCheck, HelpCircle, Clock, Eye, EyeOff, Users, Calculator } from 'lucide-react';
import { usePool } from '@/contexts/PoolContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PrizePoolManagement } from '@/components/admin/PrizePoolManagement';
import { CustomScoringPanel } from '@/components/admin/CustomScoringPanel';

import { useGroupAutoGeneration } from '@/hooks/useGroupAutoGeneration';
import { InstructionAccordion } from './InstructionAccordion';
import { RegistrationDeadlineControl } from './RegistrationDeadlineControl';

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
  registration_timezone?: string;
  draft_open: boolean;
  season_active: boolean;
  number_of_groups: number;
  picks_per_team: number;
  enable_free_pick: boolean;
  number_of_free_picks: number;
  group_names: string[];
  has_buy_in: boolean;
  buy_in_description?: string;
}

const PoolSettingsPanel: React.FC = () => {
  console.log('🔧 PoolSettingsPanel: Component mounting');
  
  const { toast } = useToast();
  const { activePool, updatePool } = usePool();
  const { redistributeHouseguests, saveGroupNames, isGenerating } = useGroupAutoGeneration();
  const [settings, setSettings] = useState<PoolSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasExistingEntries, setHasExistingEntries] = useState(false);

  // Helper functions for timezone-aware datetime handling
  const formatDateTimeLocal = (isoString?: string | null): string => {
    if (!isoString) return '';
    
    try {
      const date = new Date(isoString);
      // Format to datetime-local format (YYYY-MM-DDTHH:mm)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return '';
    }
  };

  const handleDateTimeChange = (datetimeLocalValue: string) => {
    if (!datetimeLocalValue) {
      setSettings({ ...settings!, registration_deadline: null });
      return;
    }

    try {
      // Create date object from datetime-local input (this treats it as local time)
      const localDate = new Date(datetimeLocalValue);
      
      // Convert to ISO string which represents the actual moment in time
      const isoString = localDate.toISOString();
      
      setSettings({ ...settings!, registration_deadline: isoString });
    } catch (error) {
      console.error('Error handling datetime change:', error);
    }
  };


  useEffect(() => {
    if (activePool) {
      loadSettings();
      checkExistingEntries();
    }
    // Load expanded sections from localStorage
    const saved = localStorage.getItem('pool_settings_expanded');
    if (saved) {
      try {
        setExpandedSections(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading expanded sections:', error);
      }
    }

    // Add event listener for checklist navigation
    const handleAccordionControl = (event: CustomEvent) => {
      const { section } = event.detail;
      if (section) {
        setExpandedSections([section]);
      }
    };

    document.addEventListener('navigateToAccordion', handleAccordionControl as EventListener);
    
    return () => {
      document.removeEventListener('navigateToAccordion', handleAccordionControl as EventListener);
    };
  }, [activePool]);

  const checkExistingEntries = async () => {
    if (!activePool) return;
    
    try {
      const { data, error } = await supabase
        .from('pool_entries')
        .select('id')
        .eq('pool_id', activePool.id)
        .limit(1);
      
      if (error) throw error;
      setHasExistingEntries((data || []).length > 0);
    } catch (error) {
      console.error('Error checking existing entries:', error);
    }
  };

  const handleBuyInAmountChange = (newAmount: number) => {
    if (hasExistingEntries && newAmount !== settings?.entry_fee_amount) {
      toast({
        title: "⚠️ Buy-In Amount Changed",
        description: "This change may cause confusion for participants who already paid the previous amount. Consider communicating this change to your pool members.",
        variant: "default",
      });
    }
    setSettings({ ...settings!, entry_fee_amount: newAmount });
  };

  const loadSettings = async () => {
    if (!activePool) return;
    
    try {
      // Load current groups from database to get actual count and names
      const { data: currentGroups } = await supabase
        .from('contestant_groups')
        .select('group_name, sort_order')
        .eq('pool_id', activePool.id)
        .neq('group_name', 'Free Pick')
        .order('sort_order');
      
      const actualGroupCount = currentGroups?.length || 4;
      const actualGroupNames = currentGroups?.map(g => g.group_name) || ['Group A', 'Group B', 'Group C', 'Group D'];
      
        // Load from pools table with actual group data
        setSettings({
          id: activePool.id,
          season_name: activePool.name,
          entry_fee_amount: activePool.entry_fee_amount,
          entry_fee_currency: activePool.entry_fee_currency,
          payment_method_1: activePool.payment_method_1,
          payment_details_1: activePool.payment_details_1,
          payment_method_2: activePool.payment_method_2,
          payment_details_2: activePool.payment_details_2,
          registration_deadline: activePool.registration_deadline,
          draft_open: activePool.draft_open,
          season_active: !activePool.season_locked,
          number_of_groups: actualGroupCount, // Use actual count from database
          picks_per_team: activePool.picks_per_team,
          enable_free_pick: true,
          number_of_free_picks: (activePool as any).number_of_free_picks || 1,
          group_names: actualGroupNames, // Use actual names from database
          has_buy_in: activePool.has_buy_in,
          buy_in_description: activePool.buy_in_description
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
    if (!settings || !activePool) return;

    setSaving(true);
    try {
      // Calculate picks_per_team based on formula
      const calculatedPicksPerTeam = settings.number_of_groups + (settings.enable_free_pick ? (settings.number_of_free_picks || 1) : 0);
      
      const success = await updatePool(activePool.id, {
        name: settings.season_name,
        entry_fee_amount: settings.entry_fee_amount,
        entry_fee_currency: settings.entry_fee_currency,
        payment_method_1: settings.payment_method_1,
        payment_details_1: settings.payment_details_1,
        payment_method_2: settings.payment_method_2,
        payment_details_2: settings.payment_details_2,
        registration_deadline: settings.registration_deadline,
        draft_open: settings.draft_open,
        season_locked: !settings.season_active,
        picks_per_team: calculatedPicksPerTeam,
        number_of_free_picks: settings.number_of_free_picks || 1,
        has_buy_in: settings.has_buy_in,
        buy_in_description: settings.buy_in_description,
      } as any);

      if (!success) throw new Error('Failed to update pool');

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

  const updateGroupNames = async (index: number, name: string) => {
    if (!settings || !activePool) return;
    const newNames = [...settings.group_names];
    newNames[index] = name;
    setSettings({ ...settings, group_names: newNames });
    
    // CRITICAL FIX: Save group names to database immediately
    await saveGroupNames(activePool.id, newNames);
  };

  const updateNumberOfGroups = async (count: number) => {
    if (!settings || !activePool) return;
    
    // CRITICAL: Validate input before processing
    if (count < 1 || count > 8) {
      toast({
        title: "Invalid Number of Groups",
        description: "Please enter a number between 1 and 8",
        variant: "destructive",
      });
      return;
    }
    
    console.log('🏗️ VALIDATED - Updating number of groups:', count);
    
    // Update UI state optimistically
    const newNames = [];
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (let i = 0; i < count; i++) {
      newNames.push(settings.group_names[i] || `Group ${alphabet[i]}`);
    }
    
    const newPicksPerTeam = count + (settings.enable_free_pick ? 1 : 0);
    
      const success = await redistributeHouseguests(activePool.id, count, settings.enable_free_pick);
      
      if (success) {
        // Update local state with new configuration
        setSettings({ 
          ...settings, 
          number_of_groups: count,
          group_names: newNames,
          picks_per_team: newPicksPerTeam
        });
        console.log('✅ Database update successful, UI state updated');
      } else {
        // Database update failed - show error and keep original state
        console.error('❌ Database update failed');
        toast({
          title: "Error Updating Groups",
          description: "Failed to update groups. Please try again.",
          variant: "destructive",
        });
      }
  };

  const handleExpandedSectionsChange = (value: string[]) => {
    setExpandedSections(value);
    localStorage.setItem('pool_settings_expanded', JSON.stringify(value));
  };

  const handleHidePicksToggle = async (hidePicksEnabled: boolean) => {
    if (!activePool) return;
    setIsUpdating(true);
    try {
      const success = await updatePool(activePool.id, {
        hide_picks_until_draft_closed: hidePicksEnabled
      });

      if (success) {
        toast({
          title: hidePicksEnabled ? "Picks Hidden" : "Picks Visible",
          description: hidePicksEnabled 
            ? "Everyone's picks will be hidden until draft closes"
            : "Everyone's picks are now visible to all participants",
        });
      } else {
        throw new Error('Failed to update pool settings');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update draft timing setting",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDraftToggle = async (draftOpen: boolean) => {
    if (!activePool) return;
    
    // If closing the draft, show cascade confirmation
    if (!draftOpen) {
      const confirmed = window.confirm(
        'Closing the draft will automatically:\n\n' +
        '• Disable new participants from joining\n' +
        '• Lock all existing teams (prevent edits)\n' +
        '• Make everyone\'s picks visible\n\n' +
        'Continue?'
      );
      
      if (!confirmed) return;
    }

    setIsUpdating(true);
    try {
      let updateData: any = { draft_open: draftOpen };
      
      // Apply cascade settings when closing draft
      if (!draftOpen) {
        updateData = {
          draft_open: false,
          allow_new_participants: false,
          draft_locked: true,
          hide_picks_until_draft_closed: false
        };
      }

      const success = await updatePool(activePool.id, updateData);

      if (success) {
        toast({
          title: draftOpen ? "Draft Opened" : "Draft Closed",
          description: draftOpen 
            ? "Participants can now submit and edit their teams"
            : "Draft closed successfully. New participants disabled, teams locked, and picks are now visible.",
        });
      } else {
        throw new Error('Failed to update draft status');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update draft status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAllowNewParticipantsToggle = async (allowNewParticipants: boolean) => {
    if (!activePool) return;
    setIsUpdating(true);
    try {
      const success = await updatePool(activePool.id, {
        allow_new_participants: allowNewParticipants
      });

      if (success) {
        toast({
          title: allowNewParticipants ? "New Participants Allowed" : "New Participants Blocked",
          description: allowNewParticipants 
            ? "New participants can now join and create teams"
            : "New participants are blocked from joining",
        });
      } else {
        throw new Error('Failed to update new participants setting');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update new participants setting",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDraftLockToggle = async (draftLocked: boolean) => {
    if (!activePool) return;
    setIsUpdating(true);
    try {
      const success = await updatePool(activePool.id, {
        draft_locked: draftLocked
      });

      if (success) {
        toast({
          title: draftLocked ? "Draft Locked" : "Draft Unlocked",
          description: draftLocked 
            ? "All draft submissions are permanently locked"
            : "Draft submissions can be modified again",
        });
      } else {
        throw new Error('Failed to update draft lock status');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update draft lock status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAllowDuplicatePicksToggle = async (allowDuplicates: boolean) => {
    if (!activePool) return;
    
    console.log('🔧 Allow Duplicate Picks Toggle:', {
      currentValue: activePool.allow_duplicate_picks,
      newValue: allowDuplicates,
      poolId: activePool.id
    });
    
    setIsUpdating(true);
    try {
      const result = await updatePool(activePool.id, {
        allow_duplicate_picks: allowDuplicates
      });

      console.log('🔧 Update result:', result);

      if (result) {
        toast({
          title: allowDuplicates ? "Duplicate Picks Allowed" : "Duplicate Picks Disabled",
          description: allowDuplicates 
            ? "Teams can now draft the same houseguest"
            : "Each houseguest can only be drafted once per team",
        });
      } else {
        throw new Error('Failed to update duplicate picks setting');
      }
    } catch (error) {
      console.error('🔧 Error updating duplicate picks:', error);
      toast({
        title: "Error",
        description: "Failed to update duplicate picks setting",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading pool settings...</div>;
  }

  if (!settings) {
    return <div className="text-center py-8">No pool settings found</div>;
  }

  return (
    <div className="space-y-6">
      <InstructionAccordion 
        title="Pool Settings Configuration" 
        tabKey="pool_settings"
      >
        <div className="space-y-3">
          <p>Configure basic pool settings. Changes here affect the entire pool. Be careful when modifying settings mid-season.</p>
          
          <div>
            <p><strong>🕒 Draft Timing Strategy:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
              <li>Open draft early to give participants time to research</li>
              <li>Set deadline 1-2 hours before season premiere</li>
              <li>Lock draft once all teams are submitted to prevent changes</li>
              <li>Use "Hide Picks" to prevent strategy copying until deadline</li>
            </ul>
          </div>

          <div>
            <p><strong>💰 Payment Method Best Practices:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
              <li>Provide 2 payment options for participant convenience</li>
              <li>Use clear, specific details (email for e-transfer, @username for Venmo)</li>
              <li>Include reference format in description (e.g., "Pool Name - Your Name")</li>
              <li>Confirm payments manually in Pool Entries tab</li>
            </ul>
          </div>

          <div>
            <p><strong>👥 Group Configuration Impact:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
              <li>Each group becomes a draft category (teams pick 1 from each)</li>
              <li>Changing group count redistributes ALL houseguests automatically</li>
              <li>Balanced groups ensure fair competition and strategy</li>
              <li>Consider gender, age, or experience-based groupings</li>
            </ul>
          </div>

          <div>
            <p><strong>⚠️ Mid-Season Change Warnings:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
              <li>Buy-in changes after payment confuse participants</li>
              <li>Group modifications reset participant drafts</li>
              <li>Prize settings affect participant expectations</li>
              <li>Communicate all changes clearly to pool members</li>
            </ul>
          </div>

          <div>
            <p><strong>🏆 Prize Pool Tips:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
              <li>Set percentage-based distribution for automatic calculation</li>
              <li>Consider admin fee for management effort (typically 5-10%)</li>
              <li>Show prize amounts to motivate participation</li>
              <li>Plan for ties in final standings</li>
            </ul>
          </div>
        </div>
      </InstructionAccordion>
      
      <Accordion
        type="multiple" 
        value={expandedSections} 
        onValueChange={handleExpandedSectionsChange}
        className="space-y-6"
      >
        {/* Basic Pool Settings */}
        <AccordionItem value="basic-settings" className="border-0" data-accordion-section="basic-settings">
          <Card>
            <AccordionTrigger className="hover:no-underline p-0" data-accordion-section="basic-settings">
              <CardHeader className="bg-gradient-to-r from-teal-700 to-teal-600 text-white rounded-t-lg w-full">
                <CardTitle className="flex items-center gap-2 text-left">
                  <Settings className="h-5 w-5" />
                  Basic Settings
                </CardTitle>
                <CardDescription className="text-teal-100 text-left">
                  Core pool configuration
                </CardDescription>
              </CardHeader>
            </AccordionTrigger>
            <AccordionContent>
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


                {/* Enhanced Registration Deadline Control */}
                      {activePool && (
                        <RegistrationDeadlineControl
                          poolId={activePool.id}
                          currentDeadline={activePool.registration_deadline}
                          disabled={saving || isUpdating}
                        />
                      )}

                {/* CRITICAL FIX: Consolidated Buy-In Settings */}
                <div className="space-y-4 p-4 border rounded-lg bg-green-50">
                  <h4 className="font-semibold text-green-800 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Buy-In Settings
                  </h4>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.has_buy_in}
                      onCheckedChange={(checked) => setSettings({ ...settings, has_buy_in: checked })}
                    />
                    <Label>Has Buy-In</Label>
                  </div>

                  {settings.has_buy_in && (
                    <div className="grid grid-cols-2 gap-4 ml-6">
                      <div>
                        <Label htmlFor="buy_in_amount">Buy-In Amount</Label>
                        <Input
                          id="buy_in_amount"
                          type="number"
                          value={settings.entry_fee_amount}
                          onChange={(e) => handleBuyInAmountChange(parseFloat(e.target.value) || 0)}
                        />
                        {hasExistingEntries && (
                          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                            <HelpCircle className="h-3 w-3" />
                            Warning: Changing buy-in amount may create confusion for participants who already paid
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="buy_in_currency">Currency</Label>
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
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="payment_method">Primary Payment Method</Label>
                        <Select 
                          value={settings.payment_method_1} 
                          onValueChange={(value) => setSettings({ ...settings, payment_method_1: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="E-transfer">E-transfer</SelectItem>
                            <SelectItem value="Venmo">Venmo</SelectItem>
                            <SelectItem value="PayPal">PayPal</SelectItem>
                            <SelectItem value="Zelle">Zelle</SelectItem>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Cash App">Cash App</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="payment_details">Payment Details</Label>
                        <Input
                          id="payment_details"
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
                            <SelectItem value="Zelle">Zelle</SelectItem>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Cash App">Cash App</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
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
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Draft Open toggle removed - managed in Draft Timing & Visibility section */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.season_active}
                      onCheckedChange={(checked) => setSettings({ ...settings, season_active: checked })}
                    />
                    <Label>Season Active</Label>
                  </div>
                </div>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>


        {/* Draft Configuration */}
        <AccordionItem value="draft-configuration" className="border-0" data-accordion-section="draft-configuration">
          <Card>
            <AccordionTrigger className="hover:no-underline p-0" data-accordion-section="draft-configuration">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg w-full">
                <CardTitle className="flex items-center gap-2 text-left">
                  <UserCheck className="h-5 w-5" />
                  Draft Configuration
                </CardTitle>
                <CardDescription className="text-purple-100 text-left">
                  Configure team draft settings and groups
                </CardDescription>
              </CardHeader>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="number_of_groups">Number of Groups (0-8)</Label>
                    <Select 
                      value={settings.number_of_groups.toString()} 
                      onValueChange={(value) => {
                        const count = parseInt(value);
                        if (count >= 0 && count <= 8) {
                          updateNumberOfGroups(count);
                          // If 0 groups selected, enable free picks
                          if (count === 0 && !settings.enable_free_pick) {
                            setSettings({ 
                              ...settings, 
                              number_of_groups: count,
                              enable_free_pick: true,
                              number_of_free_picks: Math.max(settings.number_of_free_picks || 1, 1)
                            });
                          }
                        } else {
                          toast({
                            title: "Invalid Selection",
                            description: "Please select between 0 and 8 groups",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} Group{num !== 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      {settings.number_of_groups === 0 
                        ? "With 0 groups, teams will only draft free picks" 
                        : "Each team makes one pick from each group"
                      }
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={settings.enable_free_pick}
                        onCheckedChange={(checked) => setSettings({ ...settings, enable_free_pick: checked })}
                        disabled={settings.number_of_groups === 0} // Always enabled when 0 groups
                      />
                      <Label>Enable Free Picks</Label>
                      {settings.number_of_groups === 0 && (
                        <span className="text-sm text-amber-600">(Required with 0 groups)</span>
                      )}
                    </div>
                    
                    {settings.enable_free_pick && (
                      <div className="ml-6">
                        <Label htmlFor="number_of_free_picks">Number of Free Picks</Label>
                        <Select 
                          value={(settings.number_of_free_picks || 1).toString()} 
                          onValueChange={(value) => {
                            const count = parseInt(value);
                            setSettings({ ...settings, number_of_free_picks: count });
                          }}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} Free Pick{num !== 1 ? 's' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Calculated Picks Display */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Team Configuration Summary</h4>
                  <div className="space-y-1">
                    {settings.number_of_groups > 0 && (
                      <p className="text-sm">
                        {settings.number_of_groups} pick{settings.number_of_groups !== 1 ? 's' : ''} from groups
                      </p>
                    )}
                    {settings.enable_free_pick && (
                      <p className="text-sm">
                        {settings.number_of_free_picks || 1} free pick{(settings.number_of_free_picks || 1) !== 1 ? 's' : ''}
                      </p>
                    )}
                    <p className="text-lg font-bold text-blue-900 pt-2 border-t border-blue-200">
                      Total picks per team: {settings.number_of_groups + (settings.enable_free_pick ? (settings.number_of_free_picks || 1) : 0)}
                    </p>
                  </div>
                </div>

                  {/* Allow Duplicate Picks */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base font-medium">
                          Allow Duplicate Picks
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Teams can draft the same houseguest if enabled
                        </p>
                      </div>
                      <Switch
                        checked={activePool?.allow_duplicate_picks ?? true}
                        onCheckedChange={handleAllowDuplicatePicksToggle}
                        disabled={isUpdating || activePool?.season_locked}
                      />
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
             </AccordionContent>
           </Card>
         </AccordionItem>
 
         {/* Draft Timing & Visibility */}
         <AccordionItem value="draft-timing" className="border-0" data-accordion-section="draft-timing">
           <Card>
             <AccordionTrigger className="hover:no-underline p-0" data-accordion-section="draft-timing">
               <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg w-full">
                 <CardTitle className="flex items-center gap-2 text-left">
                   <Clock className="h-5 w-5" />
                   Draft Timing & Visibility
                 </CardTitle>
                 <CardDescription className="text-blue-100 text-left">
                   Control draft access and pick visibility
                 </CardDescription>
               </CardHeader>
             </AccordionTrigger>
             <AccordionContent>
               <CardContent className="p-6 space-y-6">
                 
                  {/* Current Status */}
                  {activePool && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Draft Open</p>
                          <p className="text-xs text-muted-foreground">Admin control</p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${activePool.draft_open ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {activePool.draft_open ? "Open" : "Closed"}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm font-medium">New Participants</p>
                          <p className="text-xs text-muted-foreground">Can join pool?</p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${activePool.allow_new_participants ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {activePool.allow_new_participants ? "Allowed" : "Blocked"}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Draft Lock</p>
                          <p className="text-xs text-muted-foreground">Are teams locked?</p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${activePool.draft_locked ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                          {activePool.draft_locked ? "Locked" : "Editable"}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Picks Visibility</p>
                          <p className="text-xs text-muted-foreground">Can others see picks?</p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${activePool.hide_picks_until_draft_closed ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                          {activePool.hide_picks_until_draft_closed ? "Hidden" : "Visible"}
                        </div>
                      </div>
                    </div>
                  )}
 
                  {/* Draft Open/Close Control */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Label htmlFor="draft-open-toggle" className="text-base font-medium cursor-help flex items-center gap-1">
                              Draft Open
                              <HelpCircle className="h-3 w-3 text-muted-foreground" />
                            </Label>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>When draft closes, the following will automatically occur: New participants disabled, All teams locked, Everyone's picks become visible</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <p className="text-sm text-muted-foreground">
                        When enabled, draft submissions and edits are allowed
                      </p>
                    </div>
                    <Switch
                      id="draft-open-toggle"
                      checked={activePool?.draft_open || false}
                      onCheckedChange={handleDraftToggle}
                      disabled={isUpdating || activePool?.season_locked}
                    />
                  </div>

                  {/* Allow New Participants Control */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="allow-new-participants-toggle" className="text-base font-medium">
                        Allow New Participants
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        When enabled, new participants can join and create teams
                      </p>
                    </div>
                    <Switch
                      id="allow-new-participants-toggle"
                      checked={activePool?.allow_new_participants || false}
                      onCheckedChange={handleAllowNewParticipantsToggle}
                      disabled={isUpdating || activePool?.season_locked}
                    />
                  </div>
 
                 {/* Draft Lock Control */}
                 <div className="flex items-center justify-between">
                   <div className="space-y-1">
                     <Label htmlFor="draft-lock-toggle" className="text-base font-medium">
                       Lock All Teams
                     </Label>
                     <p className="text-sm text-muted-foreground">
                       Prevent all participants from editing their teams (permanent)
                     </p>
                   </div>
                   <Switch
                     id="draft-lock-toggle"
                     checked={activePool?.draft_locked || false}
                     onCheckedChange={handleDraftLockToggle}
                     disabled={isUpdating || activePool?.season_locked}
                   />
                 </div>
 
                 {/* Hide Picks Control */}
                 <div className="flex items-center justify-between">
                   <div className="space-y-1">
                     <Label htmlFor="hide-picks-toggle" className="text-base font-medium flex items-center gap-2">
                       {activePool?.hide_picks_until_draft_closed ? (
                         <EyeOff className="h-4 w-4" />
                       ) : (
                         <Eye className="h-4 w-4" />
                       )}
                       Hide Everyone's Picks
                     </Label>
                     <p className="text-sm text-muted-foreground">
                       Hide team selections from participants until draft period ends
                     </p>
                   </div>
                   <Switch
                     id="hide-picks-toggle"
                     checked={activePool?.hide_picks_until_draft_closed || false}
                     onCheckedChange={handleHidePicksToggle}
                     disabled={isUpdating || activePool?.season_locked}
                   />
                 </div>
 
                 {/* Information Alert */}
                 <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                   <p className="text-sm text-blue-700">
                     <strong>Draft Strategy:</strong> Many pool organizers hide picks during the draft period to prevent 
                     participants from copying popular selections. Once you close the draft, everyone's picks become visible.
                   </p>
                 </div>
 
                 {/* Locked Warning */}
                 {activePool?.season_locked && (
                   <div className="p-3 bg-red-50 border border-red-200 rounded">
                     <p className="text-sm text-red-700">
                       Season is completed and locked. No draft settings can be modified.
                     </p>
                   </div>
                 )}
               </CardContent>
             </AccordionContent>
           </Card>
         </AccordionItem>

        {/* Custom Scoring Rules */}
        <AccordionItem value="custom-scoring" className="border-0" data-accordion-section="custom-scoring">
          <Card>
            <AccordionTrigger className="hover:no-underline p-0" data-accordion-section="custom-scoring">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg w-full">
                <CardTitle className="flex items-center gap-2 text-left">
                  <Calculator className="h-5 w-5" />
                  Custom Scoring Rules
                </CardTitle>
                <CardDescription className="text-orange-100 text-left">
                  Configure point values and scoring logic
                </CardDescription>
              </CardHeader>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="p-0">
                <CustomScoringPanel />
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>


        {/* Prize Pool */}
        <AccordionItem value="prize-pool" className="border-0" data-accordion-section="prize-pool">
          <Card>
            <AccordionTrigger className="hover:no-underline p-0" data-accordion-section="prize-pool">
              <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-lg w-full">
                <CardTitle className="flex items-center gap-2 text-left">
                  <DollarSign className="h-5 w-5" />
                  Prize Pool Management
                </CardTitle>
                <CardDescription className="text-yellow-100 text-left">
                  Configure prize distribution and amounts
                </CardDescription>
              </CardHeader>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="p-0">
                <PrizePoolManagement />
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>

      <Button 
        onClick={handleSave} 
        disabled={saving}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        size="lg"
      >
        {saving ? 'Saving...' : 'Save Pool Settings'}
      </Button>
    </div>
  );
};

export default PoolSettingsPanel;