import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Crown, Shield, User } from 'lucide-react';

interface RoleBadgeProps {
  role: 'owner' | 'admin' | 'member';
  showTooltip?: boolean;
  size?: 'sm' | 'default';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ 
  role, 
  showTooltip = true, 
  size = 'default' 
}) => {
  const getRoleConfig = () => {
    switch (role) {
      case 'owner':
        return {
          icon: Crown,
          label: 'Owner',
          variant: 'default' as const,
          className: 'bg-yellow-500 text-white hover:bg-yellow-600',
          tooltip: 'Pool Owner - Full control over all features including financial settings and role management'
        };
      case 'admin':
        return {
          icon: Shield,
          label: 'Admin',
          variant: 'secondary' as const,
          className: 'bg-blue-500 text-white hover:bg-blue-600',
          tooltip: 'Pool Admin - Can manage weekly events, bonus questions, and reveal settings'
        };
      case 'member':
        return {
          icon: User,
          label: 'Member',
          variant: 'outline' as const,
          className: 'border-muted-foreground/20 text-muted-foreground',
          tooltip: 'Pool Member - Can participate in the pool'
        };
    }
  };

  const config = getRoleConfig();
  const Icon = config.icon;
  const badgeSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  const badgeContent = (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${textSize} flex items-center gap-1`}
    >
      <Icon className={badgeSize} />
      {config.label}
    </Badge>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {badgeContent}
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm max-w-xs">{config.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};