import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePool } from '@/contexts/PoolContext';
import { useChat } from '@/hooks/useChat';
import { useChatNotifications } from '@/hooks/useChatNotifications';
import { usePoolMembers } from '@/hooks/usePoolMembers';
import { useChatInput } from '@/hooks/useChatInput';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { BrandedChatContainer } from '@/components/chat/BrandedChatContainer';
import { StickyInputBar } from '@/components/chat/StickyInputBar';
import { UserMentionDropdown } from '@/components/chat/UserMentionDropdown';
import { supabase } from '@/integrations/supabase/client';

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const { activePool } = usePool();
  const [userId, setUserId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<'group' | string>('group');

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, []);

  const { messages, loading, sendMessage, deleteMessage, extractMentions } = useChat(activePool?.id, userId || undefined);
  const { markAsRead } = useChatNotifications(activePool?.id, userId || undefined);
  const { poolMembers } = usePoolMembers(activePool?.id);
  const {
    newMessage,
    showUserList,
    showEmojis,
    showGifs,
    handleMessageInput,
    insertMention,
    handleEmojiSelect,
    handleGifSelect,
    clearMessage,
    filteredUsers,
    setShowEmojis,
    setShowGifs
  } = useChatInput();

  // Mark messages as read when component mounts or pool changes
  useEffect(() => {
    if (activePool?.id && userId) {
      markAsRead();
    }
  }, [activePool?.id, userId, markAsRead]);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const mentionedUsers = extractMentions(newMessage, poolMembers);
    const success = await sendMessage(newMessage, mentionedUsers);
    
    if (success) {
      clearMessage();
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!activePool) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">No active pool selected</p>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex font-rounded">
      {/* Sidebar */}
      <ChatSidebar 
        poolId={activePool.id}
        currentUserId={userId || ''}
        activeChat={activeChat}
        onChatSelect={setActiveChat}
      />
      
      {/* Main Chat Area - Poolside Picks Design */}
      <div className="flex-1 flex flex-col h-screen">
        <ChatHeader 
          poolName={activePool.name}
          activeChat={activeChat}
          memberCount={poolMembers.length}
        />

        <BrandedChatContainer 
          messages={messages}
          loading={loading}
          userId={userId}
          onDeleteMessage={deleteMessage}
        />

        <UserMentionDropdown 
          isVisible={showUserList}
          filteredUsers={filteredUsers(poolMembers, userId || undefined)}
          onUserSelect={insertMention}
        />

        <StickyInputBar 
          newMessage={newMessage}
          onMessageChange={handleMessageInput}
          onSendMessage={handleSendMessage}
          onKeyPress={handleKeyPress}
          showEmojis={showEmojis}
          onToggleEmojis={() => setShowEmojis(!showEmojis)}
          onEmojiSelect={handleEmojiSelect}
          showGifs={showGifs}
          onToggleGifs={() => setShowGifs(!showGifs)}
          onGifSelect={handleGifSelect}
        />
      </div>
    </div>
  );
};

export default Chat;