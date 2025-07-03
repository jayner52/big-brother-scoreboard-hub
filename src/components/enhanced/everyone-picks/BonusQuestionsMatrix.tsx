import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PoolEntry, BonusQuestion } from '@/types/pool';
import { BonusAnswerCell } from './BonusAnswerCell';
import { CorrectAnswerCell } from './CorrectAnswerCell';

interface BonusQuestionsMatrixProps {
  poolEntries: PoolEntry[];
  bonusQuestions: BonusQuestion[];
}

export const BonusQuestionsMatrix: React.FC<BonusQuestionsMatrixProps> = ({
  poolEntries,
  bonusQuestions,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Everyone's Bonus Predictions</CardTitle>
          <div className="text-sm text-muted-foreground">
            Total Bonus Points: {poolEntries.reduce((sum, entry) => sum + (entry.bonus_points || 0), 0)} pts
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="sticky left-0 bg-muted/50 border-r min-w-[200px] font-bold z-10">
                    Question
                  </TableHead>
                  <TableHead className="sticky left-[200px] text-center font-bold min-w-[120px] bg-green-50 border-r z-10">
                    Correct Answer
                  </TableHead>
                   {poolEntries.map((entry) => (
                     <TableHead key={entry.id} className="text-center font-bold min-w-[120px] border-r">
                       <div className="space-y-1">
                         <div className="font-semibold">{entry.team_name}</div>
                         <div className="text-xs text-muted-foreground">{entry.participant_name}</div>
                         <div className="text-xs font-semibold text-green-600">
                           {entry.bonus_points || 0} pts earned
                         </div>
                       </div>
                     </TableHead>
                   ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {bonusQuestions.map((question) => (
                  <TableRow key={question.id} className="hover:bg-muted/30">
                    <TableCell className="sticky left-0 bg-background border-r font-medium max-w-[200px] z-10">
                      <div className="space-y-1">
                        <div className="text-sm">{question.question_text}</div>
                        <Badge variant="outline" className="text-xs">
                          {question.points_value} pts
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="sticky left-[200px] text-center bg-green-50 border-r z-10">
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