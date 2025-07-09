import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Info, Users, TrendingUp } from 'lucide-react';
import { EnhancedChatIcon } from '@/components/chat/EnhancedChatIcon';
import { cn } from '@/lib/utils';

interface NavigationButtonsProps {
  hasUnreadNotifications: boolean;
  hasOutstandingPayment: boolean;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  hasUnreadNotifications,
  hasOutstandingPayment,
}) => {
  const location = useLocation();

  const isActiveRoute = (path: string) => location.pathname === path;

  const NavButton: React.FC<{
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    badge?: number;
    hasNotification?: boolean;
    onClick?: () => void;
  }> = ({ to, icon: Icon, label, badge, hasNotification, onClick }) => (
    <Link to={to} onClick={onClick}>
      <button
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 font-medium text-sm relative",
          "hover:bg-brand-teal/10 hover:text-brand-teal hover:scale-105",
          "focus:outline-none focus:ring-2 focus:ring-coral/50",
          isActiveRoute(to) 
            ? "bg-coral text-white shadow-md" 
            : "text-muted-foreground border border-border bg-background/50"
        )}
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
        {badge && badge > 0 && (
          <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
            {badge}
          </Badge>
        )}
        {hasNotification && (
          <div 
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white cursor-help"
            title="Buy In Outstanding"
          >
            !
          </div>
        )}
      </button>
    </Link>
  );

  return (
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
        hasNotification={hasUnreadNotifications || hasOutstandingPayment}
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
  );
};