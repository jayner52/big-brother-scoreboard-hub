import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

export const AdminInstructionsModal: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          Admin Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Pool Management Instructions</DialogTitle>
          <DialogDescription>
            Complete guide to managing your Big Brother Fantasy Pool
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            
            {/* Getting Started */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3 text-primary">🚀 Getting Started</h3>
              <div className="space-y-2 text-sm">
                <p>Your pool has been created with default contestants and bonus questions. Here's what you need to do:</p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Review and customize contestants in the <Badge variant="outline">Contestants</Badge> tab</li>
                  <li>Adjust bonus questions in the <Badge variant="outline">Bonus Questions</Badge> tab</li>
                  <li>Update pool settings in the <Badge variant="outline">Pool Settings</Badge> tab</li>
                  <li>Share your pool invite code with participants</li>
                </ol>
              </div>
            </Card>

            {/* Weekly Management */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3 text-green-600">📅 Weekly Management</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Weekly Events Tab</h4>
                  <p className="text-sm text-muted-foreground">Record competition results and evictions each week:</p>
                  <ul className="list-disc ml-4 text-sm space-y-1 mt-1">
                    <li>Head of Household (HOH) winners</li>
                    <li>Power of Veto (POV) winners and usage</li>
                    <li>Nominees and replacement nominees</li>
                    <li>Evicted contestants</li>
                    <li>Special events (double/triple evictions)</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm"><strong>💡 Tip:</strong> Points are automatically calculated when you save weekly results!</p>
                </div>
              </div>
            </Card>

            {/* Contestant Management */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3 text-purple-600">👥 Contestant Management</h3>
              <div className="space-y-2 text-sm">
                <p>Use the Contestants tab to:</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Add new contestants manually</li>
                  <li>Generate contestants using AI (if you have OpenAI API key)</li>
                  <li>Edit contestant information and photos</li>
                  <li>Organize contestants into groups</li>
                  <li>Mark contestants as active/inactive</li>
                </ul>
              </div>
            </Card>

            {/* Bonus Questions */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3 text-orange-600">🎯 Bonus Questions</h3>
              <div className="space-y-2 text-sm">
                <p>Manage prediction questions:</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Create new bonus questions with different types</li>
                  <li>Set point values (typically 5-10 points)</li>
                  <li>Reveal correct answers when results are known</li>
                  <li>Deactivate questions that are no longer relevant</li>
                </ul>
                <div className="bg-orange-50 p-3 rounded mt-2">
                  <p className="text-sm"><strong>Question Types:</strong></p>
                  <ul className="text-xs space-y-1 ml-2">
                    <li>• Player Select: Choose one houseguest</li>
                    <li>• Dual Player: Choose two houseguests</li>
                    <li>• Yes/No: True or false question</li>
                    <li>• Number: Numeric prediction</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Pool Settings */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3 text-red-600">⚙️ Pool Settings</h3>
              <div className="space-y-2 text-sm">
                <p>Configure your pool:</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li><strong>Draft Control:</strong> Open/close draft and lock submissions</li>
                  <li><strong>Payment Info:</strong> Set entry fees and payment methods</li>
                  <li><strong>Jury Phase:</strong> Enable when jury voting begins</li>
                  <li><strong>Finale Settings:</strong> Control end-of-season features</li>
                </ul>
              </div>
            </Card>

            {/* Pool Entries */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3 text-teal-600">📋 Pool Entries</h3>
              <div className="space-y-2 text-sm">
                <p>Monitor participant submissions:</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>View all team selections and bonus answers</li>
                  <li>Update payment confirmation status</li>
                  <li>Edit entries if needed (use sparingly)</li>
                  <li>Remove entries from non-paying participants</li>
                </ul>
              </div>
            </Card>

            {/* Scoring & Points */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3 text-indigo-600">🏆 Scoring System</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Automatic Point Calculation:</strong></p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Survival: 1 point per week (automatic)</li>
                  <li>HOH Win: 3 points each</li>
                  <li>POV Win: 3 points each</li>
                  <li>Bonus Questions: 5-10 points each</li>
                  <li>Special bonuses: Block survival streaks</li>
                </ul>
                <div className="bg-indigo-50 p-3 rounded mt-2">
                  <p className="text-sm"><strong>🔄 Points update in real-time</strong> when you save weekly results or reveal bonus answers!</p>
                </div>
              </div>
            </Card>

            {/* Troubleshooting */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-600">🔧 Troubleshooting</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Common Issues:</strong></p>
                <ul className="list-disc ml-4 space-y-1">
                  <li><strong>Points not updating:</strong> Check if weekly results are saved properly</li>
                  <li><strong>Contestants missing:</strong> Use AI generation or add manually</li>
                  <li><strong>Participants can't join:</strong> Check if draft is open and share correct invite code</li>
                  <li><strong>Bonus questions not working:</strong> Ensure they're marked as active</li>
                </ul>
              </div>
            </Card>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};