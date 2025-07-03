import { BonusQuestion } from '@/types/pool';

export const evaluateBonusAnswer = (
  participantAnswer: any,
  correctAnswers: any,
  questionType: string
): boolean => {
  if (!participantAnswer || !correctAnswers) return false;

  // Handle multiple correct answers
  const correctAnswersArray = Array.isArray(correctAnswers) ? correctAnswers : [correctAnswers];
  
  // For dual_player_select, need special handling
  if (questionType === 'dual_player_select') {
    if (typeof participantAnswer === 'object' && participantAnswer.player1 && participantAnswer.player2) {
      return correctAnswersArray.some(correct => {
        if (typeof correct === 'object' && correct.player1 && correct.player2) {
          // Check if both players match (order doesn't matter)
          return (
            (participantAnswer.player1 === correct.player1 && participantAnswer.player2 === correct.player2) ||
            (participantAnswer.player1 === correct.player2 && participantAnswer.player2 === correct.player1)
          );
        }
        return false;
      });
    }
    return false;
  }

  // For all other question types, check if participant answer matches any correct answer
  return correctAnswersArray.includes(participantAnswer);
};

export const formatBonusAnswer = (answer: any, questionType: string): string => {
  if (!answer) return '';
  
  if (questionType === 'dual_player_select' && typeof answer === 'object') {
    if (answer.player1 && answer.player2) {
      return `${answer.player1} & ${answer.player2}`;
    }
    return '';
  }
  
  if (Array.isArray(answer)) {
    return answer.join(', ');
  }
  
  return String(answer);
};

export const formatCorrectAnswers = (correctAnswers: any, questionType: string): string => {
  if (!correctAnswers) return '';
  
  const answersArray = Array.isArray(correctAnswers) ? correctAnswers : [correctAnswers];
  
  return answersArray
    .map(answer => formatBonusAnswer(answer, questionType))
    .filter(formatted => formatted)
    .join(' OR ');
};