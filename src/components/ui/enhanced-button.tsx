import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  touchOptimized?: boolean;
}

export const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ children, loading, loadingText, touchOptimized = true, className, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          className,
          touchOptimized && "touch-action-manipulation active:scale-95 transition-transform duration-150",
          touchOptimized && "min-h-[44px]" // Accessibility touch target
        )}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {loading ? (loadingText || 'Loading...') : children}
      </Button>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";