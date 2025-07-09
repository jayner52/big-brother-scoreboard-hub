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
        setStatus({
          hasUnreadNotifications: false,
          hasOutstandingPayment: false,
          totalUnread: 0
        });
        return;
      }

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

    // Set up real-time subscription for winner notifications
    const notificationsChannel = supabase
      .channel('winner_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'winner_notifications'
        },
        () => {
          checkNotifications();
        }
      )
      .subscribe();

    // Set up real-time subscription for pool entries payment status
    const entriesChannel = supabase
      .channel('pool_entries_payment_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pool_entries'
        },
        () => {
          checkNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(entriesChannel);
    };
  }, []);

  return {
    ...status,
    loading,
    refresh: checkNotifications
  };
};