import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { BasicInfoForm } from '@/components/draft/BasicInfoForm';
import { PaymentInfoDisplay } from '@/components/draft/PaymentInfoDisplay';
import { PaymentValidationSection } from '@/components/draft/PaymentValidationSection';
import { DynamicTeamDraftSection } from '@/components/draft/DynamicTeamDraftSection';
import { BonusQuestionsSection } from '@/components/draft/BonusQuestionsSection';
import { MultiTeamSwitcher } from '@/components/draft/MultiTeamSwitcher';
import { usePool } from '@/contexts/PoolContext';
import { usePoolData } from '@/hooks/usePoolData';
import { useDynamicDraftForm } from '@/hooks/useDynamicDraftForm';
import { useDynamicDraftValidation } from '@/hooks/useDynamicDraftValidation';
import { useDynamicDraftSubmission } from '@/hooks/useDynamicDraftSubmission';
import { useRandomPicks } from '@/hooks/useRandomPicks';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shuffle, AlertCircle, Trash2, Plus } from 'lucide-react';

export const TeamDraftFormFixed: React.FC = () => {
  const { activePool } = usePool();
  const { activePool: poolData, contestantGroups, bonusQuestions, loading } = usePoolData({ poolId: activePool?.id });
  const { toast } = useToast();
  
  // State for multi-team functionality
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  
  console.log('🔧 FIXED DRAFT FORM - Pool Data:', { 
    poolId: activePool?.id,
    picksPerTeam: poolData?.picks_per_team,
    allowDuplicatePicks: poolData?.allow_duplicate_picks,
    hasBuyIn: poolData?.has_buy_in
  });

  const { formData, updateFormData, updateBonusAnswer, resetForm, picksPerTeam } = useDynamicDraftForm(poolData);
  const { submitDraft } = useDynamicDraftSubmission();
  const { validateDraftForm } = useDynamicDraftValidation();
  const { randomizeTeam, randomizeBonusAnswers } = useRandomPicks();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Load user's existing teams
  useEffect(() => {
    if (activePool?.id) {
      loadUserTeams();
    }
  }, [activePool?.id]);

  const loadUserTeams = async () => {
    if (!activePool?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('pool_entries')
        .select('*')
        .eq('pool_id', activePool.id)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setUserTeams(data);
        // If user has teams, show them in switcher mode
        setIsEditingExisting(true);
      }
    } catch (error) {
      console.error('Error loading user teams:', error);
    }
  };

  const handleTeamSwitch = (index: number) => {
    setCurrentTeamIndex(index);
    // Don't auto-load team data in switcher, just show the interface
  };

  const handleEditTeam = (team: any) => {
    setEditingTeamId(team.id);
    setIsEditingExisting(true);
    
    // Load team data into form
    const teamFormData = {
      participant_name: team.participant_name,
      team_name: team.team_name,
      email: team.email,
      payment_confirmed: team.payment_confirmed,
      bonus_answers: team.bonus_answers || {},
    };
    
    // Load player selections
    for (let i = 1; i <= picksPerTeam; i++) {
      teamFormData[`player_${i}`] = team[`player_${i}`] || '';
    }
    
    updateFormData(teamFormData);
  };

  const handleCreateNewTeam = () => {
    setIsEditingExisting(false);
    setEditingTeamId(null);
    resetForm();
  };

  const handleRandomizeTeam = () => {
    const randomPicks = randomizeTeam(contestantGroups, picksPerTeam);
    updateFormData(randomPicks);
  };

  const handleRandomizeBonusAnswers = () => {
    const randomAnswers = randomizeBonusAnswers(bonusQuestions, contestantGroups);
    Object.entries(randomAnswers).forEach(([questionId, answer]) => {
      updateBonusAnswer(questionId, answer);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔧 FORM SUBMISSION - DETAILED DEBUG:', { 
      formData, 
      picksPerTeam,
      poolId: poolData?.id,
      poolName: poolData?.name,
      allowDuplicatePicksFromPool: poolData?.allow_duplicate_picks,
      selectedPlayers: Object.keys(formData).filter(k => k.startsWith('player_')).map(k => ({ [k]: formData[k] }))
    });
    
    // CRITICAL FIX: Use pool's allow_duplicate_picks setting with extensive logging
    const allowDuplicates = poolData?.allow_duplicate_picks ?? true;
    console.log('🔧 DUPLICATE VALIDATION SETTINGS:', {
      rawPoolValue: poolData?.allow_duplicate_picks,
      finalAllowDuplicates: allowDuplicates,
      validation: allowDuplicates ? 'SKIPPING duplicate validation' : 'ENFORCING duplicate validation'
    });
    
    const validation = validateDraftForm(formData, bonusQuestions, picksPerTeam, allowDuplicates);
    setValidationErrors(validation.errors);
    
    if (!validation.isValid) {
      console.log('🔧 Validation failed:', validation.errors);
      return;
    }

    const success = await submitDraft(formData, picksPerTeam, editingTeamId);
    if (success) {
      await loadUserTeams(); // Refresh teams list
      if (!editingTeamId) {
        resetForm();
      }
      setValidationErrors([]);
      toast({
        title: "Success!",
        description: editingTeamId ? "Team updated successfully!" : "Team submitted successfully!",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mb-8">
      <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Join the {poolData?.name} Fantasy Pool</CardTitle>
        <CardDescription className="text-red-100">
          Draft your team and make your predictions!
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {/* Multi-Team Switcher - Only show if user has multiple teams */}
        {userTeams.length > 0 && (
          <MultiTeamSwitcher
            teams={userTeams}
            currentTeamIndex={currentTeamIndex}
            onTeamChange={handleTeamSwitch}
            onEditTeam={handleEditTeam}
            picksPerTeam={picksPerTeam}
          />
        )}

        {/* Create New Team Button - Show if user has existing teams */}
        {userTeams.length > 0 && !isEditingExisting && (
          <div className="mb-6 text-center">
            <Button
              onClick={handleCreateNewTeam}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create New Team
            </Button>
          </div>
        )}

        {/* Show form only when editing existing team or creating new team */}
        {(!userTeams.length || isEditingExisting || !editingTeamId) && (
          <>
            {/* CRITICAL FIX: Only show payment info if pool has buy-in */}
            {poolData?.has_buy_in && (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-green-800 mb-2">💰 Entry Fee Required</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Amount:</strong> ${poolData.entry_fee_amount} {poolData.entry_fee_currency}</p>
                    <p><strong>Payment Method:</strong> {poolData.payment_method_1}</p>
                    <p><strong>Details:</strong> {poolData.payment_details_1}</p>
                    {poolData.buy_in_description && (
                      <p><strong>Instructions:</strong> {poolData.buy_in_description}</p>
                    )}
                  </div>
                </div>
                <Separator className="my-6" />
              </>
            )}

            {/* Clear Form Button */}
            <div className="flex justify-end mb-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Clear Form
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Draft Form</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to clear your draft and bonus predictions? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={resetForm} className="bg-destructive hover:bg-destructive/90">
                      Clear Form
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-2">Please complete the following:</div>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <BasicInfoForm
            formData={{
              participant_name: formData.participant_name,
              team_name: formData.team_name,
              email: formData.email,
            }}
            onFormDataChange={updateFormData}
          />

          <Separator />

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                Draft Your Team ({poolData?.picks_per_team || 5} Players)
              </h3>
              <Button
                type="button"
                variant="outline"
                onClick={handleRandomizeTeam}
                className="flex items-center gap-2"
              >
                <Shuffle className="h-4 w-4" />
                Randomize Team
              </Button>
            </div>
            <DynamicTeamDraftSection
              contestantGroups={contestantGroups}
              poolData={poolData}
              formData={formData}
              onFormDataChange={updateFormData}
            />
          </div>

          <Separator />

          {poolData?.enable_bonus_questions && bonusQuestions.length > 0 && (
            <>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-purple-800">🎯 Bonus Predictions</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRandomizeBonusAnswers}
                    className="flex items-center gap-2"
                  >
                    <Shuffle className="h-4 w-4" />
                    Randomize Answers
                  </Button>
                </div>
                <BonusQuestionsSection
                  bonusQuestions={bonusQuestions}
                  contestantGroups={contestantGroups}
                  bonusAnswers={formData.bonus_answers}
                  onBonusAnswerChange={updateBonusAnswer}
                />
              </div>
              <Separator />
            </>
          )}

          {/* CRITICAL FIX: Only show payment validation if pool has buy-in */}
          {poolData?.has_buy_in && (
            <>
              <PaymentValidationSection
                paymentConfirmed={formData.payment_confirmed}
                onPaymentConfirmedChange={(confirmed) => updateFormData({ payment_confirmed: confirmed })}
              />
              <Separator />
            </>
          )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold"
              disabled={validationErrors.length > 0}
            >
              {editingTeamId ? 'Update Team & Predictions' : 'Submit My Team & Predictions'}
            </Button>
          </form>
        </>
      )}
      </CardContent>
    </Card>
  );
};