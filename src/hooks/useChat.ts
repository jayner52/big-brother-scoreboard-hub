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
  recipient_user_id?: string;
  chat_type: 'group' | 'direct';
}

export const useChat = (poolId?: string, userId?: string, activeChat: 'group' | string = 'group') => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load messages for the pool or DM
  const loadMessages = useCallback(async () => {
    if (!poolId || !userId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let query = supabase
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
          updated_at,
          recipient_user_id,
          chat_type
        `)
        .eq('pool_id', poolId)
        .eq('is_deleted', false);

      if (activeChat === 'group') {
        // Load group messages
        query = query.eq('chat_type', 'group');
      } else {
        // Load DM messages between current user and selected user
        query = query
          .eq('chat_type', 'direct')
          .or(`and(user_id.eq.${userId},recipient_user_id.eq.${activeChat}),and(user_id.eq.${activeChat},recipient_user_id.eq.${userId})`);
      }

      const { data, error } = await query.order('created_at', { ascending: true });

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
        } as ChatMessage;
      }));

      setMessages(messagesWithUserInfo);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [poolId, userId, activeChat]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!poolId || !userId) return;

    loadMessages();

    const channel = supabase
      .channel(`pool-chat-${poolId}-${activeChat}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `pool_id=eq.${poolId}`
      }, async (payload) => {
        console.log('New message received:', payload);
        
        const newMessageData = payload.new as any;
        
        // Check if this message should be displayed in current chat
        const shouldShow = activeChat === 'group' 
          ? newMessageData.chat_type === 'group'
          : newMessageData.chat_type === 'direct' && (
              (newMessageData.user_id === userId && newMessageData.recipient_user_id === activeChat) ||
              (newMessageData.user_id === activeChat && newMessageData.recipient_user_id === userId)
            );

        if (!shouldShow) return;
        
        // Fetch user info for the new message
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', newMessageData.user_id)
          .maybeSingle();

        const newMessage = {
          ...newMessageData,
          user_name: profile?.display_name || 'Unknown User'
        } as ChatMessage;

        setMessages(prev => [...prev, newMessage]);

        // Update unread counts for other users
        if (newMessageData.user_id !== userId) {
          await updateUnreadCounts(poolId, newMessage);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [poolId, userId, activeChat, loadMessages]);

  // Update unread counts when new messages arrive
  const updateUnreadCounts = async (poolId: string, message: ChatMessage) => {
    try {
      if (message.chat_type === 'group') {
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
            is_mention: isMentioned,
            target_chat_type: 'group'
          });
        }
      } else if (message.chat_type === 'direct' && message.recipient_user_id) {
        // Update unread count for DM recipient
        await supabase.rpc('increment_unread_counts', {
          target_user_id: message.recipient_user_id,
          target_pool_id: poolId,
          is_mention: false,
          target_chat_type: 'direct',
          target_other_user_id: message.user_id
        });
      }
    } catch (error) {
      console.error('Error updating unread counts:', error);
    }
  };

  // Send a new message (group or DM)
  const sendMessage = async (messageText: string, mentionedUserIds: string[] = []) => {
    if (!poolId || !userId || !messageText.trim()) return false;

    try {
      const messageData: any = {
        pool_id: poolId,
        user_id: userId,
        message: messageText.trim(),
        mentioned_user_ids: mentionedUserIds,
        chat_type: activeChat === 'group' ? 'group' : 'direct'
      };

      // Add recipient for DMs
      if (activeChat !== 'group') {
        messageData.recipient_user_id = activeChat;
      }

      const { error } = await supabase
        .from('chat_messages')
        .insert(messageData);

      if (error) throw error;
      
      // No need to manually add to messages - realtime will handle it
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      return false;
    }
  };

  // Delete a message
  const deleteMessage = async (messageId: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('user_id', userId); // Only allow deleting own messages

      if (error) throw error;
      
      // Remove from local state immediately
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      return true;
    } catch (err) {
      console.error('Error deleting message:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete message');
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
    deleteMessage,
    extractMentions,
    renderMessageWithMentions,
    refreshMessages: loadMessages
  };
};