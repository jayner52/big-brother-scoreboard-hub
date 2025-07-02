
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePool } from '@/contexts/PoolContext';
import { useToast } from '@/hooks/use-toast';

export const PoolEntryForm: React.FC = () => {
  const { contestants, addPoolEntry } = usePool();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    participantName: '',
    winner: '',
    firstEvicted: '',
    week1HOH: '',
    week1POV: '',
    week2Evicted: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.participantName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    const requiredFields = ['winner', 'firstEvicted', 'week1HOH', 'week1POV', 'week2Evicted'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Error",
        description: "Please fill in all pick fields",
        variant: "destructive",
      });
      return;
    }

    addPoolEntry({
      participantName: formData.participantName,
      picks: {
        winner: formData.winner,
        firstEvicted: formData.firstEvicted,
        week1HOH: formData.week1HOH,
        week1POV: formData.week1POV,
        week2Evicted: formData.week2Evicted,
      },
    });

    toast({
      title: "Success!",
      description: "Your picks have been submitted to the pool",
    });

    // Reset form
    setFormData({
      participantName: '',
      winner: '',
      firstEvicted: '',
      week1HOH: '',
      week1POV: '',
      week2Evicted: '',
    });
  };

  const activeContestants = contestants.filter(c => c.isActive);

  return (
    <Card className="w-full max-w-2xl mx-auto mb-8">
      <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Join the Big Brother Fantasy Pool</CardTitle>
        <CardDescription className="text-red-100">
          Make your picks and compete with other fans!
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="participantName" className="text-lg font-semibold">Your Name</Label>
            <Input
              id="participantName"
              type="text"
              value={formData.participantName}
              onChange={(e) => setFormData(prev => ({ ...prev, participantName: e.target.value }))}
              placeholder="Enter your name"
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-lg font-semibold">Season Winner</Label>
              <Select value={formData.winner} onValueChange={(value) => setFormData(prev => ({ ...prev, winner: value }))}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Who will win?" />
                </SelectTrigger>
                <SelectContent>
                  {activeContestants.map(contestant => (
                    <SelectItem key={contestant.id} value={contestant.name}>
                      {contestant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-lg font-semibold">First Evicted</Label>
              <Select value={formData.firstEvicted} onValueChange={(value) => setFormData(prev => ({ ...prev, firstEvicted: value }))}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Who goes home first?" />
                </SelectTrigger>
                <SelectContent>
                  {activeContestants.map(contestant => (
                    <SelectItem key={contestant.id} value={contestant.name}>
                      {contestant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-lg font-semibold">Week 1 HOH</Label>
              <Select value={formData.week1HOH} onValueChange={(value) => setFormData(prev => ({ ...prev, week1HOH: value }))}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Week 1 Head of Household" />
                </SelectTrigger>
                <SelectContent>
                  {activeContestants.map(contestant => (
                    <SelectItem key={contestant.id} value={contestant.name}>
                      {contestant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-lg font-semibold">Week 1 POV</Label>
              <Select value={formData.week1POV} onValueChange={(value) => setFormData(prev => ({ ...prev, week1POV: value }))}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Week 1 Power of Veto" />
                </SelectTrigger>
                <SelectContent>
                  {activeContestants.map(contestant => (
                    <SelectItem key={contestant.id} value={contestant.name}>
                      {contestant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-lg font-semibold">Week 2 Evicted</Label>
              <Select value={formData.week2Evicted} onValueChange={(value) => setFormData(prev => ({ ...prev, week2Evicted: value }))}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Week 2 eviction" />
                </SelectTrigger>
                <SelectContent>
                  {activeContestants.map(contestant => (
                    <SelectItem key={contestant.id} value={contestant.name}>
                      {contestant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold">
            Submit My Picks
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
