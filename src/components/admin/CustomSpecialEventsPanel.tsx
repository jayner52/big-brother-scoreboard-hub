import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface CustomEvent {
  id: string;
  category: string;
  subcategory: string;
  description: string;
  points: number;
  is_active: boolean;
}

export const CustomSpecialEventsPanel: React.FC = () => {
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    points: 5,
    subcategory: 'custom_event'
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCustomEvents();
  }, []);

  const loadCustomEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('detailed_scoring_rules')
        .select('*')
        .eq('category', 'special_events')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomEvents(data || []);
    } catch (error) {
      console.error('Error loading custom events:', error);
      toast({
        title: "Error",
        description: "Failed to load custom events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    try {
      const { error } = await supabase
        .from('detailed_scoring_rules')
        .insert({
          category: 'special_events',
          subcategory: formData.subcategory,
          description: formData.description,
          points: formData.points,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Custom special event added",
      });

      setFormData({ description: '', points: 5, subcategory: 'custom_event' });
      setShowAddForm(false);
      await loadCustomEvents();
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        title: "Error",
        description: "Failed to add custom event",
        variant: "destructive",
      });
    }
  };

  const handleUpdateEvent = async (eventId: string, updates: Partial<CustomEvent>) => {
    try {
      const { error } = await supabase
        .from('detailed_scoring_rules')
        .update(updates)
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Event updated successfully",
      });

      setEditingEvent(null);
      await loadCustomEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('detailed_scoring_rules')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Event deleted successfully",
      });

      await loadCustomEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading custom events...</div>;
  }

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <span>Custom Special Events</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-white/20 hover:bg-white/30 text-white border-white/20"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Event
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {showAddForm && (
          <div className="mb-6 p-4 border rounded-lg bg-muted/30">
            <h3 className="font-semibold mb-3">Add New Special Event</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="description">Event Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Won luxury competition, Received special punishment..."
                />
              </div>
              <div>
                <Label htmlFor="points">Points Value</Label>
                <Input
                  id="points"
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                />
                <Label htmlFor="subcategory" className="mt-2 block">Event Type</Label>
                <Input
                  id="subcategory"
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  placeholder="e.g., luxury_comp, punishment, etc."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddEvent} size="sm">
                <Save className="h-3 w-3 mr-1" />
                Add Event
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)} size="sm">
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customEvents.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  {editingEvent === event.id ? (
                    <Input
                      value={event.description}
                      onChange={(e) => setCustomEvents(prev => prev.map(ev => 
                        ev.id === event.id ? { ...ev, description: e.target.value } : ev
                      ))}
                    />
                  ) : (
                    event.description
                  )}
                </TableCell>
                <TableCell>
                  {editingEvent === event.id ? (
                    <Input
                      type="number"
                      value={event.points}
                      onChange={(e) => setCustomEvents(prev => prev.map(ev => 
                        ev.id === event.id ? { ...ev, points: parseInt(e.target.value) || 0 } : ev
                      ))}
                      className="w-20"
                    />
                  ) : (
                    event.points
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{event.subcategory}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={event.is_active ? "default" : "secondary"}>
                    {event.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {editingEvent === event.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateEvent(event.id, event)}
                          className="h-7"
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingEvent(null)}
                          className="h-7"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingEvent(event.id)}
                          className="h-7"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="h-7 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {customEvents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No custom special events created yet. Click "Add Event" to create your first one.
          </div>
        )}
      </CardContent>
    </Card>
  );
};