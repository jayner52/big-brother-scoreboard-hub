import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Info, Users, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface MobileMenuProps {
  user: SupabaseUser | null;
  isAdmin: boolean;
  hasUnreadNotifications: boolean;
  hasOutstandingPayment: boolean;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  user,
  isAdmin,
  hasUnreadNotifications,
  hasOutstandingPayment,
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
};