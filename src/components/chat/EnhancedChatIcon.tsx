import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useChatNotifications } from '@/hooks/useChatNotifications';
import { usePool } from '@/contexts/PoolContext';
import { supabase } from '@/integrations/supabase/client';

export const EnhancedChatIcon: React.FC = () => {
  const { activePool } = usePool();
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, []);

  const { unreadCount, unreadMentions } = useChatNotifications(activePool?.id, userId || undefined);

  if (!activePool || !userId) return null;

  return (
    <Link to="/chat">
      <Button 
        variant="outline" 
        size="sm" 
        className="relative bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 hover:from-primary/20 hover:to-primary/10 hover:border-primary/30 transition-all duration-200"
      >
        <MessageCircle className="h-4 w-4 mr-2 text-primary" />
        <span className="text-primary font-medium">Chat</span>
        {unreadCount > 0 && (
          <div className="absolute -top-2 -right-2">
            {unreadMentions > 0 ? (
              <Badge 
                variant="destructive" 
                className="bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground text-xs px-1.5 py-0.5 animate-pulse shadow-md"
              >
                @{unreadMentions}
              </Badge>
            ) : (
              <Badge 
                variant="secondary" 
                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs px-1.5 py-0.5 shadow-md"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
        )}
      </Button>
    </Link>
  );
};