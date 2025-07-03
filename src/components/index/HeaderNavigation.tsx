import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, BookOpen, LogOut, User, Users } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';

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
        
        {/* How to Play Button - Always Visible */}
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

      {/* Right Side - Admin and User Status */}
      <div className="flex-1 flex justify-end">
        <div className="flex flex-col items-end gap-4">
          <Link to="/admin">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Admin
            </Button>
          </Link>
          
          {/* Join Pool Button for logged in users without entry */}
          {user && !userEntry && (
            <div className="w-72 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-center">
              <p className="text-gray-600 mb-2">Not registered</p>
              <Button
                onClick={onJoinPool}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                Join Pool
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};