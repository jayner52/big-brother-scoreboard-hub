import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  pool_id: string;
  user_id: string;
  message: string;
  mentioned_user_ids: string[];
  parent_message_id?: string;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
}

export const useChat = (poolId?: string, userId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load messages for the pool
  const loadMessages = useCallback(async () => {
    if (!poolId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          pool_id,
          user_id,
          message,
          mentioned_user_ids,
          parent_message_id,
          is_edited,
          is_deleted,
          created_at,
          updated_at
        `)
        .eq('pool_id', poolId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get user info for each message
      const messagesWithUserInfo = await Promise.all((data || []).map(async (msg) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', msg.user_id)
          .maybeSingle();
        
        return {
          ...msg,
          user_name: profile?.display_name || 'Unknown User'
        };
      }));

      setMessages(messagesWithUserInfo);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [poolId]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!poolId) return;

    loadMessages();

    const channel = supabase
      .channel(`pool-chat-${poolId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `pool_id=eq.${poolId}`
      }, async (payload) => {
        console.log('New message received:', payload);
        
        // Fetch user info for the new message
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', payload.new.user_id)
          .maybeSingle();

        const newMessage = {
          ...payload.new,
          user_name: profile?.display_name || 'Unknown User'
        } as ChatMessage;

        setMessages(prev => [...prev, newMessage]);

        // Update unread counts for other users
        if (payload.new.user_id !== userId) {
          await updateUnreadCounts(poolId, payload.new as ChatMessage);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [poolId, userId, loadMessages]);

  // Update unread counts when new messages arrive
  const updateUnreadCounts = async (poolId: string, message: ChatMessage) => {
    try {
      // Get all pool members except the message sender
      const { data: members } = await supabase
        .from('pool_memberships')
        .select('user_id')
        .eq('pool_id', poolId)
        .eq('active', true)
        .neq('user_id', message.user_id);

      if (!members) return;

      // Update unread counts for each member
      for (const member of members) {
        const isMentioned = message.mentioned_user_ids.includes(member.user_id);
        
        await supabase.rpc('increment_unread_counts', {
          target_user_id: member.user_id,
          target_pool_id: poolId,
          is_mention: isMentioned
        });
      }
    } catch (error) {
      console.error('Error updating unread counts:', error);
    }
  };

  // Send a new message
  const sendMessage = async (messageText: string, mentionedUserIds: string[] = []) => {
    if (!poolId || !userId || !messageText.trim()) return false;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          pool_id: poolId,
          user_id: userId,
          message: messageText.trim(),
          mentioned_user_ids: mentionedUserIds
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      return false;
    }
  };

  // Extract @mentions from text
  const extractMentions = (text: string, poolMembers: Array<{id: string, name: string}>) => {
    const mentionPattern = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionPattern.exec(text)) !== null) {
      const mentionedName = match[1].toLowerCase();
      const member = poolMembers.find(m => 
        m.name.toLowerCase().includes(mentionedName)
      );
      if (member && !mentions.includes(member.id)) {
        mentions.push(member.id);
      }
    }

    return mentions;
  };

  // Render message text with highlighted mentions
  const renderMessageWithMentions = (text: string) => {
    return text.replace(/@(\w+)/g, '<span class="bg-blue-100 text-blue-800 px-1 rounded">@$1</span>');
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    extractMentions,
    renderMessageWithMentions,
    refreshMessages: loadMessages
  };
};