import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ContestantWithBio, WeeklyEventForm, DetailedScoringRule } from '@/types/admin';
import { PointsTooltip } from '@/components/ui/points-tooltip';
import { ScoringLabel } from './ScoringLabel';

interface AIArenaSectionProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
  activeContestants: ContestantWithBio[];
  scoringRules?: DetailedScoringRule[];
}

export const AIArenaSection: React.FC<AIArenaSectionProps> = ({
  eventForm,
  setEventForm,
  activeContestants,
  scoringRules = [],
}) => {
  const getPointsForEvent = (subcategory: string) => {
    const rule = scoringRules.find(r => r.category === 'weekly_events' && r.subcategory === subcategory && r.is_active);
    return rule?.points || 0;
  };
  
  // Check if POV ceremony is complete (required before AI Arena)
  const povCompleted = eventForm.povWinner && eventForm.povWinner !== 'no-winner';
  const nomineesSelected = eventForm.nominees.some(n => n && n !== '');
  const canEnableArena = nomineesSelected && povCompleted;
  
  const handleAIArenaToggle = (enabled: boolean) => {
    if (!enabled) {
      // Clear AI Arena data when disabled
      setEventForm(prev => ({
        ...prev,
        aiArenaEnabled: false,
        aiArenaWinner: ''
      }));
    } else {
      setEventForm(prev => ({
        ...prev,
        aiArenaEnabled: true
      }));
    }
  };

  const handleAIArenaWinner = (winner: string) => {
    setEventForm(prev => ({
      ...prev,
      aiArenaWinner: winner
    }));
  };

  // Get final nominees for AI Arena selection (after POV ceremony)
  const getFinalNominees = () => {
    let finalNominees = [...eventForm.nominees.filter(n => n)];
    
    if (eventForm.povUsed && eventForm.povUsedOn) {
      // Remove the person saved by POV
      finalNominees = finalNominees.filter(n => n !== eventForm.povUsedOn);
      // Add replacement nominee if there is one
      if (eventForm.replacementNominee) {
        finalNominees.push(eventForm.replacementNominee);
      }
    }
    
    return finalNominees;
  };

  const currentNominees = getFinalNominees();
  const bbArenaPoints = getPointsForEvent('bb_arena_winner');

  return (
    <>
      {/* BB Arena toggle with dependency validation */}
      <div className="flex flex-col items-start space-y-2 p-3 border rounded-lg bg-purple-50 border-purple-200">
        <div className="flex items-center space-x-2">
          <Switch
            checked={eventForm.aiArenaEnabled || false}
            onCheckedChange={handleAIArenaToggle}
            disabled={!canEnableArena}
          />
          <Label className="font-semibold text-sm text-purple-800">
            BB Arena {!canEnableArena && <span className="text-gray-400 text-sm">(Complete nominees & POV first)</span>}
          </Label>
        </div>
        {eventForm.aiArenaEnabled && (
          <div className="text-xs text-purple-700">
            Winner is safe from eviction
          </div>
        )}
      </div>
      
      {eventForm.aiArenaEnabled && (
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg text-purple-800">BB Arena Competition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <ScoringLabel 
                scoringRules={scoringRules} 
                category="weekly_events" 
                subcategory="bb_arena_winner"
              >
                BB Arena Winner
              </ScoringLabel>
              <PointsTooltip 
                scoringRules={scoringRules} 
                category="weekly_events" 
                subcategory="bb_arena_winner"
              >
                <Select 
                  value={eventForm.aiArenaWinner || ''} 
                  onValueChange={handleAIArenaWinner}
                >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select BB Arena winner" />
                </SelectTrigger>
                <SelectContent>
                  {currentNominees.length > 0 ? (
                    currentNominees.map(nominee => {
                      // Find the contestant object to check isActive status
                      const contestant = activeContestants.find(c => c.name === nominee);
                      return (
                        <SelectItem key={nominee} value={nominee}>
                          <span className="flex items-center justify-between w-full">
                            <span className={contestant && !contestant.isActive ? 'text-red-600' : ''}>
                              {nominee} {contestant ? (contestant.isActive ? '(Active)' : '(Evicted)') : ''}
                            </span>
                          </span>
                        </SelectItem>
                      );
                    })
                  ) : (
                    <SelectItem value="" disabled>
                      No nominees available
                    </SelectItem>
                  )}
                </SelectContent>
                </Select>
              </PointsTooltip>
              {currentNominees.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Set nominees first to select BB Arena winner
                </p>
              )}
              {eventForm.aiArenaWinner && (
                <p className="text-xs text-purple-700 mt-1">
                  Winner is safe from eviction
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};