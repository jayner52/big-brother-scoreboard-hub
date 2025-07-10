import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const PULL_THRESHOLD = 60;
const MAX_PULL_DISTANCE = 100;

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  className,
  disabled = false
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    // Only allow pull-to-refresh when at the top of the page
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setCanPull(true);
    }
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!canPull || disabled || isRefreshing) return;
    
    currentY.current = e.touches[0].clientY;
    const pullDistance = Math.max(0, currentY.current - startY.current);
    
    if (pullDistance > 0) {
      e.preventDefault(); // Prevent scrolling
      setPullDistance(Math.min(pullDistance, MAX_PULL_DISTANCE));
    }
  }, [canPull, disabled, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!canPull || disabled || isRefreshing) return;
    
    setCanPull(false);
    
    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
  }, [canPull, disabled, isRefreshing, pullDistance, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const refreshOpacity = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const refreshRotation = (pullDistance / PULL_THRESHOLD) * 360;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Refresh indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center bg-background/90 backdrop-blur-sm border-b transition-transform duration-200 z-10"
          style={{ 
            transform: `translateY(${pullDistance - 40}px)`,
            height: '40px'
          }}
        >
          <RefreshCw 
            className={cn(
              "h-5 w-5 text-primary transition-all duration-200",
              isRefreshing && "animate-spin"
            )}
            style={{ 
              opacity: refreshOpacity,
              transform: isRefreshing ? 'none' : `rotate(${refreshRotation}deg)`
            }}
          />
        </div>
      )}
      
      {/* Content */}
      <div 
        style={{ 
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? 'transform 0.2s ease-out' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
};