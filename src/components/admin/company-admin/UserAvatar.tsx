import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user: {
    display_name: string | null;
    avatar_url?: string | null;
    background_color?: string | null;
    email?: string | null;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base'
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return '?';
  };

  const getBgColor = (backgroundColor: string | null) => {
    if (backgroundColor) {
      return { backgroundColor };
    }
    // Fallback to a nice gradient if no background color is set
    return {};
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {user.avatar_url && (
        <AvatarImage 
          src={user.avatar_url} 
          alt={user.display_name || 'User avatar'} 
        />
      )}
      <AvatarFallback 
        style={getBgColor(user.background_color)}
        className={cn(
          "font-medium",
          !user.background_color && "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
        )}
      >
        {getInitials(user.display_name, user.email)}
      </AvatarFallback>
    </Avatar>
  );
};