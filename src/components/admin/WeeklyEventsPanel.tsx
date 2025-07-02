import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio, WeeklyEventForm, DetailedScoringRule } from '@/types/admin';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Users, Award, Zap } from 'lucide-react';

export const WeeklyEventsPanel: React.FC = () => {
  const { toast } = useToast();
  const [contestants, setContestants] = useState<ContestantWithBio[]>([]);
  const [scoringRules, setScoringRules] = useState<DetailedScoringRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(1);
  
  const [eventForm, setEventForm] = useState<WeeklyEventForm>({
    week: 1,
    nominees: [],
    hohWinner: '',
    povWinner: '',
    povUsed: false,
    replacementNominee: '',
    evicted: '',
    specialEvents: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load contestants
      const { data: contestantsData } = await supabase
        .from('contestants')
        .select('*')
        .order('name');
      
      if (contestantsData) {
        const mapped = contestantsData.map(c => ({
          id: c.id,
          name: c.name,
          isActive: c.is_active,
          group_id: c.group_id,
          sort_order: c.sort_order,
          bio: c.bio,
          photo_url: c.photo_url
        }));
        setContestants(mapped);
      }

      // Load scoring rules
      const { data: rulesData } = await supabase
        .from('detailed_scoring_rules')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });
      
      if (rulesData) {
        const mappedRules = rulesData.map(r => ({
          ...r,
          created_at: new Date(r.created_at)
        }));
        setScoringRules(mappedRules);
      }

      // Get current week number
      const { data: weeklyData } = await supabase
        .from('weekly_results')
        .select('week_number')
        .order('week_number', { ascending: false })
        .limit(1);
      
      const nextWeek = weeklyData?.[0]?.week_number ? weeklyData[0].week_number + 1 : 1;
      setCurrentWeek(nextWeek);
      setEventForm(prev => ({ ...prev, week: nextWeek }));

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addNominee = (contestant: string) => {
    if (!contestant || eventForm.nominees.includes(contestant) || eventForm.nominees.length >= 2) return;
    setEventForm(prev => ({
      ...prev,
      nominees: [...prev.nominees, contestant]
    }));
  };

  const removeNominee = (contestant: string) => {
    setEventForm(prev => ({
      ...prev,
      nominees: prev.nominees.filter(n => n !== contestant)
    }));
  };

  const addSpecialEvent = () => {
    setEventForm(prev => ({
      ...prev,
      specialEvents: [...prev.specialEvents, { contestant: '', eventType: '', description: '' }]
    }));
  };

  const updateSpecialEvent = (index: number, field: string, value: string) => {
    setEventForm(prev => ({
      ...prev,
      specialEvents: prev.specialEvents.map((event, i) => 
        i === index ? { ...event, [field]: value } : event
      )
    }));
  };

  const removeSpecialEvent = (index: number) => {
    setEventForm(prev => ({
      ...prev,
      specialEvents: prev.specialEvents.filter((_, i) => i !== index)
    }));
  };

  const calculatePoints = (eventType: string) => {
    const rule = scoringRules.find(r => 
      r.subcategory === eventType || 
      (r.category === 'weekly_competition' && eventType.includes(r.subcategory || ''))
    );
    return rule?.points || 0;
  };

  const handleSubmitWeek = async () => {
    try {
      // Create weekly events entries
      const events = [];
      
      // Add HOH winner
      if (eventForm.hohWinner) {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestants.find(c => c.name === eventForm.hohWinner)?.id,
          event_type: 'hoh_winner',
          points_awarded: calculatePoints('hoh_winner')
        });
      }

      // Add POV winner
      if (eventForm.povWinner) {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestants.find(c => c.name === eventForm.povWinner)?.id,
          event_type: 'pov_winner',
          points_awarded: calculatePoints('pov_winner')
        });
      }

      // Add nominees
      eventForm.nominees.forEach((nominee, index) => {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestants.find(c => c.name === nominee)?.id,
          event_type: index === 0 ? 'nominee_1' : 'nominee_2',
          points_awarded: calculatePoints('nominee')
        });
      });

      // Add replacement nominee
      if (eventForm.replacementNominee) {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestants.find(c => c.name === eventForm.replacementNominee)?.id,
          event_type: 'replacement_nominee',
          points_awarded: calculatePoints('replacement_nominee')
        });
      }

      // Add evicted contestant
      if (eventForm.evicted) {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestants.find(c => c.name === eventForm.evicted)?.id,
          event_type: 'evicted',
          points_awarded: 0 // No points for being evicted
        });
      }

      // Add survival points for non-evicted active contestants
      const evictedId = contestants.find(c => c.name === eventForm.evicted)?.id;
      const activeContestants = contestants.filter(c => c.isActive && c.id !== evictedId);
      
      activeContestants.forEach(contestant => {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestant.id,
          event_type: 'weekly_survival',
          points_awarded: calculatePoints('weekly_survival')
        });
      });

      // Insert weekly events
      const { error: eventsError } = await supabase
        .from('weekly_events')
        .insert(events);

      if (eventsError) throw eventsError;

      // Insert special events
      const specialEvents = eventForm.specialEvents
        .filter(se => se.contestant && se.eventType)
        .map(se => ({
          week_number: eventForm.week,
          contestant_id: contestants.find(c => c.name === se.contestant)?.id,
          event_type: se.eventType,
          description: se.description,
          points_awarded: calculatePoints(se.eventType)
        }));

      if (specialEvents.length > 0) {
        const { error: specialError } = await supabase
          .from('special_events')
          .insert(specialEvents);

        if (specialError) throw specialError;
      }

      // Update evicted contestant status
      if (eventForm.evicted) {
        const { error: contestantError } = await supabase
          .from('contestants')
          .update({ is_active: false })
          .eq('name', eventForm.evicted);

        if (contestantError) throw contestantError;
      }

      // Insert into legacy weekly_results table for compatibility
      const { error: weeklyError } = await supabase
        .from('weekly_results')
        .insert({
          week_number: eventForm.week,
          hoh_winner: eventForm.hohWinner || null,
          pov_winner: eventForm.povWinner || null,
          evicted_contestant: eventForm.evicted || null,
        });

      if (weeklyError) throw weeklyError;

      toast({
        title: "Success!",
        description: `Week ${eventForm.week} events recorded successfully`,
      });

      // Reset form for next week
      setEventForm({
        week: eventForm.week + 1,
        nominees: [],
        hohWinner: '',
        povWinner: '',
        povUsed: false,
        replacementNominee: '',
        evicted: '',
        specialEvents: []
      });

      // Reload data
      loadData();

    } catch (error) {
      console.error('Error submitting week:', error);
      toast({
        title: "Error",
        description: "Failed to record weekly events",
        variant: "destructive",
      });
    }
  };

  const getPointsPreview = () => {
    const preview: Record<string, number> = {};
    
    // HOH points
    if (eventForm.hohWinner) {
      preview[eventForm.hohWinner] = (preview[eventForm.hohWinner] || 0) + calculatePoints('hoh_winner');
    }
    
    // POV points
    if (eventForm.povWinner) {
      preview[eventForm.povWinner] = (preview[eventForm.povWinner] || 0) + calculatePoints('pov_winner');
    }
    
    // Nominee points
    eventForm.nominees.forEach(nominee => {
      preview[nominee] = (preview[nominee] || 0) + calculatePoints('nominee');
    });
    
    // Replacement nominee points
    if (eventForm.replacementNominee) {
      preview[eventForm.replacementNominee] = (preview[eventForm.replacementNominee] || 0) + calculatePoints('replacement_nominee');
    }
    
    // Survival points for all active except evicted
    const activeContestants = contestants.filter(c => c.isActive && c.name !== eventForm.evicted);
    activeContestants.forEach(contestant => {
      preview[contestant.name] = (preview[contestant.name] || 0) + calculatePoints('weekly_survival');
    });
    
    // Special events points
    eventForm.specialEvents.forEach(se => {
      if (se.contestant && se.eventType) {
        preview[se.contestant] = (preview[se.contestant] || 0) + calculatePoints(se.eventType);
      }
    });
    
    return preview;
  };

  if (loading) {
    return <div className="text-center py-8">Loading weekly events panel...</div>;
  }

  const activeContestants = contestants.filter(c => c.isActive);
  const pointsPreview = getPointsPreview();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Week {eventForm.week} Events
          </CardTitle>
          <CardDescription className="text-purple-100">
            Record all events for the week and automatically calculate points
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Competition Winners */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Head of Household Winner</Label>
              <Select value={eventForm.hohWinner} onValueChange={(value) => setEventForm(prev => ({ ...prev, hohWinner: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select HOH winner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No winner</SelectItem>
                  {activeContestants.map(contestant => (
                    <SelectItem key={contestant.id} value={contestant.name}>
                      {contestant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-semibold">Power of Veto Winner</Label>
              <Select value={eventForm.povWinner} onValueChange={(value) => setEventForm(prev => ({ ...prev, povWinner: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select POV winner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No winner</SelectItem>
                  {activeContestants.map(contestant => (
                    <SelectItem key={contestant.id} value={contestant.name}>
                      {contestant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Nominees */}
          <div>
            <Label className="font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Nominees ({eventForm.nominees.length}/2)
            </Label>
            <div className="mt-2 space-y-2">
              <div className="flex gap-2 flex-wrap">
                {eventForm.nominees.map(nominee => (
                  <Badge key={nominee} variant="destructive" className="flex items-center gap-1">
                    {nominee}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeNominee(nominee)} />
                  </Badge>
                ))}
              </div>
              {eventForm.nominees.length < 2 && (
                <Select value="" onValueChange={addNominee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add nominee" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeContestants
                      .filter(c => !eventForm.nominees.includes(c.name))
                      .map(contestant => (
                        <SelectItem key={contestant.id} value={contestant.name}>
                          {contestant.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* POV Usage and Replacement */}
          {eventForm.povWinner && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={eventForm.povUsed}
                  onCheckedChange={(checked) => setEventForm(prev => ({ ...prev, povUsed: checked }))}
                />
                <Label>POV was used</Label>
              </div>

              {eventForm.povUsed && (
                <div>
                  <Label className="font-semibold">Replacement Nominee</Label>
                  <Select 
                    value={eventForm.replacementNominee || ''} 
                    onValueChange={(value) => setEventForm(prev => ({ ...prev, replacementNominee: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select replacement nominee" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeContestants
                        .filter(c => !eventForm.nominees.includes(c.name) && c.name !== eventForm.povWinner)
                        .map(contestant => (
                          <SelectItem key={contestant.id} value={contestant.name}>
                            {contestant.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Evicted Contestant */}
          <div>
            <Label className="font-semibold">Evicted Contestant</Label>
            <Select value={eventForm.evicted} onValueChange={(value) => setEventForm(prev => ({ ...prev, evicted: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select evicted contestant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No eviction</SelectItem>
                {activeContestants.map(contestant => (
                  <SelectItem key={contestant.id} value={contestant.name}>
                    {contestant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Special Events */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Special Events
              </Label>
              <Button size="sm" variant="outline" onClick={addSpecialEvent}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {eventForm.specialEvents.map((event, index) => (
                <Card key={index} className="p-3">
                  <div className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      <Label className="text-xs">Contestant</Label>
                      <Select 
                        value={event.contestant} 
                        onValueChange={(value) => updateSpecialEvent(index, 'contestant', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeContestants.map(contestant => (
                            <SelectItem key={contestant.id} value={contestant.name}>
                              {contestant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Label className="text-xs">Event Type</Label>
                      <Select 
                        value={event.eventType} 
                        onValueChange={(value) => updateSpecialEvent(index, 'eventType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {scoringRules
                            .filter(r => r.category === 'special_events' && r.subcategory && r.subcategory.trim() !== '')
                            .map(rule => (
                              <SelectItem key={rule.id} value={rule.subcategory!}>
                                {rule.description} ({rule.points > 0 ? '+' : ''}{rule.points}pts)
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-4">
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={event.description || ''}
                        onChange={(e) => updateSpecialEvent(index, 'description', e.target.value)}
                        placeholder="Optional details"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button size="sm" variant="destructive" onClick={() => removeSpecialEvent(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Points Preview */}
          {Object.keys(pointsPreview).length > 0 && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Points Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(pointsPreview)
                    .sort(([,a], [,b]) => b - a)
                    .map(([contestant, points]) => (
                      <div key={contestant} className="flex justify-between">
                        <span className="font-medium">{contestant}:</span>
                        <span className={points > 0 ? 'text-green-600' : points < 0 ? 'text-red-600' : ''}>
                          {points > 0 ? '+' : ''}{points}pts
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Button 
            onClick={handleSubmitWeek} 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            size="lg"
          >
            Submit Week {eventForm.week} Events & Calculate Points
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};