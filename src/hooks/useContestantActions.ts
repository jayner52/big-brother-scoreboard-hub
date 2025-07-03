import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio } from '@/types/admin';

export const useContestantActions = (
  contestants: ContestantWithBio[],
  setContestants: React.Dispatch<React.SetStateAction<ContestantWithBio[]>>,
  loadContestants: () => Promise<void>
) => {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ContestantWithBio>>({});
  const [showAddForm, setShowAddForm] = useState(false);

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
          occupation: editForm.occupation,
          season_number: 26,
          data_source: 'manual'
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

  const handleDelete = async (contestantId: string) => {
    try {
      const { error } = await supabase
        .from('contestants')
        .delete()
        .eq('id', contestantId);

      if (error) throw error;

      setContestants(prev => prev.filter(c => c.id !== contestantId));
      
      toast({
        title: "Success!",
        description: "Contestant deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting contestant:', error);
      toast({
        title: "Error",
        description: "Failed to delete contestant",
        variant: "destructive",
      });
    }
  };

  const handleClearAll = async () => {
    try {
      const { error } = await supabase
        .from('contestants')
        .delete()
        .eq('season_number', 26);

      if (error) throw error;

      setContestants([]);
      
      toast({
        title: "Success!",
        description: "All contestants cleared",
      });
    } catch (error) {
      console.error('Error clearing contestants:', error);
      toast({
        title: "Error",
        description: "Failed to clear contestants",
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

  const handleAIProfilesGenerated = async (profiles: any[]) => {
    console.log('Generated profiles:', profiles.length, 'contestants');
    
    // Validate exactly 16 contestants for BB26
    if (profiles.length !== 16) {
      toast({
        title: "Error",
        description: `Expected exactly 16 contestants, got ${profiles.length}`,
        variant: "destructive",
      });
      return;
    }
    
    const newContestants = [];
    
    for (const profile of profiles) {
      try {
        const { data, error } = await supabase
          .from('contestants')
          .insert({
            name: profile.name,
            age: profile.age,
            hometown: profile.hometown,
            occupation: profile.occupation,
            bio: profile.bio,
            photo_url: profile.photo,
            season_number: 26,
            data_source: 'ai_generated',
            ai_generated: true,
            generation_metadata: {
              generated_date: new Date().toISOString(),
              model_used: 'improved_api',
              data_source: 'real_contestant_data'
            },
            is_active: true,
            sort_order: newContestants.length + 1
          })
          .select()
          .single();

        if (error) throw error;
        newContestants.push(data);
      } catch (error) {
        console.error('Error saving AI profile:', error);
        toast({
          title: "Error",
          description: `Failed to save profile for ${profile.name}`,
          variant: "destructive",
        });
      }
    }

    if (newContestants.length > 0) {
      await loadContestants();
      console.log('Cast loaded:', newContestants.length, 'new contestants added');
      toast({
        title: "Success!",
        description: `Added ${newContestants.length} contestant(s)`,
      });
    }
  };

  return {
    editingId,
    editForm,
    showAddForm,
    setShowAddForm,
    handleEdit,
    handleSave,
    handleAddContestant,
    handleDelete,
    handleClearAll,
    handleCancel,
    handleFormChange,
    handleAIProfilesGenerated
  };
};