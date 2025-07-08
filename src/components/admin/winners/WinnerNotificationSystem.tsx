import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Bell, Gift, DollarSign } from 'lucide-react';
import { PrizeClaimModal } from './PrizeClaimModal';

interface Notification {
  id: string;
  pool_id: string;
  place: number;
  amount: number;
  notification_type: string;
  message: string;
  sent_at: string;
  read_at: string | null;
}

export const WinnerNotificationSystem: React.FC = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);

  useEffect(() => {
    loadNotifications();
    
    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('winner_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'winner_notifications'
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show toast for new prize notification
          if (newNotification.notification_type === 'prize_won') {
            toast({
              title: "🎉 Congratulations!",
              description: `You won ${getPlaceText(newNotification.place)}! Click to submit payment details.`,
              duration: 8000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('winner_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimPrize = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowClaimModal(true);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('winner_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getPlaceText = (place: number) => {
    switch (place) {
      case 1: return '1st Place';
      case 2: return '2nd Place';
      case 3: return '3rd Place';
      default: return `${place}th Place`;
    }
  };

  const getPlaceIcon = (place: number) => {
    switch (place) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏆';
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading notifications...</div>;
  }

  if (notifications.length === 0) {
    return null; // Don't show anything if no notifications
  }

  return (
    <>
      <div className="space-y-3">
        {notifications.map((notification) => (
          <Alert key={notification.id} className={`transition-all ${
            !notification.read_at ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {notification.notification_type === 'prize_won' && (
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  )}
                  {notification.notification_type === 'prize_sent' && (
                    <Gift className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getPlaceIcon(notification.place)}</span>
                    <Badge variant="secondary">{getPlaceText(notification.place)}</Badge>
                    <div className="flex items-center gap-1 text-green-600">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold">${notification.amount.toFixed(0)}</span>
                    </div>
                  </div>
                  <AlertDescription>
                    {notification.message}
                  </AlertDescription>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(notification.sent_at).toLocaleDateString()} at {new Date(notification.sent_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                {notification.notification_type === 'prize_won' && (
                  <Button
                    size="sm"
                    onClick={() => handleClaimPrize(notification)}
                    className="bg-yellow-500 hover:bg-yellow-600"
                  >
                    Claim Prize
                  </Button>
                )}
                
                {!notification.read_at && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <Bell className="h-3 w-3 mr-1" />
                    Mark Read
                  </Button>
                )}
              </div>
            </div>
          </Alert>
        ))}
      </div>

      <PrizeClaimModal
        open={showClaimModal}
        onOpenChange={setShowClaimModal}
        notification={selectedNotification ? {
          pool_id: selectedNotification.pool_id,
          place: selectedNotification.place,
          amount: selectedNotification.amount
        } : null}
      />
    </>
  );
};