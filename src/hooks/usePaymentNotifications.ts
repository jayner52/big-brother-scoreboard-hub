import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentNotificationStatus {
  hasUnreadNotifications: boolean;
  hasOutstandingPayment: boolean;
  totalUnread: number;
}

export const usePaymentNotifications = () => {
  const [status, setStatus] = useState<PaymentNotificationStatus>({
    hasUnreadNotifications: false,
    hasOutstandingPayment: false,
    totalUnread: 0
  });
  const [loading, setLoading] = useState(true);

  const checkNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('PAYMENT_NOTIFICATIONS: No user found');
        setStatus({
          hasUnreadNotifications: false,
          hasOutstandingPayment: false,
          totalUnread: 0
        });
        return;
      }

      console.log('PAYMENT_NOTIFICATIONS: Checking for user:', user.id);

      // Check for unread winner notifications
      const { data: notifications, error: notificationsError } = await supabase
        .from('winner_notifications')
        .select('*')
        .eq('user_id', user.id)
        .is('read_at', null);

      if (notificationsError) throw notificationsError;

      // Check for outstanding payment entries (user's own entries that are not payment confirmed)
      const { data: entries, error: entriesError } = await supabase
        .from('pool_entries')
        .select('id, payment_confirmed')
        .eq('user_id', user.id)
        .eq('payment_confirmed', false);

      if (entriesError) throw entriesError;

      const hasUnreadNotifications = (notifications?.length || 0) > 0;
      const hasOutstandingPayment = (entries?.length || 0) > 0;
      const totalUnread = (notifications?.length || 0) + (entries?.length || 0);

      console.log('PAYMENT_NOTIFICATIONS: Results:', {
        notifications: notifications?.length || 0,
        outstandingEntries: entries?.length || 0,
        hasUnreadNotifications,
        hasOutstandingPayment,
        totalUnread
      });

      setStatus({
        hasUnreadNotifications,
        hasOutstandingPayment,
        totalUnread
      });
    } catch (error) {
      console.error('Error checking payment notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkNotifications();

    const setupSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Set up real-time subscription for winner notifications (user-specific)
      const notificationsChannel = supabase
        .channel('winner_notifications_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'winner_notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('PAYMENT_NOTIFICATIONS: Winner notification change:', payload);
            checkNotifications();
          }
        )
        .subscribe();

      // Set up real-time subscription for pool entries payment status (user-specific)
      const entriesChannel = supabase
        .channel('pool_entries_payment_changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'pool_entries',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('PAYMENT_NOTIFICATIONS: Pool entry payment change:', payload);
            checkNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(notificationsChannel);
        supabase.removeChannel(entriesChannel);
      };
    };

    const cleanup = setupSubscriptions();
    
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, []);

  return {
    ...status,
    loading,
    refresh: checkNotifications
  };
};