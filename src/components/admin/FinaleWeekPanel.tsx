import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trophy, Crown, Sparkles, Lock } from 'lucide-react';
import { usePool } from '@/contexts/PoolContext';
import { useToast } from '@/hooks/use-toast';

export const FinaleWeekPanel: React.FC = () => {
  const { activePool, updatePool } = usePool();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  if (!activePool) return null;

  const handleFinaleToggle = async (enabled: boolean) => {
    setIsUpdating(true);
    try {
      const success = await updatePool(activePool.id, {
        finale_week_enabled: enabled
      });

      if (success) {
        toast({
          title: enabled ? "Finale Week Enabled" : "Finale Week Disabled",
          description: enabled 
            ? "Pool is now in finale mode. Participants can see final standings."
            : "Pool has exited finale mode.",
        });
      } else {
        throw new Error('Failed to update pool settings');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update finale week setting",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompleteSeasonWithConfetti = async () => {
    setIsUpdating(true);
    try {
      const success = await updatePool(activePool.id, {
        finale_week_enabled: true,
        season_locked: true,
        draft_locked: true
      });

      if (success) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
        
        toast({
          title: "🏆 Season Complete! 🏆",
          description: "Pool has been locked and final standings are displayed. Congratulations to all participants!",
        });
      } else {
        throw new Error('Failed to complete season');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete the season",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="confetti-animation">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 6)]
                }}
              />
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Finale Week Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          
          {/* Current Status */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h3 className="font-semibold">Season Status</h3>
              <p className="text-sm text-muted-foreground">
                {activePool.season_locked ? 'Season completed and locked' : 'Season in progress'}
              </p>
            </div>
            <div>
              {activePool.season_locked ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Crown className="h-3 w-3 mr-1" />
                  Complete
                </Badge>
              ) : (
                <Badge variant="outline">In Progress</Badge>
              )}
            </div>
          </div>

          {/* Finale Week Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="finale-toggle" className="text-base font-medium">
                Enable Finale Week Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Shows final standings and special finale messaging to participants
              </p>
            </div>
            <Switch
              id="finale-toggle"
              checked={activePool.finale_week_enabled || false}
              onCheckedChange={handleFinaleToggle}
              disabled={isUpdating || activePool.season_locked}
            />
          </div>

          {/* Complete Season Action */}
          {!activePool.season_locked && (
            <div className="border-t pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    Complete Season
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Mark the season as officially complete. This will lock all settings, 
                    enable finale mode, and display final congratulations.
                  </p>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                      <Trophy className="h-4 w-4 mr-2" />
                      Complete Season
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Complete Big Brother Season?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <p>This will:</p>
                        <ul className="list-disc ml-4 space-y-1">
                          <li>Lock the pool permanently (no more changes)</li>
                          <li>Enable finale week mode</li>
                          <li>Display final standings to all participants</li>
                          <li>Show congratulations message</li>
                        </ul>
                        <p className="font-medium text-orange-600">
                          ⚠️ This action cannot be undone!
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCompleteSeasonWithConfetti}
                        disabled={isUpdating}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                      >
                        {isUpdating ? 'Completing...' : 'Complete Season 🏆'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}

          {/* Locked State */}
          {activePool.season_locked && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <Lock className="h-4 w-4" />
                <span className="font-medium">Season Completed!</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                This pool has been marked as complete. All participants can view final standings.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <style dangerouslySetInnerHTML={{
        __html: `
          .confetti-animation {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          
          .confetti-piece {
            position: absolute;
            width: 10px;
            height: 10px;
            animation: confetti-fall 3s linear infinite;
          }
          
          @keyframes confetti-fall {
            0% {
              transform: translateY(-100vh) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
        `
      }} />
    </div>
  );
};