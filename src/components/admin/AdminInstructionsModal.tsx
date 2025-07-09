import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
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
          <DialogTitle className="text-2xl">Pool Management Guide</DialogTitle>
          <DialogDescription>
            Complete guide to managing your Big Brother Fantasy Pool
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <Accordion type="multiple" className="w-full space-y-2">
            
            {/* Getting Started */}
            <AccordionItem value="getting-started" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="text-base font-semibold">🚀 Getting Started</span>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-3 text-sm">
                  <p>Your pool is created with Season 27 contestants and default bonus questions. Initial setup:</p>
                  <ol className="list-decimal ml-4 space-y-1">
                    <li>Review contestants in <Badge variant="outline">Houseguests</Badge> tab</li>
                    <li>Customize bonus questions in <Badge variant="outline">Bonus Questions</Badge> tab</li>
                    <li>Configure settings in <Badge variant="outline">Pool Settings</Badge> tab</li>
                    <li>Share your pool invite code with participants</li>
                  </ol>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Weekly Management */}
            <AccordionItem value="weekly-management" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="text-base font-semibold">📅 Weekly Management</span>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-3 text-sm">
                  <p>Use <Badge variant="outline">Weekly Events Logging</Badge> to record each week's results:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li><strong>Competitions:</strong> HOH and POV winners</li>
                    <li><strong>Nominations:</strong> Initial nominees and replacement nominees</li>
                    <li><strong>Veto Usage:</strong> Whether POV was used and on whom</li>
                    <li><strong>Evictions:</strong> Who was evicted each week</li>
                    <li><strong>Special Events:</strong> Double/triple evictions, special powers</li>
                  </ul>
                  <div className="bg-blue-50 p-3 rounded mt-3">
                    <p><strong>💡 Tip:</strong> Points calculate automatically when you save weekly results!</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Houseguest Management */}
            <AccordionItem value="houseguest-management" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="text-base font-semibold">👥 Houseguest Management</span>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-2 text-sm">
                  <p>Manage contestants in the <Badge variant="outline">Houseguests</Badge> tab:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>Edit contestant information and photos</li>
                    <li>Add new contestants if needed</li>
                    <li>Organize contestants into groups</li>
                    <li>View contestant statistics and performance</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Bonus Questions */}
            <AccordionItem value="bonus-questions" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="text-base font-semibold">🎯 Bonus Questions</span>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-3 text-sm">
                  <p>Create and manage prediction questions:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>Add new questions with different answer types</li>
                    <li>Set point values (typically 5-10 points)</li>
                    <li>Reveal correct answers when results are known</li>
                    <li>Deactivate outdated questions</li>
                  </ul>
                  <div className="bg-orange-50 p-3 rounded mt-3">
                    <p className="font-medium mb-2">Question Types:</p>
                    <ul className="text-xs space-y-1">
                      <li><strong>Player Select:</strong> Choose one houseguest</li>
                      <li><strong>Dual Player:</strong> Choose two houseguests</li>
                      <li><strong>Yes/No:</strong> True or false questions</li>
                      <li><strong>Number:</strong> Numeric predictions</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Pool Settings */}
            <AccordionItem value="pool-settings" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="text-base font-semibold">⚙️ Pool Settings</span>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-2 text-sm">
                  <p>Configure your pool parameters:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li><strong>Draft Control:</strong> Open/close draft and lock submissions</li>
                    <li><strong>Payment Settings:</strong> Entry fees and payment methods</li>
                    <li><strong>Jury Phase:</strong> Enable when jury voting begins</li>
                    <li><strong>Custom Scoring:</strong> Adjust point values and special events</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Pool Entries */}
            <AccordionItem value="pool-entries" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="text-base font-semibold">📋 Pool Entries</span>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-2 text-sm">
                  <p>Monitor and manage participant submissions:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>View all team selections and bonus answers</li>
                    <li>Confirm payment status for participants</li>
                    <li>Edit entries if corrections are needed</li>
                    <li>Remove entries from non-paying participants</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Scoring System */}
            <AccordionItem value="scoring-system" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="text-base font-semibold">🏆 Scoring System</span>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-3 text-sm">
                  <p><strong>Automatic Point Calculation:</strong></p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li><strong>Survival:</strong> 1 point per week for staying in the house</li>
                    <li><strong>HOH Wins:</strong> 3 points for each Head of Household win</li>
                    <li><strong>POV Wins:</strong> 3 points for each Power of Veto win</li>
                    <li><strong>Bonus Questions:</strong> 5-10 points each when revealed</li>
                    <li><strong>Special Events:</strong> Various points for unique occurrences</li>
                  </ul>
                  <div className="bg-indigo-50 p-3 rounded mt-3">
                    <p><strong>🔄 Real-time Updates:</strong> Points automatically recalculate when you save weekly results or reveal bonus answers!</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Troubleshooting */}
            <AccordionItem value="troubleshooting" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="text-base font-semibold">🔧 Troubleshooting</span>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-2 text-sm">
                  <p><strong>Common Issues & Solutions:</strong></p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li><strong>Points not updating:</strong> Verify weekly results are properly saved</li>
                    <li><strong>Participants can't join:</strong> Check draft is open and share correct invite code</li>
                    <li><strong>Bonus questions not working:</strong> Ensure questions are marked as active</li>
                    <li><strong>Missing contestants:</strong> Add manually in Houseguests tab</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};