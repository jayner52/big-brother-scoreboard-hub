import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio } from '@/types/admin';
import { Pencil, Save, X, UserPlus } from 'lucide-react';

export const ContestantManagement: React.FC = () => {
  const { toast } = useToast();
  const [contestants, setContestants] = useState<ContestantWithBio[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ContestantWithBio>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContestants();
  }, []);

  const loadContestants = async () => {
    try {
      const { data } = await supabase
        .from('contestants')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (data) {
        const mappedContestants = data.map(c => ({
          id: c.id,
          name: c.name,
          isActive: c.is_active,
          group_id: c.group_id,
          sort_order: c.sort_order,
          bio: c.bio,
          photo_url: c.photo_url
        }));
        setContestants(mappedContestants);
      }
    } catch (error) {
      console.error('Error loading contestants:', error);
      toast({
        title: "Error",
        description: "Failed to load contestants",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contestant: ContestantWithBio) => {
    setEditingId(contestant.id);
    setEditForm(contestant);
  };

  const handleSave = async () => {
    if (!editingId || !editForm.name) return;

    try {
      const { error } = await supabase
        .from('contestants')
        .update({
          name: editForm.name,
          is_active: editForm.isActive,
          bio: editForm.bio,
          photo_url: editForm.photo_url,
          sort_order: editForm.sort_order
        })
        .eq('id', editingId);

      if (error) throw error;

      setContestants(prev => prev.map(c => 
        c.id === editingId ? { ...c, ...editForm } as ContestantWithBio : c
      ));
      
      setEditingId(null);
      setEditForm({});
      
      toast({
        title: "Success!",
        description: "Contestant updated successfully",
      });
    } catch (error) {
      console.error('Error updating contestant:', error);
      toast({
        title: "Error",
        description: "Failed to update contestant",
        variant: "destructive",
      });
    }
  };

  const handleAddContestant = async () => {
    if (!editForm.name) return;

    try {
      const { data, error } = await supabase
        .from('contestants')
        .insert({
          name: editForm.name,
          is_active: editForm.isActive ?? true,
          bio: editForm.bio,
          photo_url: editForm.photo_url,
          sort_order: editForm.sort_order ?? contestants.length + 1
        })
        .select()
        .single();

      if (error) throw error;

      const newContestant: ContestantWithBio = {
        id: data.id,
        name: data.name,
        isActive: data.is_active,
        group_id: data.group_id,
        sort_order: data.sort_order,
        bio: data.bio,
        photo_url: data.photo_url
      };

      setContestants(prev => [...prev, newContestant]);
      setShowAddForm(false);
      setEditForm({});
      
      toast({
        title: "Success!",
        description: "Contestant added successfully",
      });
    } catch (error) {
      console.error('Error adding contestant:', error);
      toast({
        title: "Error",
        description: "Failed to add contestant",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setEditForm({});
  };

  if (loading) {
    return <div className="text-center py-8">Loading contestants...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Contestant Management</h2>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add Contestant
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Contestant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Contestant name"
                />
              </div>
              <div>
                <Label htmlFor="photo_url">Photo URL</Label>
                <Input
                  id="photo_url"
                  value={editForm.photo_url || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, photo_url: e.target.value }))}
                  placeholder="Photo URL"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={editForm.bio || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Contestant bio"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={editForm.isActive ?? true}
                onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isActive: checked }))}
              />
              <Label>Active</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddContestant}>Add Contestant</Button>
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {contestants.map((contestant) => (
          <Card key={contestant.id}>
            <CardContent className="p-4">
              {editingId === contestant.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`name-${contestant.id}`}>Name</Label>
                      <Input
                        id={`name-${contestant.id}`}
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`photo-${contestant.id}`}>Photo URL</Label>
                      <Input
                        id={`photo-${contestant.id}`}
                        value={editForm.photo_url || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, photo_url: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`bio-${contestant.id}`}>Bio</Label>
                    <Textarea
                      id={`bio-${contestant.id}`}
                      value={editForm.bio || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={editForm.isActive ?? true}
                        onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isActive: checked }))}
                      />
                      <Label>Active</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSave}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    {contestant.photo_url && (
                      <img 
                        src={contestant.photo_url} 
                        alt={contestant.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{contestant.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {contestant.isActive ? 'Active' : 'Eliminated'} • Order: {contestant.sort_order}
                      </p>
                      {contestant.bio && (
                        <p className="text-sm text-gray-600 max-w-md">{contestant.bio}</p>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(contestant)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};