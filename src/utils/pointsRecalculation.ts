import { supabase } from '@/integrations/supabase/client';
import { PoolEntry } from '@/types/pool';

export const recalculateAllTeamPoints = async () => {
  try {
    console.log('Starting manual points recalculation...');
    
    // Get all pool entries
    const { data: poolEntries, error } = await supabase
      .from('pool_entries')
      .select('*');

    if (error) throw error;

    if (!poolEntries || poolEntries.length === 0) {
      console.log('No pool entries found');
      return;
    }

    // Get all contestants for name matching
    const { data: contestants, error: contestantsError } = await supabase
      .from('contestants')
      .select('id, name');

    if (contestantsError) throw contestantsError;

    // Get bonus questions
    const { data: bonusQuestions, error: bonusError } = await supabase
      .from('bonus_questions')
      .select('*')
      .eq('answer_revealed', true);

    if (bonusError) throw bonusError;

    // Process each team
    for (const entry of poolEntries) {
      console.log(`\n=== Recalculating points for: ${entry.team_name} ===`);
      
      // Find team member IDs
      const teamPlayers = [entry.player_1, entry.player_2, entry.player_3, entry.player_4, entry.player_5];
      const teamMemberIds = teamPlayers
        .map(playerName => contestants?.find(c => c.name === playerName)?.id)
        .filter(Boolean);
      
      console.log('Team players:', teamPlayers);
      console.log('Found IDs for players:', teamMemberIds.length, 'out of', teamPlayers.length);

      // Calculate weekly points
      const { data: weeklyEvents, error: weeklyError } = await supabase
        .from('weekly_events')
        .select('points_awarded, contestant_id')
        .in('contestant_id', teamMemberIds);

      if (weeklyError) throw weeklyError;

      const { data: specialEvents, error: specialError } = await supabase
        .from('special_events')
        .select('points_awarded, contestant_id')
        .in('contestant_id', teamMemberIds);

      if (specialError) throw specialError;

      const weeklyPoints = weeklyEvents?.reduce((sum, event) => sum + (event.points_awarded || 0), 0) || 0;
      const specialPoints = specialEvents?.reduce((sum, event) => sum + (event.points_awarded || 0), 0) || 0;
      const totalWeeklyPoints = weeklyPoints + specialPoints;

      // Calculate bonus points with fixed logic
      let bonusPoints = 0;
      bonusQuestions?.forEach(question => {
        const userAnswer = entry.bonus_answers?.[question.id];
        console.log(`\nChecking bonus question: ${question.question_text}`);
        console.log('User answer:', userAnswer);
        console.log('Correct answer:', question.correct_answer);
        
        if (question.question_type === 'dual_player_select') {
          // For showmance questions, correct_answer is a JSON array of valid combinations
          if (userAnswer && question.correct_answer) {
            let correctAnswers;
            try {
              correctAnswers = typeof question.correct_answer === 'string' 
                ? JSON.parse(question.correct_answer) 
                : question.correct_answer;
            } catch (e) {
              console.error('Error parsing correct answer for showmance:', e);
              correctAnswers = [];
            }
            
            if (Array.isArray(correctAnswers) && typeof userAnswer === 'object' && userAnswer.player1 && userAnswer.player2) {
              const isCorrect = correctAnswers.some(correctPair => 
                (correctPair.player1 === userAnswer.player1 && correctPair.player2 === userAnswer.player2) ||
                (correctPair.player1 === userAnswer.player2 && correctPair.player2 === userAnswer.player1)
              );
              
              if (isCorrect) {
                bonusPoints += question.points_value;
                console.log(`✓ AWARDED ${question.points_value} points for showmance question`);
              } else {
                console.log('✗ No match for showmance question');
              }
            }
          }
        } else {
          // Standard answer comparison
          if (userAnswer === question.correct_answer) {
            bonusPoints += question.points_value;
            console.log(`✓ AWARDED ${question.points_value} points for ${question.question_type} question`);
          } else {
            console.log('✗ No match for standard question');
          }
        }
      });

      const totalPoints = totalWeeklyPoints + bonusPoints;
      
      console.log(`\nFINAL CALCULATION for ${entry.team_name}:`);
      console.log(`Weekly/Special: ${totalWeeklyPoints}, Bonus: ${bonusPoints}, Total: ${totalPoints}`);

      // Update the database
      const { error: updateError } = await supabase
        .from('pool_entries')
        .update({
          weekly_points: totalWeeklyPoints,
          bonus_points: bonusPoints,
          total_points: totalPoints
        })
        .eq('id', entry.id);

      if (updateError) {
        console.error(`Error updating ${entry.team_name}:`, updateError);
      } else {
        console.log(`✓ Successfully updated ${entry.team_name}`);
      }
    }

    console.log('\n=== RECALCULATION COMPLETED ===');
    return true;
  } catch (error) {
    console.error('Error in recalculation:', error);
    return false;
  }
};