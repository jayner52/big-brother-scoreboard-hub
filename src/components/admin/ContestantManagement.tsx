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
const ContestantManagement: React.FC = () => {
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
    handleAIProfilesGenerated,
    handleShowAddForm
  } = useContestantActions(contestants, setContestants, loadContestants, groups);

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
        title="Season 27 Official Cast Management" 
        tabKey="houseguests"
      >
        <div className="space-y-2">
          <p>✅ <strong>Season 27 Official Cast Loaded!</strong> All 16 houseguests with authentic data from Parade.com are ready.</p>
          <p><strong>Confirmed contestants:</strong> Adrian Rocha, Amy Bingham, Ashley Hollis, Ava Pearl, Will Williams, Zae Frederich, Jimmy Heagerty, Katherine Woodman, Keanu Soto, Kelley Jorgensen, Lauren Domingue, Mickey Lee, Morgan Pope, Rylie Jeffries, Vince Panaro, and Zach Cornell.</p>
          <p><strong>Management tasks:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Review the official Season 27 cast - all contestants verified with correct photos and bios</li>
            <li>Update contestant status as evictions occur during the season</li>
            <li>Edit contestant details if needed (photos, bios, personal info)</li>
            <li>Manage group assignments if you want to customize the draft structure</li>
          </ul>
        </div>
      </InstructionAccordion>
      
      <ContestantManagementHeader onAddClick={handleShowAddForm} />

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

export default ContestantManagement;