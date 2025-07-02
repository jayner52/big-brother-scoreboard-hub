import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Users, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PoolSettings {
  id: string;
  jury_phase_started: boolean;
  jury_start_timestamp?: string;
}

interface Contestant {
  id: string;
  name: string;
  is_active: boolean;
}

export const JuryManagementPanel: React.FC = () => {
  const { toast } = useToast();
  const [poolSettings, setPoolSettings] = useState<PoolSettings | null>(null);
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsResult, contestantsResult] = await Promise.all([
        supabase.from('pool_settings').select('*').limit(1).single(),
        supabase.from('contestants').select('id, name, is_active').order('name')
      ]);

      if (settingsResult.data) {
        setPoolSettings(settingsResult.data);
      }

      if (contestantsResult.data) {
        setContestants(contestantsResult.data);
      }
    } catch (error) {
      console.error('Error loading jury data:', error);
      toast({
        title: "Error",
        description: "Failed to load jury management data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleJuryPhase = async () => {
    if (!poolSettings) return;

    try {
      const newJuryStatus = !poolSettings.jury_phase_started;
      const updates: any = {
        jury_phase_started: newJuryStatus
      };

      if (newJuryStatus) {
        updates.jury_start_timestamp = new Date().toISOString();
        
        // Award 2 points to all currently active contestants for making jury
        const activeContestants = contestants.filter(c => c.is_active);
        
        if (activeContestants.length > 0) {
          const juryEvents = activeContestants.map(contestant => ({
            week_number: 0, // Special week for jury start
            contestant_id: contestant.id,
            event_type: 'jury_member',
            points_awarded: 2,
            event_details: { description: 'Made it to jury phase' }
          }));

          const { error: eventsError } = await supabase
            .from('weekly_events')
            .insert(juryEvents);

          if (eventsError) throw eventsError;
        }
      } else {
        updates.jury_start_timestamp = null;
        
        // Remove jury points if disabling
        const { error: deleteError } = await supabase
          .from('weekly_events')
          .delete()
          .eq('event_type', 'jury_member');

        if (deleteError) throw deleteError;
      }

      const { error } = await supabase
        .from('pool_settings')
        .update(updates)
        .eq('id', poolSettings.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: newJuryStatus 
          ? `Jury phase started! ${contestants.filter(c => c.is_active).length} contestants awarded 2 points each`
          : "Jury phase ended and points removed",
      });

      loadData();
    } catch (error) {
      console.error('Error toggling jury phase:', error);
      toast({
        title: "Error",
        description: "Failed to update jury phase",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading jury management...</div>;
  }

  const activeContestants = contestants.filter(c => c.is_active);
  const juryStartDate = poolSettings?.jury_start_timestamp 
    ? new Date(poolSettings.jury_start_timestamp).toLocaleDateString()
    : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Jury Phase Management
          </CardTitle>
          <CardDescription className="text-indigo-100">
            Manage jury phase and award jury member points
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Jury Status Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="text-base font-medium">Jury Phase Active</Label>
              <p className="text-sm text-gray-600">
                Award 2 points to all remaining contestants for making jury
              </p>
              {poolSettings?.jury_phase_started && juryStartDate && (
                <div className="flex items-center gap-2 mt-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Started: {juryStartDate}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={poolSettings?.jury_phase_started ? "default" : "secondary"}>
                {poolSettings?.jury_phase_started ? "Active" : "Inactive"}
              </Badge>
              <Switch
                checked={poolSettings?.jury_phase_started || false}
                onCheckedChange={toggleJuryPhase}
              />
            </div>
          </div>

          {/* Current Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Jury Eligible</h4>
              <p className="text-2xl font-bold text-blue-900">{activeContestants.length}</p>
              <p className="text-sm text-blue-600">Currently active contestants</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Jury Points</h4>
              <p className="text-2xl font-bold text-green-900">
                {poolSettings?.jury_phase_started ? activeContestants.length * 2 : 0}
              </p>
              <p className="text-sm text-green-600">Total points awarded</p>
            </div>
          </div>

          {/* Jury Members */}
          {poolSettings?.jury_phase_started && (
            <div>
              <h4 className="font-semibold mb-3">Current Jury Members</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {activeContestants.map((contestant) => (
                  <div key={contestant.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Badge variant="outline" className="text-xs">+2</Badge>
                    <span className="text-sm">{contestant.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">How Jury Points Work</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Toggle "Jury Phase Active" when jury phase begins</li>
              <li>• All currently active contestants receive 2 points immediately</li>
              <li>• Points are automatically added to weekly events</li>
              <li>• Turning off jury phase will remove all jury points</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};