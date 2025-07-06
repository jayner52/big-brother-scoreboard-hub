import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send, Users } from 'lucide-react';
import { usePool } from '@/contexts/PoolContext';
import { useChat } from '@/hooks/useChat';
import { useChatNotifications } from '@/hooks/useChatNotifications';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { supabase } from '@/integrations/supabase/client';

interface PoolMember {
  id: string;
  name: string;
  email: string;
}

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const { activePool } = usePool();
  const [userId, setUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [poolMembers, setPoolMembers] = useState<PoolMember[]>([]);
  const [showUserList, setShowUserList] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [tagPosition, setTagPosition] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, []);

  const { messages, loading, sendMessage, extractMentions } = useChat(activePool?.id, userId || undefined);
  const { markAsRead } = useChatNotifications(activePool?.id, userId || undefined);

  // Load pool members for @mentions
  useEffect(() => {
    if (!activePool?.id) return;

    const loadPoolMembers = async () => {
      try {
        const { data } = await supabase
          .from('pool_memberships')
          .select(`
            user_id,
            profiles:user_id (display_name)
          `)
          .eq('pool_id', activePool.id)
          .eq('active', true);

        const members = (data || []).map(m => ({
          id: m.user_id,
          name: (m.profiles as any)?.display_name || 'Unknown User',
          email: '' // Could add email if needed
        }));

        setPoolMembers(members);
      } catch (error) {
        console.error('Error loading pool members:', error);
      }
    };

    loadPoolMembers();
  }, [activePool?.id]);

  // Mark messages as read when component mounts or pool changes
  useEffect(() => {
    if (activePool?.id && userId) {
      markAsRead();
    }
  }, [activePool?.id, userId, markAsRead]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle message input with @mention detection
  const handleMessageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    // Detect @ symbol for mentions
    const cursorPosition = e.target.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtSymbol !== -1 && lastAtSymbol === textBeforeCursor.length - 1) {
      setShowUserList(true);
      setTagPosition(lastAtSymbol);
      setTagSearch('');
    } else if (showUserList && lastAtSymbol !== -1) {
      const searchTerm = textBeforeCursor.substring(lastAtSymbol + 1);
      setTagSearch(searchTerm.toLowerCase());
    } else {
      setShowUserList(false);
    }
  };

  // Insert mention when user is selected
  const insertMention = (user: PoolMember) => {
    if (tagPosition === null) return;
    
    const beforeMention = newMessage.substring(0, tagPosition);
    const afterMention = newMessage.substring(tagPosition + 1 + tagSearch.length);
    const mentionText = `@${user.name.split(' ')[0]} `;
    
    setNewMessage(beforeMention + mentionText + afterMention);
    setShowUserList(false);
    setTagPosition(null);
    setTagSearch('');
    
    // Focus input after mention
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const mentionedUsers = extractMentions(newMessage, poolMembers);
    const success = await sendMessage(newMessage, mentionedUsers);
    
    if (success) {
      setNewMessage('');
      setShowUserList(false);
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

  const filteredUsers = showUserList ? poolMembers.filter(user => 
    user.name.toLowerCase().includes(tagSearch) && user.id !== userId
  ) : [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <CardTitle className="text-xl font-bold">
                {activePool.name} Chat
              </CardTitle>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{poolMembers.length} members</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
        {loading ? (
          <div className="text-center text-muted-foreground">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No messages yet. Be the first to say hello!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                message={msg} 
                isOwn={msg.user_id === userId}
                isMentioned={msg.mentioned_user_ids?.includes(userId || '')}
                currentUserId={userId || ''}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* User mention dropdown */}
      {showUserList && filteredUsers.length > 0 && (
        <Card className="mx-4 mb-2 border-border shadow-lg">
          <CardContent className="p-2">
            <div className="text-xs text-muted-foreground mb-2 px-2">Select user to mention:</div>
            {filteredUsers.slice(0, 5).map((user) => (
              <button
                key={user.id}
                onClick={() => insertMention(user)}
                className="w-full text-left px-2 py-1 rounded hover:bg-muted transition-colors text-sm"
              >
                @{user.name}
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Input */}
      <Card className="rounded-none border-x-0 border-b-0">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={handleMessageInput}
              onKeyPress={handleKeyPress}
              placeholder="Type a message... Use @ to mention someone"
              className="flex-1"
              maxLength={1000}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Press Enter to send, Shift+Enter for new line
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Chat;