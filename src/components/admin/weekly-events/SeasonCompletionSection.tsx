import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Trophy, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle,
  DollarSign,
  Users,
  Mail,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePool } from '@/contexts/PoolContext';
import { supabase } from '@/integrations/supabase/client';

interface CompletionCheck {
  id: string;
  label: string;
  completed: boolean;
  issues?: string[];
  description: string;
}

interface Winner {
  place: number;
  team_id: string;
  user_id: string;
  team_name: string;
  participant_name: string;
  total_points: number;
  amount: number;
}

interface SeasonCompletionSectionProps {
  eventForm: any;
  setEventForm: any;
}

export const SeasonCompletionSection: React.FC<SeasonCompletionSectionProps> = ({
  eventForm,
  setEventForm
}) => {
  const { activePool, updatePool } = usePool();
  const { toast } = useToast();
  const [checks, setChecks] = useState<CompletionCheck[]>([]);
  const [canComplete, setCanComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [winners, setWinners] = useState<Winner[]>([]);

  useEffect(() => {
    if (activePool?.id && eventForm?.isFinalWeek) {
      validateCompletion();
    }
  }, [activePool?.id, eventForm?.isFinalWeek]);

  const validateCompletion = async () => {
    if (!activePool?.id) return;

    try {
      setLoading(true);
      const completionChecks: CompletionCheck[] = [];

      // Check 1: All bonus questions answered
      const { data: unansweredQuestions } = await supabase
        .from('bonus_questions')
        .select('question_text')
        .eq('pool_id', activePool.id)
        .eq('is_active', true)
        .is('correct_answer', null);

      completionChecks.push({
        id: 'bonus-questions',
        label: 'All Bonus Questions Answered',
        completed: (unansweredQuestions?.length || 0) === 0,
        issues: unansweredQuestions?.map(q => q.question_text) || [],
        description: 'All prediction questions must have correct answers set'
      });

      // Check 2: Final week data completed
      const finalWeekComplete = !!(eventForm?.winner && eventForm?.runnerUp);
      completionChecks.push({
        id: 'final-week-complete',
        label: 'Final Week Results Set',
        completed: finalWeekComplete,
        description: finalWeekComplete ? 
          'Winner and runner-up have been selected' : 
          'Please set winner and runner-up in the Final Week section above'
      });

      // Check 3: Final standings calculated
      const { data: finalStandings } = await supabase
        .from('pool_entries')
        .select('*')
        .eq('pool_id', activePool.id)
        .order('total_points', { ascending: false });

      const hasStandings = (finalStandings?.length || 0) > 0;

      completionChecks.push({
        id: 'final-standings',
        label: 'Final Standings Available',
        completed: hasStandings,
        description: hasStandings ? 
          `${finalStandings?.length} teams in final standings` : 
          'No team standings available'
      });

      // Calculate potential winners with proper prize allocation
      if (hasStandings && finalStandings) {
        const distribution = activePool.prize_distribution || {
          first_place_amount: 0,
          second_place_amount: 0,
          third_place_amount: 0,
          first_place_percentage: 50,
          second_place_percentage: 30,
          third_place_percentage: 20
        };

        // Use the distribution already defined above

        const potentialWinners = finalStandings.slice(0, 3).map((entry, index) => {
          const amount = index === 0 ? distribution.first_place_amount :
                        index === 1 ? distribution.second_place_amount :
                        distribution.third_place_amount;

          return {
            place: index + 1,
            team_id: entry.id,
            user_id: entry.user_id,
            team_name: entry.team_name,
            participant_name: entry.participant_name,
            total_points: entry.total_points,
            amount
          };
        }).filter(winner => winner.amount > 0); // Only include winners with prize money

        setWinners(potentialWinners);
      }

      setChecks(completionChecks);
      setCanComplete(completionChecks.every(check => check.completed));

    } catch (error) {
      console.error('Error validating completion:', error);
      toast({
        title: "Validation Error",
        description: "Failed to validate season completion requirements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const completeSeason = async () => {
    if (!canComplete || !activePool?.id) return;

    setCompleting(true);
    try {
      // 1. Create winner records
      if (winners.length > 0) {
        const winnerRecords = winners.map(winner => ({
          pool_id: activePool.id,
          user_id: winner.user_id,
          team_id: winner.team_id,
          place: winner.place,
          amount: winner.amount
        }));

        const { error: winnersError } = await supabase
          .from('pool_winners')
          .insert(winnerRecords);

        if (winnersError) {
          throw winnersError;
        }
      }

      // 2. Mark pool as complete and close for new entries
      const success = await updatePool(activePool.id, {
        season_complete: true,
        finale_week_enabled: true,
        season_locked: true,
        draft_locked: true,
        draft_open: false // Close pool for new entries
      });

      if (!success) {
        throw new Error('Failed to update pool status');
      }

      // 3. Send winner notifications (placeholder - would need actual email system)
      if (winners.length > 0) {
        console.log('Would send winner notifications to:', winners);
        // await notifyWinners(winners);
      }

      toast({
        title: "🏆 Season Completed! 🏆",
        description: `Pool finalized with ${winners.length} winners. Prize distribution has been recorded.`,
      });

      // Refresh validation
      await validateCompletion();

    } catch (error) {
      console.error('Error completing season:', error);
      toast({
        title: "Completion Failed",
        description: "Failed to complete the season. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCompleting(false);
    }
  };

  if (!eventForm?.isFinalWeek) return null;

  if (loading) {
    return (
      <div className="border-t pt-6">
        <div className="text-center py-8">Validating season completion...</div>
      </div>
    );
  }

  if (activePool?.season_complete) {
    return (
      <div className="border-t pt-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-6 w-6 text-green-600" />
            <h3 className="text-xl font-bold text-green-800">Season Complete!</h3>
          </div>
          <p className="text-green-700 mb-4">
            This pool's season has been finalized and winners have been determined.
          </p>
          {winners.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-green-800">Winners:</h4>
              {winners.map((winner) => (
                <div key={winner.place} className="flex items-center justify-between bg-white p-3 rounded border">
                  <div>
                    <span className="font-medium">{winner.place === 1 ? '🥇' : winner.place === 2 ? '🥈' : '🥉'}</span>
                    <span className="ml-2">{winner.participant_name} ({winner.team_name})</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    ${winner.amount.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border-t pt-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-6 w-6 text-yellow-500" />
          <h3 className="text-xl font-bold text-yellow-800">Complete Season</h3>
        </div>
        <p className="text-yellow-700">
          Finalize the pool, assign prizes, and notify winners
        </p>

        {/* Completion Checklist */}
        <div className="space-y-3">
          <h4 className="font-semibold mb-3">Completion Requirements:</h4>
          {checks.map((check) => (
            <div key={check.id} className="flex items-start gap-3 bg-white p-3 rounded border">
              <div className="flex-shrink-0 mt-0.5">
                {check.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                )}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${check.completed ? 'text-green-800' : 'text-amber-800'}`}>
                  {check.label}
                </p>
                <p className="text-sm text-muted-foreground">
                  {check.description}
                </p>
                {check.issues && check.issues.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-amber-700 font-medium">Issues to resolve:</p>
                    <ul className="text-sm text-amber-600 ml-4">
                      {check.issues.map((issue, i) => (
                        <li key={i}>• {issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Winners Preview */}
        {winners.length > 0 && (
          <div className="border rounded-lg p-4 bg-white">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Final Standings & Prizes
            </h4>
            <div className="space-y-2">
              {winners.map((winner) => (
                <div key={winner.place} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">#{winner.place}</Badge>
                    <div>
                      <span className="font-medium">{winner.participant_name}</span>
                      <span className="text-muted-foreground ml-2">({winner.team_name})</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {winner.total_points} pts
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600">
                      ${winner.amount.toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {!canComplete && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please complete all requirements above before finalizing the season.
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={completeSeason}
          disabled={!canComplete || completing}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          size="lg"
        >
          <Trophy className="h-4 w-4 mr-2" />
          {completing ? 'Completing Season...' : 'Complete Season & Assign Prizes'}
        </Button>

        {canComplete && (
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Winners will be notified to submit their payment details for prize distribution.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};