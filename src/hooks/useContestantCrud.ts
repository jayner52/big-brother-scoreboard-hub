import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio } from '@/types/admin';
import { usePool } from '@/contexts/PoolContext';

export const useContestantCrud = (
  contestants: ContestantWithBio[],
  setContestants: React.Dispatch<React.SetStateAction<ContestantWithBio[]>>
) => {
  const { toast } = useToast();
  const { activePool } = usePool();

  const saveContestant = async (editForm: Partial<ContestantWithBio>, editingId: string) => {
    if (!editingId || !editForm.name) return false;

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
      
      toast({
        title: "Success!",
        description: "Contestant updated successfully",
      });

      return true;
    } catch (error) {
      console.error('Error updating contestant:', error);
      toast({
        title: "Error",
        description: "Failed to update contestant",
        variant: "destructive",
      });
      return false;
    }
  };

  const addContestant = async (editForm: Partial<ContestantWithBio>) => {
    if (!editForm.name) return false;

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
      
      toast({
        title: "Success!",
        description: "Contestant added successfully",
      });

      return true;
    } catch (error) {
      console.error('Error adding contestant:', error);
      toast({
        title: "Error",
        description: "Failed to add contestant",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteContestant = async (contestantId: string) => {
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

      return true;
    } catch (error) {
      console.error('Error deleting contestant:', error);
      toast({
        title: "Error",
        description: "Failed to delete contestant",
        variant: "destructive",
      });
      return false;
    }
  };

  const clearAllContestants = async () => {
    if (!activePool?.id) {
      toast({
        title: "Error",
        description: "No active pool found for clearing contestants",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('contestants')
        .delete()
        .eq('pool_id', activePool.id);

      if (error) throw error;

      setContestants([]);
      
      toast({
        title: "Success!",
        description: "All contestants cleared from this pool",
      });

      return true;
    } catch (error) {
      console.error('Error clearing contestants:', error);
      toast({
        title: "Error",
        description: "Failed to clear contestants",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    saveContestant,
    addContestant,
    deleteContestant,
    clearAllContestants
  };
};