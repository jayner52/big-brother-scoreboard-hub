import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Trophy, 
  Users, 
  Target, 
  Calendar, 
  MoreHorizontal 
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: number;
}

interface BottomNavProps {
  className?: string;
  badgeCount?: { [key: string]: number };
}

export const BottomNav: React.FC<BottomNavProps> = ({ 
  className,
  badgeCount = {}
}) => {
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      label: 'Pools',
      href: '/dashboard',
      icon: Trophy,
    },
    {
      label: 'Standings',
      href: '/dashboard#leaderboard',
      icon: Users,
      badge: badgeCount.standings
    },
    {
      label: 'Picks',
      href: '/dashboard#draft',
      icon: Target,
      badge: badgeCount.picks
    },
    {
      label: 'Events',
      href: '/dashboard#results',
      icon: Calendar,
      badge: badgeCount.events
    },
    {
      label: 'More',
      href: '/dashboard',
      icon: MoreHorizontal,
    }
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border",
      "safe-area-inset-bottom", // For devices with home indicator
      className
    )}>
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center relative",
                "min-w-[60px] h-full px-2 py-1 rounded-lg",
                "transition-colors duration-200",
                "touch-manipulation", // Optimize for touch
                active 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "h-5 w-5 mb-1",
                  active && "scale-110"
                )} />
                
                {/* Badge */}
                {item.badge && item.badge > 0 && (
                  <div className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </div>
                )}
              </div>
              
              <span className={cn(
                "text-xs font-medium leading-none",
                active && "font-semibold"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};