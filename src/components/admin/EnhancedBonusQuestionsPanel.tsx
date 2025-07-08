import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { usePool } from '@/contexts/PoolContext';
import { supabase } from '@/integrations/supabase/client';
import { useBonusQuestions } from '@/hooks/useBonusQuestions';
import { useAutoPointsRecalculation } from '@/hooks/useAutoPointsRecalculation';
import { BonusQuestionCard } from './bonus-questions/BonusQuestionCard';
import { Plus, Settings } from 'lucide-react';
import { InstructionAccordion } from './InstructionAccordion';

export const EnhancedBonusQuestionsPanel: React.FC = () => {
  const { activePool } = usePool();
  const { toast } = useToast();
  const { triggerRecalculation } = useAutoPointsRecalculation();
  const {
    contestants,
    bonusQuestions,
    bonusAnswers,
    loading,
    handleBonusAnswer,
    handleDeleteQuestion,
    refreshQuestions
  } = useBonusQuestions();

  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    question_type: 'player_select',
    points_value: 5,
    sort_order: bonusQuestions.length + 1
  });

  // Update global enabled state based on actual data
  useEffect(() => {
    const allActive = bonusQuestions.length > 0 && bonusQuestions.every(q => q.is_active);
    setGlobalEnabled(allActive);
  }, [bonusQuestions]);

  const handleGlobalToggle = async (enabled: boolean) => {
    if (!activePool?.id) return;
    
    try {
      const { error } = await supabase
        .from('bonus_questions')
        .update({ is_active: enabled })
        .eq('pool_id', activePool.id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `All bonus questions ${enabled ? 'enabled' : 'disabled'}`,
      });
      
      // Refresh data instead of page reload
      await refreshQuestions();
    } catch (error) {
      console.error('Error updating global toggle:', error);
      toast({
        title: "Error",
        description: "Failed to update bonus questions",
        variant: "destructive",
      });
    }
  };

  const handleIndividualToggle = async (questionId: string, enabled: boolean) => {
    if (!activePool?.id) return;
    
    try {
      const { error } = await supabase
        .from('bonus_questions')
        .update({ is_active: enabled })
        .eq('id', questionId)
        .eq('pool_id', activePool.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Question ${enabled ? 'enabled' : 'disabled'}`,
      });
      
      // Refresh data instead of page reload
      await refreshQuestions();
    } catch (error) {
      console.error('Error updating question toggle:', error);
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive",
      });
    }
  };

  const handleCreateQuestion = async () => {
    if (!activePool?.id) return;
    
    try {
      const { error } = await supabase
        .from('bonus_questions')
        .insert({
          pool_id: activePool.id,
          question_text: newQuestion.question_text,
          question_type: newQuestion.question_type,
          points_value: newQuestion.points_value,
          sort_order: newQuestion.sort_order,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "New bonus question created",
      });

      setNewQuestion({
        question_text: '',
        question_type: 'player_select',
        points_value: 5,
        sort_order: bonusQuestions.length + 2
      });
      setShowCreateForm(false);
      
      // Refresh data instead of page reload
      await refreshQuestions();
    } catch (error) {
      console.error('Error creating question:', error);
      toast({
        title: "Error",
        description: "Failed to create question",
        variant: "destructive",
      });
    }
  };

  const handlePointsChange = async (questionId: string, points: number) => {
    if (!activePool?.id) return;
    
    try {
      const { error } = await supabase
        .from('bonus_questions')
        .update({ points_value: points })
        .eq('id', questionId)
        .eq('pool_id', activePool.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bonus question points updated",
      });
    } catch (error) {
      console.error('Error updating points:', error);
      toast({
        title: "Error",
        description: "Failed to update points",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading bonus questions...</div>;
  }

  return (
    <div className="space-y-6">
      <InstructionAccordion 
        title="Bonus Questions Management" 
        tabKey="bonus_questions"
      >
        <div className="space-y-2">
          <p>Create prediction questions for bonus points. Questions should be set before the season starts. Reveal answers when outcomes are known.</p>
          <p><strong>Best practices:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Create all bonus questions before draft period opens</li>
            <li>Use clear, unambiguous question wording</li>
            <li>Set appropriate point values based on difficulty</li>
            <li>Only reveal answers when outcomes are confirmed</li>
            <li>Consider different question types for variety</li>
          </ul>
        </div>
      </InstructionAccordion>
      
      {/* Global Controls */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Bonus Questions Management
          </CardTitle>
          <CardDescription className="text-green-100">
            Manage all bonus questions and create new ones
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={globalEnabled}
                  onCheckedChange={handleGlobalToggle}
                />
                <Label className="font-semibold text-sm md:text-base">Enable All Bonus Questions</Label>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 text-sm md:text-base w-full sm:w-auto"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create New Question</span>
              <span className="sm:hidden">Create Question</span>
            </Button>
          </div>

          {/* Create New Question Form */}
          {showCreateForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Create New Bonus Question</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 space-y-4">
                <div>
                  <Label htmlFor="question-text" className="text-sm md:text-base">Question Text</Label>
                  <Textarea
                    id="question-text"
                    value={newQuestion.question_text}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, question_text: e.target.value }))}
                    placeholder="Enter your bonus question..."
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="question-type" className="text-sm md:text-base">Question Type</Label>
                    <Select 
                      value={newQuestion.question_type} 
                      onValueChange={(value) => setNewQuestion(prev => ({ ...prev, question_type: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="player_select">Player Select</SelectItem>
                        <SelectItem value="dual_player_select">Dual Player Select</SelectItem>
                        <SelectItem value="yes_no">Yes/No</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="creature_select">Creature Select</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="points-value" className="text-sm md:text-base">Points Value</Label>
                    <Input
                      id="points-value"
                      type="number"
                      value={newQuestion.points_value}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, points_value: parseInt(e.target.value) || 5 }))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={handleCreateQuestion} className="w-full sm:w-auto">Create Question</Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)} className="w-full sm:w-auto">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Individual Questions */}
      {bonusQuestions.map((question) => (
        <div key={question.id} className="space-y-2">
          <div className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Switch
                checked={question.is_active}
                onCheckedChange={(checked) => handleIndividualToggle(question.id, checked)}
              />
              <Label className="font-medium text-sm md:text-base">Question {question.sort_order}</Label>
            </div>
            <div className="text-xs md:text-sm text-gray-600">
              {question.points_value} pts
            </div>
          </div>
          <BonusQuestionCard
            question={question}
            currentAnswer={bonusAnswers[question.id]}
            contestants={contestants}
            onAnswerChange={handleBonusAnswer}
            onPointsChange={handlePointsChange}
            onDelete={handleDeleteQuestion}
          />
        </div>
      ))}
    </div>
  );
};