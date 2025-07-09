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
    return (
      <div className="text-center py-8">
        Loading contestants...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InstructionAccordion 
        title="Houseguest Management" 
        tabKey="houseguests"
      >
        <div className="space-y-2">
          <p>Manage the Big Brother 27 cast. All 16 houseguests are automatically loaded and ready to go!</p>
          <p><strong>Management tasks:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Review the Season 27 cast - all contestants are pre-loaded with photos and bios</li>
            <li>Update contestant status as evictions occur during the season</li>
            <li>Edit contestant details if needed (photos, bios, personal info)</li>
            <li>Manage group assignments if you want to customize the draft structure</li>
            <li>Use the generate tools to enhance profiles with AI if desired</li>
          </ul>
        </div>
      </InstructionAccordion>
      
      <ContestantManagementHeader onAddClick={() => setShowAddForm(true)} />

      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="manage">Manage Season 27 Cast</TabsTrigger>
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