
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Info, Users, MessageSquare, Settings, LogOut, ChevronDown, Menu, User, TrendingUp } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { EnhancedChatIcon } from '@/components/chat/EnhancedChatIcon';
import { ProfileModal } from '@/components/profile/ProfileModal';
import { PoolsidePicksLogo } from '@/components/brand/PoolsidePicksLogo';
import { usePool } from '@/contexts/PoolContext';
import { useUserPoolRole } from '@/hooks/useUserPoolRole';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface ProfessionalNavigationProps {
  user: SupabaseUser | null;
  userEntry: any;
  userRank: number | null;
  onSignOut: () => void;
  onJoinPool: () => void;
}

export const ProfessionalNavigation: React.FC<ProfessionalNavigationProps> = ({
  user,
  userEntry,
  userRank,
  onSignOut,
  onJoinPool,
}) => {
  const { activePool } = usePool();
  const [userId, setUserId] = React.useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const { profile, refreshProfile } = useUserProfile(user);
  
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, []);

  const { isAdmin } = useUserPoolRole(activePool?.id, userId || undefined);

  const isActiveRoute = (path: string) => location.pathname === path;

  const displayName = profile?.display_name || userEntry?.participant_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = profile?.avatar_url;
  const initials = displayName.charAt(0).toUpperCase();

  const NavButton: React.FC<{
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    badge?: number;
    onClick?: () => void;
  }> = ({ to, icon: Icon, label, badge, onClick }) => (
    <Link to={to} onClick={onClick}>
      <button
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 font-medium text-sm",
          "hover:bg-brand-teal/10 hover:text-brand-teal hover:scale-105",
          "focus:outline-none focus:ring-2 focus:ring-coral/50",
          isActiveRoute(to) 
            ? "bg-coral text-white shadow-md" 
            : "text-muted-foreground border border-border bg-background/50"
        )}
      >
        <Icon className="h-4 w-4" />
        {!isMobile && <span>{label}</span>}
        {badge && badge > 0 && (
          <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
            {badge}
          </Badge>
        )}
      </button>
    </Link>
  );

  const UserDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-3 py-2 h-10 rounded-full hover:bg-muted/50 transition-all duration-200"
        >
          <Avatar className="w-8 h-8">
            {avatarUrl ? (
              <div className={`w-full h-full flex items-center justify-center text-lg rounded-full ${
                profile?.background_color ? `bg-gradient-to-br ${profile.background_color}` : 'bg-gradient-to-br from-brand-teal/20 to-coral/20'
              }`}>
                {avatarUrl}
              </div>
            ) : (
              <AvatarFallback className={`text-white font-semibold text-sm ${
                profile?.background_color ? `bg-gradient-to-br ${profile.background_color}` : 'bg-gradient-to-br from-coral to-brand-teal'
              }`}>
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
          {!isMobile && (
            <>
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium text-foreground truncate max-w-32">
                  {displayName}
                </span>
                {userRank && (
                  <span className="text-xs text-muted-foreground">
                    Rank #{userRank}
                  </span>
                )}
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-background/95 backdrop-blur-sm border shadow-lg"
      >
        <DropdownMenuItem onClick={() => setProfileModalOpen(true)} className="flex items-center gap-2 cursor-pointer">
          <User className="h-4 w-4" />
          Edit Profile
        </DropdownMenuItem>
        
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                Admin Panel
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut} className="flex items-center gap-2 cursor-pointer text-destructive">
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const MobileMenu = () => (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="p-2 h-10 w-10 rounded-full hover:bg-muted/50"
      >
        <Menu className="h-4 w-4" />
      </Button>
      
      {mobileMenuOpen && (
        <div className="absolute top-16 left-4 right-4 bg-background/95 backdrop-blur-sm border rounded-xl shadow-lg p-4 z-50">
          <div className="flex flex-col space-y-3">
            <Link to="/about" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant={isActiveRoute('/about') ? 'default' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <Info className="h-4 w-4" />
                How to Play
              </Button>
            </Link>
            
            {user && (
              <Link to="/my-teams" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant={isActiveRoute('/my-teams') ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                >
                  <Users className="h-4 w-4" />
                  My Team(s)
                </Button>
              </Link>
            )}
            
            {user && isAdmin && (
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant={isActiveRoute('/admin') ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Admin Panel
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (!user) {
    return (
      <nav className="flex items-center justify-between py-4 px-6 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold text-foreground">
            {activePool?.name || 'Poolside Picks'}
          </h3>
        </div>
        
        <div className="flex items-center gap-4">
          <Link to="/about">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Info className="h-4 w-4" />
              How to Play
            </Button>
          </Link>
          
          <Link to="/auth">
            <Button className="bg-coral hover:bg-coral/90 text-white">
              Sign In
            </Button>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between py-3 px-6 bg-background/80 backdrop-blur-sm border-b border-border/50 shadow-sm">
      {/* LEFT SECTION - Pool Identity */}
      <div className="flex items-center gap-2 min-w-0">
        <button 
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <PoolsidePicksLogo size="sm" />
        </button>
        <h3 className="text-lg font-semibold text-foreground truncate">
          {activePool?.name || 'Poolside Picks'}
        </h3>
      </div>

      {/* CENTER SECTION - Core Actions (Hidden on mobile) */}
      {!isMobile && (
        <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-full border border-border/50">
          <NavButton
            to="/about"
            icon={Info}
            label="How to Play"
          />
          
          <NavButton
            to="/my-teams"
            icon={Users}
            label="My Team(s)"
          />
          
          <div className="relative">
            <EnhancedChatIcon />
          </div>

          {/* Trade Coming Soon Pill */}
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground/60 bg-muted/20 border border-border/30 cursor-not-allowed opacity-75"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Trade (coming soon)</span>
          </button>
        </div>
      )}

      {/* RIGHT SECTION - User Menu */}
      <div className="flex items-center gap-2">
        {isMobile && <EnhancedChatIcon />}
        
        {!isMobile ? (
          <UserDropdown />
        ) : (
          <MobileMenu />
        )}
      </div>
      
      {/* Profile Modal */}
      {user && (
        <ProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          user={user}
          userProfile={profile || undefined}
          onProfileUpdate={refreshProfile}
        />
      )}
    </nav>
  );
};
