import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Users, Clock } from 'lucide-react';
import { usePool } from '@/contexts/PoolContext';
import { useToast } from '@/hooks/use-toast';

export const DraftTimingPanel: React.FC = () => {
  const { activePool, updatePool } = usePool();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!activePool) return null;

  const handleHidePicksToggle = async (hidePicksEnabled: boolean) => {
    setIsUpdating(true);
    try {
      const success = await updatePool(activePool.id, {
        hide_picks_until_draft_closed: hidePicksEnabled
      });

      if (success) {
        toast({
          title: hidePicksEnabled ? "Picks Hidden" : "Picks Visible",
          description: hidePicksEnabled 
            ? "Everyone's picks will be hidden until draft closes"
            : "Everyone's picks are now visible to all participants",
        });
      } else {
        throw new Error('Failed to update pool settings');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update draft timing setting",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDraftToggle = async (draftOpen: boolean) => {
    setIsUpdating(true);
    try {
      const success = await updatePool(activePool.id, {
        draft_open: draftOpen
      });

      if (success) {
        toast({
          title: draftOpen ? "Draft Opened" : "Draft Closed",
          description: draftOpen 
            ? "Participants can now submit and edit their teams"
            : "Draft is closed. No new submissions or edits allowed.",
        });
      } else {
        throw new Error('Failed to update draft status');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update draft status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDraftLockToggle = async (draftLocked: boolean) => {
    setIsUpdating(true);
    try {
      const success = await updatePool(activePool.id, {
        draft_locked: draftLocked
      });

      if (success) {
        toast({
          title: draftLocked ? "Draft Locked" : "Draft Unlocked",
          description: draftLocked 
            ? "All draft submissions are permanently locked"
            : "Draft submissions can be modified again",
        });
      } else {
        throw new Error('Failed to update draft lock status');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update draft lock status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-6 w-6" />
          Draft Timing & Visibility
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        
        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Draft Status</p>
              <p className="text-xs text-muted-foreground">Can participants join?</p>
            </div>
            <Badge variant={activePool.draft_open ? "default" : "secondary"}>
              {activePool.draft_open ? "Open" : "Closed"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Draft Lock</p>
              <p className="text-xs text-muted-foreground">Are teams locked?</p>
            </div>
            <Badge variant={activePool.draft_locked ? "destructive" : "outline"}>
              {activePool.draft_locked ? "Locked" : "Editable"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Picks Visibility</p>
              <p className="text-xs text-muted-foreground">Can others see picks?</p>
            </div>
            <Badge variant={activePool.hide_picks_until_draft_closed ? "secondary" : "default"}>
              {activePool.hide_picks_until_draft_closed ? "Hidden" : "Visible"}
            </Badge>
          </div>
        </div>

        {/* Draft Open/Close Control */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="draft-open-toggle" className="text-base font-medium">
              Allow New Participants
            </Label>
            <p className="text-sm text-muted-foreground">
              When enabled, new participants can join and create teams
            </p>
          </div>
          <Switch
            id="draft-open-toggle"
            checked={activePool.draft_open}
            onCheckedChange={handleDraftToggle}
            disabled={isUpdating || activePool.season_locked}
          />
        </div>

        {/* Draft Lock Control */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="draft-lock-toggle" className="text-base font-medium">
              Lock All Teams
            </Label>
            <p className="text-sm text-muted-foreground">
              Prevent all participants from editing their teams (permanent)
            </p>
          </div>
          <Switch
            id="draft-lock-toggle"
            checked={activePool.draft_locked}
            onCheckedChange={handleDraftLockToggle}
            disabled={isUpdating || activePool.season_locked}
          />
        </div>

        {/* Hide Picks Control */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="hide-picks-toggle" className="text-base font-medium flex items-center gap-2">
              {activePool.hide_picks_until_draft_closed ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              Hide Everyone's Picks
            </Label>
            <p className="text-sm text-muted-foreground">
              Hide team selections from participants until draft period ends
            </p>
          </div>
          <Switch
            id="hide-picks-toggle"
            checked={activePool.hide_picks_until_draft_closed || false}
            onCheckedChange={handleHidePicksToggle}
            disabled={isUpdating || activePool.season_locked}
          />
        </div>

        {/* Information Alert */}
        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>
            <strong>Draft Strategy:</strong> Many pool organizers hide picks during the draft period to prevent 
            participants from copying popular selections. Once you close the draft, everyone's picks become visible.
          </AlertDescription>
        </Alert>

        {/* Locked Warning */}
        {activePool.season_locked && (
          <Alert variant="destructive">
            <AlertDescription>
              Season is completed and locked. No draft settings can be modified.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};