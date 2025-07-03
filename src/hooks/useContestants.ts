import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio, ContestantGroup } from '@/types/admin';

export const useContestants = () => {
  const { toast } = useToast();
  const [contestants, setContestants] = useState<ContestantWithBio[]>([]);
  const [groups, setGroups] = useState<ContestantGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const loadContestants = async () => {
    try {
      const { data } = await supabase
        .from('contestants')
        .select('*')
        .eq('season_number', 26)
        .order('name', { ascending: true });
      
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

  useEffect(() => {
    loadContestants();
    loadGroups();
  }, []);

  return {
    contestants,
    setContestants,
    groups,
    loading,
    loadContestants,
    loadGroups
  };
};