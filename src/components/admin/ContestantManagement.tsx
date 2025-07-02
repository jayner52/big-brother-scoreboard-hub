import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio, ContestantGroup } from '@/types/admin';
import { UserPlus } from 'lucide-react';
import { ContestantForm } from './contestants/ContestantForm';
import { ContestantList } from './contestants/ContestantList';

export const ContestantManagement: React.FC = () => {
  const { toast } = useToast();
  const [contestants, setContestants] = useState<ContestantWithBio[]>([]);
  const [groups, setGroups] = useState<ContestantGroup[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ContestantWithBio>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContestants();
    loadGroups();
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
          photo_url: c.photo_url,
          hometown: c.hometown,
          age: c.age,
          occupation: c.occupation
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

  const loadGroups = async () => {
    try {
      const { data } = await supabase
        .from('contestant_groups')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (data) {
        setGroups(data);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
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
          sort_order: editForm.sort_order,
          group_id: editForm.group_id,
          hometown: editForm.hometown,
          age: editForm.age,
          occupation: editForm.occupation
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
          sort_order: editForm.sort_order ?? contestants.length + 1,
          group_id: editForm.group_id,
          hometown: editForm.hometown,
          age: editForm.age,
          occupation: editForm.occupation
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
        photo_url: data.photo_url,
        hometown: data.hometown,
        age: data.age,
        occupation: data.occupation
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

  const handleFormChange = (updates: Partial<ContestantWithBio>) => {
    setEditForm(prev => ({ ...prev, ...updates }));
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
        <ContestantForm
          editForm={editForm}
          groups={groups}
          onFormChange={handleFormChange}
          onSave={handleAddContestant}
          onCancel={handleCancel}
          isEditing={false}
        />
      )}

      <ContestantList
        contestants={contestants}
        groups={groups}
        editingId={editingId}
        editForm={editForm}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        onFormChange={handleFormChange}
      />
    </div>
  );
};