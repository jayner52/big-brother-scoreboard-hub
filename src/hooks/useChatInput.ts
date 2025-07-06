import { useState, useCallback } from 'react';
import { PoolMember } from '@/components/chat/UserMentionDropdown';

export const useChatInput = () => {
  const [newMessage, setNewMessage] = useState('');
  const [showUserList, setShowUserList] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [tagPosition, setTagPosition] = useState<number | null>(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showGifs, setShowGifs] = useState(false);

  // Handle message input with @mention detection
  const handleMessageInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    // Detect @ symbol for mentions
    const cursorPosition = e.target.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtSymbol !== -1) {
      const searchTerm = textBeforeCursor.substring(lastAtSymbol + 1);
      
      // Only show mentions if there's no space after @ (mentions can't contain spaces)
      if (!searchTerm.includes(' ')) {
        setShowUserList(true);
        setTagPosition(lastAtSymbol);
        setTagSearch(searchTerm.toLowerCase());
      } else {
        setShowUserList(false);
      }
    } else {
      setShowUserList(false);
    }
  }, []);

  // Insert mention when user is selected
  const insertMention = useCallback((user: PoolMember) => {
    if (tagPosition === null) return;
    
    const beforeMention = newMessage.substring(0, tagPosition);
    const afterMention = newMessage.substring(tagPosition + 1 + tagSearch.length);
    const mentionText = `@${user.name.split(' ')[0]} `;
    
    setNewMessage(beforeMention + mentionText + afterMention);
    setShowUserList(false);
    setTagPosition(null);
    setTagSearch('');
  }, [newMessage, tagPosition, tagSearch]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojis(false);
  }, []);

  const handleGifSelect = useCallback((gifUrl: string) => {
    setNewMessage(gifUrl);
    setShowGifs(false);
  }, []);

  const clearMessage = useCallback(() => {
    setNewMessage('');
    setShowUserList(false);
  }, []);

  const filteredUsers = useCallback((poolMembers: PoolMember[], userId?: string) => {
    return showUserList ? poolMembers.filter(user => 
      user.name.toLowerCase().includes(tagSearch) && user.id !== userId
    ) : [];
  }, [showUserList, tagSearch]);

  return {
    newMessage,
    showUserList,
    tagSearch,
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
  };
};