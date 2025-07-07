import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, BookOpen, LogOut, User, Users } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { EnhancedChatIcon } from '@/components/chat/EnhancedChatIcon';
import { MobileNav } from '@/components/ui/mobile-nav';
import { usePool } from '@/contexts/PoolContext';
import { useUserPoolRole } from '@/hooks/useUserPoolRole';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();
  
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, []);

  const { isAdmin } = useUserPoolRole(activePool?.id, userId || undefined);

  // Mobile navigation content
  const mobileNavContent = (
    <div className="flex flex-col space-y-4">
      {!user ? (
        <Link to="/auth" className="w-full">
          <Button variant="outline" className="w-full mobile-button justify-start">
            <User className="h-4 w-4 mr-2" />
            Login / Sign Up
          </Button>
        </Link>
      ) : (
        <>
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
            <User className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">
              {userEntry?.participant_name || user.email}
            </span>
            {userRank && (
              <Badge variant="secondary">#{userRank}</Badge>
            )}
          </div>
          <Button variant="outline" onClick={onSignOut} className="w-full mobile-button justify-start">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </>
      )}
      
      <Link to="/about" className="w-full">
        <Button 
          className="w-full mobile-button justify-start bg-purple hover:bg-purple/90 text-purple-foreground"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          How to Play
        </Button>
      </Link>
      
      {user && (
        <Link to="/my-teams" className="w-full">
          <Button 
            variant="outline"
            className="w-full mobile-button justify-start"
          >
            <Users className="h-4 w-4 mr-2" />
            My Team(s)
          </Button>
        </Link>
      )}
      
      {user && isAdmin && (
        <Link to="/admin" className="w-full">
          <Button variant="outline" className="w-full mobile-button justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Admin
          </Button>
        </Link>
      )}
    </div>
  );

  return (
    <div className="flex justify-between items-center mb-6 sm:mb-8">
      {/* Desktop Navigation */}
      {!isMobile ? (
        <>
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
        </>
      ) : (
        /* Mobile Navigation */
        <>
          <div className="flex items-center gap-2">
            {user && <EnhancedChatIcon />}
          </div>
          <MobileNav>
            {mobileNavContent}
          </MobileNav>
        </>
      )}
    </div>
  );
};