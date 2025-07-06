import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, Avatar as AvatarComponent, AvatarFallback } from '@/components/ui/avatar';
import { Users, MessageCircle, Crown, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PoolMember {
  user_id: string;
  display_name: string;
  role: string;
  active: boolean;
  unread_count?: number;
}

interface ChatSidebarProps {
  poolId: string;
  currentUserId: string;
  activeChat: 'group' | string;
  onChatSelect: (chatId: 'group' | string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  poolId,
  currentUserId,
  activeChat,
  onChatSelect
}) => {
  const [poolMembers, setPoolMembers] = useState<PoolMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPoolMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('pool_memberships')
          .select(`
            user_id,
            role,
            active,
            profiles!inner(display_name)
          `)
          .eq('pool_id', poolId)
          .eq('active', true)
          .order('role', { ascending: false }); // Show owners/admins first

        if (error) throw error;

        const members = (data || []).map(m => ({
          user_id: m.user_id,
          display_name: (m.profiles as any)?.display_name || 'Unknown User',
          role: m.role,
          active: m.active,
          unread_count: 0 // TODO: Implement DM unread counts
        }));

        setPoolMembers(members);
      } catch (error) {
        console.error('Error loading pool members:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPoolMembers();
  }, [poolId]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Owner</Badge>;
      case 'admin':
        return <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">Admin</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card className="w-80 h-full">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="w-24 h-4 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-80 h-full bg-gradient-to-b from-background to-muted/20">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Pool Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Group Chat */}
        <div className="p-3 border-b">
          <Button
            variant={activeChat === 'group' ? 'default' : 'ghost'}
            className={`w-full justify-start ${
              activeChat === 'group' 
                ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md' 
                : 'hover:bg-primary/10'
            }`}
            onClick={() => onChatSelect('group')}
          >
            <Users className="h-4 w-4 mr-3" />
            <span className="font-medium">Group Chat</span>
            <Badge variant="secondary" className="ml-auto text-xs">
              {poolMembers.length}
            </Badge>
          </Button>
        </div>

        {/* Direct Messages */}
        <div className="p-3">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <MessageCircle className="h-3 w-3" />
            Direct Messages
          </h3>
          <div className="space-y-1">
            {poolMembers
              .filter(member => member.user_id !== currentUserId)
              .map((member) => (
                <Button
                  key={member.user_id}
                  variant={activeChat === member.user_id ? 'default' : 'ghost'}
                  className={`w-full justify-start p-2 h-auto ${
                    activeChat === member.user_id 
                      ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md' 
                      : 'hover:bg-primary/10'
                  }`}
                  onClick={() => onChatSelect(member.user_id)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <AvatarComponent className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium">
                        {member.display_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </AvatarComponent>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {member.display_name}
                        </span>
                        {getRoleIcon(member.role)}
                      </div>
                      {getRoleBadge(member.role)}
                    </div>
                    {member.unread_count && member.unread_count > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {member.unread_count}
                      </Badge>
                    )}
                  </div>
                </Button>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};