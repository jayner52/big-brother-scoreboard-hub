import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, BookOpen, LogOut, User, Users } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { EnhancedChatIcon } from '@/components/chat/EnhancedChatIcon';
import { usePool } from '@/contexts/PoolContext';
import { useUserPoolRole } from '@/hooks/useUserPoolRole';
import { supabase } from '@/integrations/supabase/client';

interface HeaderNavigationProps {
  user: SupabaseUser | null;
  userEntry: any;
  userRank: number | null;
  onSignOut: () => void;
  onJoinPool: () => void;
}

export const HeaderNavigation: React.FC<HeaderNavigationProps> = ({
  user,
  userEntry,
  userRank,
  onSignOut,
  onJoinPool,
}) => {
  const { activePool } = usePool();
  const [userId, setUserId] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, []);

  const { isAdmin } = useUserPoolRole(activePool?.id, userId || undefined);
  return (
    <div className="flex justify-between items-start mb-8">
      {/* Left Side - Auth and How to Play */}
      <div className="flex-1 flex items-center gap-4">
        {!user ? (
          <Link to="/auth">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              Login / Sign Up
            </Button>
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1">
              <User className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">
                {userEntry?.participant_name || user.email}
              </span>
              {userRank && (
                <Badge variant="secondary">#{userRank}</Badge>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={onSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <Link to="/about">
          <Button 
            className="bg-purple hover:bg-purple/90 text-purple-foreground flex items-center gap-2"
            size="sm"
          >
            <BookOpen className="h-4 w-4" />
            How to Play
          </Button>
        </Link>
        
        {/* My Team(s) Button - Only for logged in users */}
        {user && (
          <Link to="/my-teams">
            <Button 
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              My Team(s)
            </Button>
          </Link>
        )}
      </div>

      {/* Right Side - Chat and Admin */}
      <div className="flex items-center gap-4">
        {user && <EnhancedChatIcon />}
        {user && isAdmin && (
          <Link to="/admin">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Admin
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};