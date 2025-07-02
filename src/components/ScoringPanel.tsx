
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePool } from '@/contexts/PoolContext';
import { useToast } from '@/hooks/use-toast';
import { WeeklyResults } from '@/types/pool';

export const ScoringPanel: React.FC = () => {
  const { contestants, addWeeklyResults, calculateScores } = usePool();
  const { toast } = useToast();
  const [weekData, setWeekData] = useState<Partial<WeeklyResults>>({
    week: 1,
    hohWinner: '',
    povWinner: '',
    evicted: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!weekData.week) {
      toast({
        title: "Error",
        description: "Please enter a week number",
        variant: "destructive",
      });
      return;
    }

    const results: WeeklyResults = {
      week: weekData.week,
      hohWinner: weekData.hohWinner === 'no-winner' ? undefined : weekData.hohWinner || undefined,
      povWinner: weekData.povWinner === 'no-winner' ? undefined : weekData.povWinner || undefined,
      evicted: weekData.evicted === 'no-eviction' ? undefined : weekData.evicted || undefined,
    };

    addWeeklyResults(results);
    calculateScores();

    toast({
      title: "Success!",
      description: `Week ${weekData.week} results have been recorded and scores updated`,
    });

    // Reset form
    setWeekData({
      week: (weekData.week || 0) + 1,
      hohWinner: '',
      povWinner: '',
      evicted: '',
    });
  };

  const activeContestants = contestants.filter(c => c.isActive);

  return (
    <Card className="w-full max-w-xl mx-auto mb-8">
      <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
        <CardTitle className="text-xl">Weekly Results Entry</CardTitle>
        <CardDescription className="text-green-100">
          Enter the week's results to update all scores
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="week" className="font-semibold">Week Number</Label>
            <Input
              id="week"
              type="number"
              min="1"
              value={weekData.week || ''}
              onChange={(e) => setWeekData(prev => ({ ...prev, week: parseInt(e.target.value) || 1 }))}
              placeholder="1"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="font-semibold">Head of Household Winner</Label>
            <Select value={weekData.hohWinner || ''} onValueChange={(value) => setWeekData(prev => ({ ...prev, hohWinner: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select HOH winner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-winner">No winner this week</SelectItem>
                {activeContestants.map(contestant => (
                  <SelectItem key={contestant.id} value={contestant.name}>
                    {contestant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="font-semibold">Power of Veto Winner</Label>
            <Select value={weekData.povWinner || ''} onValueChange={(value) => setWeekData(prev => ({ ...prev, povWinner: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select POV winner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-winner">No winner this week</SelectItem>
                {activeContestants.map(contestant => (
                  <SelectItem key={contestant.id} value={contestant.name}>
                    {contestant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="font-semibold">Evicted Contestant</Label>
            <Select value={weekData.evicted || ''} onValueChange={(value) => setWeekData(prev => ({ ...prev, evicted: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select evicted contestant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-eviction">No eviction this week</SelectItem>
                {activeContestants.map(contestant => (
                  <SelectItem key={contestant.id} value={contestant.name}>
                    {contestant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white">
            Submit Results & Update Scores
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
