import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePool } from '@/contexts/PoolContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Check, X, TestTube } from 'lucide-react';

export const DraftLockTester: React.FC = () => {
  const { activePool } = usePool();
  const { toast } = useToast();

  const testLockConditions = () => {
    if (!activePool) {
      toast({
        title: "No Pool Selected",
        description: "Please select a pool to test lock conditions",
        variant: "destructive",
      });
      return;
    }

    const lockReasons = [];
    
    if (activePool.draft_open === false) {
      lockReasons.push("Draft has been closed by administrator");
    }
    
    if (activePool.allow_new_participants === false) {
      lockReasons.push("New participants are not currently allowed");
    }
    
    if (activePool.registration_deadline) {
      const deadline = new Date(activePool.registration_deadline);
      if (new Date() > deadline) {
        lockReasons.push("Registration deadline has passed");
      }
    }

    const isDraftLocked = lockReasons.length > 0;

    toast({
      title: isDraftLocked ? "🔒 Draft is LOCKED" : "✅ Draft is ACCESSIBLE",
      description: isDraftLocked ? lockReasons.join('. ') : "All lock conditions are cleared - draft should be accessible",
      variant: isDraftLocked ? "destructive" : "default",
    });
  };

  const toggleDraftOpen = async () => {
    if (!activePool) return;
    
    try {
      const { error } = await supabase
        .from('pools')
        .update({ draft_open: !activePool.draft_open })
        .eq('id', activePool.id);

      if (error) throw error;
      
      toast({
        title: "Draft Toggle Updated",
        description: `Draft is now ${!activePool.draft_open ? 'OPEN' : 'CLOSED'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle draft status",
        variant: "destructive",
      });
    }
  };

  const toggleNewParticipants = async () => {
    if (!activePool) return;
    
    try {
      const { error } = await supabase
        .from('pools')
        .update({ allow_new_participants: !activePool.allow_new_participants })
        .eq('id', activePool.id);

      if (error) throw error;
      
      toast({
        title: "New Participants Toggle Updated",
        description: `New participants are now ${!activePool.allow_new_participants ? 'ALLOWED' : 'BLOCKED'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle new participants",
        variant: "destructive",
      });
    }
  };

  if (!activePool) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Draft Lock Tester
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please select a pool to test draft lock functionality.</p>
        </CardContent>
      </Card>
    );
  }

  const isDraftLocked = activePool.draft_open === false || 
                       activePool.allow_new_participants === false ||
                       (activePool.registration_deadline && new Date() > new Date(activePool.registration_deadline));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Draft Lock Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Overall Draft Status:</span>
          <Badge variant={isDraftLocked ? "destructive" : "default"}>
            {isDraftLocked ? (
              <>
                <X className="h-3 w-3 mr-1" />
                LOCKED
              </>
            ) : (
              <>
                <Check className="h-3 w-3 mr-1" />
                ACCESSIBLE
              </>
            )}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <div className="font-medium">Draft Open</div>
              <div className="text-sm text-muted-foreground">draft_open = {activePool.draft_open?.toString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={activePool.draft_open ? "default" : "destructive"}>
                {activePool.draft_open ? "OPEN" : "CLOSED"}
              </Badge>
              <Button size="sm" variant="outline" onClick={toggleDraftOpen}>
                Toggle
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <div className="font-medium">New Participants</div>
              <div className="text-sm text-muted-foreground">allow_new_participants = {activePool.allow_new_participants?.toString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={activePool.allow_new_participants ? "default" : "destructive"}>
                {activePool.allow_new_participants ? "ALLOWED" : "BLOCKED"}
              </Badge>
              <Button size="sm" variant="outline" onClick={toggleNewParticipants}>
                Toggle
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <div className="font-medium">Registration Deadline</div>
              <div className="text-sm text-muted-foreground">
                {activePool.registration_deadline ? 
                  new Date(activePool.registration_deadline).toLocaleString() : 
                  "No deadline set"
                }
              </div>
            </div>
            <Badge variant={
              !activePool.registration_deadline ? "secondary" :
              new Date() > new Date(activePool.registration_deadline) ? "destructive" : "default"
            }>
              {!activePool.registration_deadline ? "NO DEADLINE" :
               new Date() > new Date(activePool.registration_deadline) ? "EXPIRED" : "ACTIVE"}
            </Badge>
          </div>
        </div>

        <Button onClick={testLockConditions} className="w-full">
          <TestTube className="h-4 w-4 mr-2" />
          Test Lock Conditions
        </Button>

        <div className="text-xs text-muted-foreground mt-4">
          <div className="font-medium mb-1">✅ Draft Lock Testing Checklist:</div>
          <ul className="space-y-1 list-disc list-inside">
            <li>Toggle "Draft Open" OFF → Form should be completely locked</li>
            <li>Toggle "New Participants" OFF → Form should be locked</li>
            <li>Set past deadline → Form should be locked automatically</li>
            <li>Try keyboard navigation when locked → Should be blocked</li>
            <li>Try form submission when locked → Should show toast error</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};