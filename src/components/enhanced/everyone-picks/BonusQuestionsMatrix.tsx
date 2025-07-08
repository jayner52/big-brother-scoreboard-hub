import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PoolEntry, BonusQuestion } from '@/types/pool';
import { BonusAnswerCell } from './BonusAnswerCell';
import { CorrectAnswerCell } from './CorrectAnswerCell';
import { evaluateBonusAnswer } from '@/utils/bonusQuestionUtils';
import { useIsMobile } from '@/hooks/use-mobile';

interface BonusQuestionsMatrixProps {
  poolEntries: PoolEntry[];
  bonusQuestions: BonusQuestion[];
}

export const BonusQuestionsMatrix: React.FC<BonusQuestionsMatrixProps> = ({
  poolEntries,
  bonusQuestions,
}) => {
  const isMobile = useIsMobile();
  
  // Calculate actual bonus points earned for each team from the questions shown
  const calculateTeamBonusPoints = (entry: PoolEntry): number => {
    return bonusQuestions.reduce((total, question) => {
      if (!question.answer_revealed || !question.correct_answer) return total;
      
      const userAnswer = entry.bonus_answers[question.id];
      if (!userAnswer) return total;
      
      const isCorrect = evaluateBonusAnswer(userAnswer, question.correct_answer, question.question_type);
      return total + (isCorrect ? question.points_value : 0);
    }, 0);
  };

  return (
    <Card>
      <CardHeader className={isMobile ? "pb-3" : ""}>
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle className="text-lg sm:text-xl">Everyone's Bonus Predictions</CardTitle>
          <div className="text-xs sm:text-sm text-muted-foreground">
            Total Bonus Points: {poolEntries.reduce((sum, entry) => sum + calculateTeamBonusPoints(entry), 0)} pts
          </div>
        </div>
      </CardHeader>
      <CardContent className={isMobile ? "p-2" : "p-0"}>
        <ScrollArea className="w-full overflow-x-auto">
          <div className={isMobile ? "min-w-[600px]" : "min-w-[800px]"}>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className={`sticky left-0 bg-muted/50 border-r font-bold z-10 ${
                    isMobile ? 'min-w-[150px] text-xs' : 'min-w-[200px]'
                  }`}>
                    Question
                  </TableHead>
                  <TableHead className={`sticky text-center font-bold bg-green-50 border-r z-10 ${
                    isMobile ? 'left-[150px] min-w-[100px] text-xs' : 'left-[200px] min-w-[120px]'
                  }`}>
                    Correct Answer
                  </TableHead>
                   {poolEntries.map((entry) => (
                     <TableHead key={entry.id} className={`text-center font-bold border-r ${
                       isMobile ? 'min-w-[100px]' : 'min-w-[120px]'
                     }`}>
                       <div className="space-y-1">
                         <div className={`font-semibold ${isMobile ? 'text-xs' : ''}`}>{entry.team_name}</div>
                         <div className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>{entry.participant_name}</div>
                          <div className={`font-semibold text-green-600 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                            {calculateTeamBonusPoints(entry)} pts earned
                          </div>
                       </div>
                     </TableHead>
                   ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {bonusQuestions.map((question) => (
                  <TableRow key={question.id} className="hover:bg-muted/30">
                    <TableCell className={`sticky left-0 bg-background border-r font-medium z-10 ${
                      isMobile ? 'max-w-[150px] text-xs' : 'max-w-[200px]'
                    }`}>
                      <div className="space-y-1">
                        <div className={isMobile ? 'text-xs' : 'text-sm'}>{question.question_text}</div>
                        <Badge variant="outline" className="text-xs">
                          {question.points_value} pts
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className={`sticky text-center bg-green-50 border-r z-10 ${
                      isMobile ? 'left-[150px]' : 'left-[200px]'
                    }`}>
                      <CorrectAnswerCell question={question} />
                    </TableCell>
                    {poolEntries.map((entry) => (
                      <TableCell key={entry.id} className="text-center border-r">
                        <BonusAnswerCell entry={entry} question={question} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};