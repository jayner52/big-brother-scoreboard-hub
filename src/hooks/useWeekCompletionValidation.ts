import { WeeklyEventForm } from '@/types/admin';

export const useWeekCompletionValidation = () => {
  const validateWeekCompletion = (eventForm: WeeklyEventForm): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    console.log('🔍 FINAL WEEK VALIDATION - Full Form State:', eventForm);
    console.log('🔍 FINAL WEEK VALIDATION - isFinalWeek:', eventForm.isFinalWeek);
    console.log('🔍 FINAL WEEK VALIDATION - winner:', eventForm.winner);
    console.log('🔍 FINAL WEEK VALIDATION - runnerUp:', eventForm.runnerUp);
    console.log('🔍 FINAL WEEK VALIDATION - americasFavorite:', eventForm.americasFavorite);
    console.log('🔍 FINAL WEEK VALIDATION - hohWinner:', eventForm.hohWinner);
    console.log('🔍 FINAL WEEK VALIDATION - povWinner:', eventForm.povWinner);
    console.log('🔍 FINAL WEEK VALIDATION - nominees:', eventForm.nominees);
    console.log('🔍 FINAL WEEK VALIDATION - evicted:', eventForm.evicted);

    // For final week, validate final week specific fields
    if (eventForm.isFinalWeek) {
      console.log('🔍 FINAL WEEK - Validating final week fields');
      
      if (!eventForm.winner || eventForm.winner.trim() === '') {
        errors.push("Season Winner is required for final week");
      }
      
      if (!eventForm.runnerUp || eventForm.runnerUp.trim() === '') {
        errors.push("Runner-up is required for final week");
      }
      
      // Americas Favorite is optional for final week
      
      console.log('🔍 FINAL WEEK - Validation complete, errors:', errors);
      return {
        isValid: errors.length === 0,
        errors
      };
    }

    // Regular week validation
    console.log('🔍 REGULAR WEEK - Validating regular week fields');
    
    if (!eventForm.hohWinner || eventForm.hohWinner.trim() === '') {
      errors.push("HOH Winner is required");
    }

    if (!eventForm.nominees || eventForm.nominees.filter(n => n && n.trim()).length < 2) {
      errors.push("At least 2 nominees are required");
    }

    if (!eventForm.povWinner || eventForm.povWinner.trim() === '') {
      errors.push("POV Winner is required");
    }

    // Eviction validation (unless it's a non-eviction week)
    if (!eventForm.evicted && eventForm.evicted !== 'no-eviction') {
      errors.push("Evicted contestant is required (or select 'No eviction')");
    }

    // Special week validations
    if (eventForm.isDoubleEviction) {
      if (!eventForm.secondHohWinner) {
        errors.push("Second HOH Winner is required for double eviction");
      }
      if (!eventForm.secondPovWinner) {
        errors.push("Second POV Winner is required for double eviction");
      }
      if (!eventForm.secondEvicted) {
        errors.push("Second evicted contestant is required for double eviction");
      }
    }

    if (eventForm.isTripleEviction) {
      if (!eventForm.thirdHohWinner) {
        errors.push("Third HOH Winner is required for triple eviction");
      }
      if (!eventForm.thirdPovWinner) {
        errors.push("Third POV Winner is required for triple eviction");
      }
      if (!eventForm.thirdEvicted) {
        errors.push("Third evicted contestant is required for triple eviction");
      }
    }

    // AI Arena validation
    if (eventForm.nominees.filter(n => n && n.trim()).length >= 3 && !eventForm.aiArenaWinner) {
      errors.push("AI Arena winner is required when there are 3+ nominees");
    }

    console.log('🔍 Validation result:', { isValid: errors.length === 0, errors });

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  return { validateWeekCompletion };
};