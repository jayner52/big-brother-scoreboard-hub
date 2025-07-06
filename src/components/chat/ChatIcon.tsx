import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useChatNotifications } from '@/hooks/useChatNotifications';
import { usePool } from '@/contexts/PoolContext';
import { supabase } from '@/integrations/supabase/client';

export const ChatIcon: React.FC = () => {
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
    <Link to="/chat" className="relative">
      <MessageCircle className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
      {unreadCount > 0 && (
        <div className="absolute -top-2 -right-2">
          {unreadMentions > 0 ? (
            <span className="bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5 font-medium animate-pulse">
              @{unreadMentions}
            </span>
          ) : (
            <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 font-medium">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      )}
    </Link>
  );
};