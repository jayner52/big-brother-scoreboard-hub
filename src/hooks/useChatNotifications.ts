import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useChatNotifications = (poolId?: string, userId?: string) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMentions, setUnreadMentions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!poolId || !userId) {
      setUnreadCount(0);
      setUnreadMentions(0);
      setLoading(false);
      return;
    }

    const fetchUnreadCounts = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_read_status')
          .select('unread_count, unread_mentions')
          .eq('pool_id', poolId)
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') { // Ignore "no rows returned" error
          console.error('Error fetching unread counts:', error);
          return;
        }

        setUnreadCount(data?.unread_count || 0);
        setUnreadMentions(data?.unread_mentions || 0);
      } catch (error) {
        console.error('Error fetching unread counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnreadCounts();

    // Subscribe to changes in read status
    const channel = supabase
      .channel('chat-notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_read_status',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        if (payload.new && (payload.new as any).pool_id === poolId) {
          const newData = payload.new as any;
          setUnreadCount(newData.unread_count || 0);
          setUnreadMentions(newData.unread_mentions || 0);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [poolId, userId]);

  const markAsRead = async () => {
    if (!poolId || !userId) return;

    try {
      const { error } = await supabase
        .from('chat_read_status')
        .upsert({
          user_id: userId,
          pool_id: poolId,
          last_read_at: new Date().toISOString(),
          unread_count: 0,
          unread_mentions: 0
        }, {
          onConflict: 'user_id,pool_id'
        });
      
      // Ignore duplicate key constraint errors
      if (error && error.code !== '23505') {
        throw error;
      }
      
      setUnreadCount(0);
      setUnreadMentions(0);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  return {
    unreadCount,
    unreadMentions,
    loading,
    markAsRead
  };
};