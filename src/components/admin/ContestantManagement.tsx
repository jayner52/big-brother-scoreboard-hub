import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import { useContestants } from '@/hooks/useContestants';
import { useContestantActions } from '@/hooks/useContestantActions';
import { ContestantProfileModal } from './contestants/ContestantProfileModal';
import { EnhancedContestantProfileModal } from './contestants/EnhancedContestantProfileModal';
import { ContestantManagementHeader } from './contestants/ContestantManagementHeader';
import { ManageContestantsTab } from './contestants/ManageContestantsTab';
import { AIGenerationTab } from './contestants/AIGenerationTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePool } from '@/contexts/PoolContext';
import { InstructionAccordion } from './InstructionAccordion';

export const ContestantManagement: React.FC = () => {
  const { activePool } = usePool();
  const { contestants, setContestants, groups, loading, loadContestants } = useContestants(activePool?.id);
  const [selectedContestant, setSelectedContestant] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const {
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
  } = useContestantActions(contestants, setContestants, loadContestants);

  const handleViewProfile = (contestant: any) => {
    setSelectedContestant(contestant);
    setShowProfileModal(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading contestants...</div>;
  }

  return (
    <div className="space-y-6">
      <InstructionAccordion 
        title="Houseguest Management" 
        tabKey="houseguests"
      >
        <div className="space-y-2">
          <p>Manage the Big Brother cast list. Add all houseguests before opening the draft. Mark as evicted as the season progresses.</p>
          <p><strong>Setup steps:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Add all houseguests before opening draft to participants</li>
            <li>Organize into groups (like "men/women" or "old/new school")</li>
            <li>Update evicted status as the season progresses</li>
            <li>Use AI generation to create realistic profiles and photos</li>
            <li>Verify all information is accurate before going live</li>
          </ul>
        </div>
      </InstructionAccordion>
      
      <ContestantManagementHeader onAddClick={() => setShowAddForm(true)} />

      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage">Manage Contestants</TabsTrigger>
          <TabsTrigger value="ai-generate" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Generator
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="manage" className="space-y-6">
          <ManageContestantsTab
            contestants={contestants}
            groups={groups}
            showAddForm={showAddForm}
            editingId={editingId}
            editForm={editForm}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
            onFormChange={handleFormChange}
            onAddContestant={handleAddContestant}
            onDelete={handleDelete}
            onClearAll={handleClearAll}
            onRefresh={loadContestants}
          />
        </TabsContent>
        
        <TabsContent value="ai-generate" className="space-y-6">
          <AIGenerationTab
            contestants={contestants}
            onProfilesGenerated={handleAIProfilesGenerated}
            onEdit={handleEdit}
            onView={handleViewProfile}
            onDelete={handleDelete}
            onClearAll={handleClearAll}
            onBioUpdate={loadContestants}
          />
        </TabsContent>
      </Tabs>

      <EnhancedContestantProfileModal
        contestant={selectedContestant}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onUpdate={loadContestants}
      />
    </div>
  );
};