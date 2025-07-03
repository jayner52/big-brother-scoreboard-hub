import { ContestantGroup, BonusQuestion } from '@/types/pool';

export const useRandomPicks = () => {
  const randomizeTeam = (contestantGroups: ContestantGroup[]) => {
    const picks: Record<string, string> = {};
    
    // Pick one from each of the first 4 groups
    contestantGroups.slice(0, 4).forEach((group, index) => {
      if (group.contestants && group.contestants.length > 0) {
        const randomIndex = Math.floor(Math.random() * group.contestants.length);
        picks[`player_${index + 1}`] = group.contestants[randomIndex].name;
      }
    });

    // Pick free pick from any contestant
    const allContestants = contestantGroups.flatMap(group => group.contestants || []);
    if (allContestants.length > 0) {
      const randomIndex = Math.floor(Math.random() * allContestants.length);
      picks.player_5 = allContestants[randomIndex].name;
    }

    return picks;
  };

  const randomizeBonusAnswers = (bonusQuestions: BonusQuestion[], contestantGroups: ContestantGroup[]) => {
    const answers: Record<string, any> = {};
    const allContestants = contestantGroups.flatMap(group => group.contestants || []);

    bonusQuestions.forEach((question) => {
      switch (question.question_type) {
        case 'player_select':
          if (allContestants.length > 0) {
            const randomIndex = Math.floor(Math.random() * allContestants.length);
            answers[question.id] = allContestants[randomIndex].name;
          }
          break;
          
        case 'dual_player_select':
          if (allContestants.length >= 2) {
            const shuffled = [...allContestants].sort(() => Math.random() - 0.5);
            answers[question.id] = {
              player1: shuffled[0].name,
              player2: shuffled[1].name
            };
          }
          break;
          
        case 'yes_no':
          answers[question.id] = Math.random() > 0.5 ? 'yes' : 'no';
          break;
          
        case 'number':
          // Random number between 1-20 for most questions
          answers[question.id] = Math.floor(Math.random() * 20) + 1;
          break;
          
        case 'creature_select':
          const creatureOptions = [
            'Mammal', 'Bird', 'Reptile/Amphibian', 'Food', 'Robot',
            'Bug/Insect/Arachnid', 'Fish/Sea Creature', 'Alien', 'Other'
          ];
          const randomCreature = Math.floor(Math.random() * creatureOptions.length);
          answers[question.id] = creatureOptions[randomCreature];
          break;
          
        default:
          answers[question.id] = 'Random Answer';
          break;
      }
    });

    return answers;
  };

  return { randomizeTeam, randomizeBonusAnswers };
};