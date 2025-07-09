import { ContestantWithBio, WeeklyEventForm } from '@/types/admin';

interface ScoringRule {
  id: string;
  category: string;
  subcategory?: string;
  points: number;
  description: string;
  is_active: boolean;
  emoji?: string | null;
}

export const calculatePoints = (
  eventType: string, 
  customPoints: number | undefined, 
  scoringRules: ScoringRule[]
) => {
  if (eventType === 'custom' && customPoints !== undefined) {
    return customPoints;
  }
  
  // First try to find by ID (for new simplified special events)
  let rule = scoringRules.find(r => r.id === eventType);
  
  // If not found, try to find by subcategory (for legacy events)
  if (!rule) {
    rule = scoringRules.find(r => 
      r.subcategory === eventType || 
      (r.category === 'competitions' && r.subcategory === eventType) ||
      (r.category === 'weekly' && r.subcategory === eventType) ||
      (r.category === 'final_placement' && r.subcategory === eventType) ||
      (r.category === 'penalties' && r.subcategory === eventType) ||
      (r.category === 'special_events' && r.subcategory === eventType) ||
      (r.category === 'jury' && r.subcategory === eventType)
    );
  }
  
  return rule?.points || 0;
};

export const getPointsPreview = (
  eventForm: WeeklyEventForm,
  contestants: ContestantWithBio[],
  allEvictedUpToThisWeek: string[],
  scoringRules: ScoringRule[]
) => {
  const preview: Record<string, number> = {};
  
  // Initialize all contestants with 0 points
  contestants.forEach(contestant => {
    preview[contestant.name] = 0;
  });
  
  // HOH points
  if (eventForm.hohWinner && eventForm.hohWinner !== 'no-winner') {
    preview[eventForm.hohWinner] = (preview[eventForm.hohWinner] || 0) + calculatePoints('hoh_winner', undefined, scoringRules);
  }
  
  // POV points
  if (eventForm.povWinner && eventForm.povWinner !== 'no-winner') {
    preview[eventForm.povWinner] = (preview[eventForm.povWinner] || 0) + calculatePoints('pov_winner', undefined, scoringRules);
  }
  
  // POV used on someone points (from scoring rules)
  if (eventForm.povUsed && eventForm.povUsedOn) {
    preview[eventForm.povUsedOn] = (preview[eventForm.povUsedOn] || 0) + calculatePoints('pov_used_on', undefined, scoringRules);
  }
  
  // Nominee points (only add if nominee is not empty)
  eventForm.nominees.filter(nominee => nominee).forEach(nominee => {
    preview[nominee] = (preview[nominee] || 0) + calculatePoints('nominee', undefined, scoringRules);
  });
  
  // Replacement nominee points
  if (eventForm.replacementNominee) {
    preview[eventForm.replacementNominee] = (preview[eventForm.replacementNominee] || 0) + calculatePoints('replacement_nominee', undefined, scoringRules);
  }
  
  // BB Arena winner points
  if (eventForm.aiArenaWinner) {
    preview[eventForm.aiArenaWinner] = (preview[eventForm.aiArenaWinner] || 0) + calculatePoints('bb_arena_winner', undefined, scoringRules);
  }
  
  // Survival points for contestants not evicted this week or previously
  const evictedThisWeek = [eventForm.evicted, eventForm.secondEvicted, eventForm.thirdEvicted]
    .filter(evicted => evicted && evicted !== 'no-eviction');
  
  const survivingContestants = contestants.filter(c => 
    !evictedThisWeek.includes(c.name) && !allEvictedUpToThisWeek.includes(c.name)
  );
  
  survivingContestants.forEach(contestant => {
    preview[contestant.name] = (preview[contestant.name] || 0) + calculatePoints('survival', undefined, scoringRules);
  });
  
  // Jury phase points (dynamic scoring from rules)
  if (eventForm.isJuryPhase) {
    survivingContestants.forEach(contestant => {
      preview[contestant.name] = (preview[contestant.name] || 0) + calculatePoints('jury_member', undefined, scoringRules);
    });
  }
  
  // Special events points
  eventForm.specialEvents.forEach(se => {
    if (se.contestant && se.eventType) {
      preview[se.contestant] = (preview[se.contestant] || 0) + calculatePoints(se.eventType, se.customPoints, scoringRules);
    }
  });
  
  // Double eviction second round points
  if (eventForm.isDoubleEviction) {
    // Second HOH points
    if (eventForm.secondHohWinner && eventForm.secondHohWinner !== 'no-winner') {
      preview[eventForm.secondHohWinner] = (preview[eventForm.secondHohWinner] || 0) + calculatePoints('hoh_winner', undefined, scoringRules);
    }
    
    // Second POV points
    if (eventForm.secondPovWinner && eventForm.secondPovWinner !== 'no-winner') {
      preview[eventForm.secondPovWinner] = (preview[eventForm.secondPovWinner] || 0) + calculatePoints('pov_winner', undefined, scoringRules);
    }
    
    // Second POV used on someone
    if (eventForm.secondPovUsed && eventForm.secondPovUsedOn) {
      preview[eventForm.secondPovUsedOn] = (preview[eventForm.secondPovUsedOn] || 0) + calculatePoints('pov_used_on', undefined, scoringRules);
    }
    
    // Second nominees points
    eventForm.secondNominees.filter(n => n).forEach(nominee => {
      preview[nominee] = (preview[nominee] || 0) + calculatePoints('nominee', undefined, scoringRules);
    });
    
    // Second replacement nominee points
    if (eventForm.secondReplacementNominee) {
      preview[eventForm.secondReplacementNominee] = (preview[eventForm.secondReplacementNominee] || 0) + calculatePoints('replacement_nominee', undefined, scoringRules);
    }
  }
  
  return preview;
};