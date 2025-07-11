import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Info, Users, Settings, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface MobileMenuProps {
  user: SupabaseUser | null;
  isAdmin: boolean;
  hasUnreadNotifications: boolean;
  hasOutstandingPayment: boolean;
  onProfileModalOpen?: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  user,
  isAdmin,
  hasUnreadNotifications,
  hasOutstandingPayment,
  onProfileModalOpen,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActiveRoute = (path: string) => location.pathname === path;

  return (
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
              <>
                <Link to="/my-teams" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={isActiveRoute('/my-teams') ? 'default' : 'ghost'}
                    className="w-full justify-start gap-2 relative"
                  >
                    <Users className="h-4 w-4" />
                    My Team(s)
                     {(hasUnreadNotifications || hasOutstandingPayment) && (
                       <div 
                         className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white cursor-help"
                         title="Buy In Outstanding"
                       >
                         !
                       </div>
                     )}
                  </Button>
                </Link>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onProfileModalOpen?.();
                  }}
                >
                  <User className="h-4 w-4" />
                  Edit Profile
                </Button>
              </>
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
            
            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};