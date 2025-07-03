import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio, ContestantGroup } from '@/types/admin';
import { UserPlus, Bot, Eye } from 'lucide-react';
import { ContestantForm } from './contestants/ContestantForm';
import { ContestantList } from './contestants/ContestantList';
import { AIGenerationPanel } from './contestants/AIGenerationPanel';
import { EnhancedContestantCard } from './contestants/EnhancedContestantCard';
import { ContestantProfileModal } from './contestants/ContestantProfileModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const ContestantManagement: React.FC = () => {
  const { toast } = useToast();
  const [contestants, setContestants] = useState<ContestantWithBio[]>([]);
  const [groups, setGroups] = useState<ContestantGroup[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ContestantWithBio>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedContestant, setSelectedContestant] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    loadContestants();
    loadGroups();
  }, []);

  const loadContestants = async () => {
    try {
      const { data } = await supabase
        .from('contestants')
        .select('*')
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

  const handleAIProfilesGenerated = async (profiles: any[]) => {
    console.log('Generated profiles:', profiles.length, 'contestants');
    
    // Debug: Check for Angela Murray specifically
    const angelaProfile = profiles.find(p => p.name.includes('Angela'));
    if (angelaProfile) {
      console.log('Angela Murray check:', angelaProfile);
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
            ai_generated: true,
            generation_metadata: {
              generated_date: new Date().toISOString(),
              model_used: 'improved_api',
              data_source: 'real_contestant_data'
            },
            is_active: true,
            sort_order: contestants.length + newContestants.length + 1
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

  const handleViewProfile = (contestant: any) => {
    setSelectedContestant(contestant);
    setShowProfileModal(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading contestants...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Houseguest Management</h2>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add Houseguest
        </Button>
      </div>

      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage">Manage Contestants</TabsTrigger>
          <TabsTrigger value="ai-generate" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Generator
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="manage" className="space-y-6">
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
        </TabsContent>
        
        <TabsContent value="ai-generate" className="space-y-6">
          <AIGenerationPanel onProfilesGenerated={handleAIProfilesGenerated} />
          
          {contestants.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Generated Contestants</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contestants.map((contestant) => (
                  <EnhancedContestantCard
                    key={contestant.id}
                    contestant={contestant as any}
                    onEdit={() => handleEdit(contestant)}
                    onView={() => handleViewProfile(contestant)}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ContestantProfileModal
        contestant={selectedContestant}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};