import { useEffect, useRef, useState } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  resistance?: number;
  enabled?: boolean;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
  enabled = true
}: UsePullToRefreshOptions) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    let rafId: number;

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop > 0) return;
      
      startY.current = e.touches[0].clientY;
      isDragging.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || container.scrollTop > 0) return;
      
      currentY.current = e.touches[0].clientY;
      const deltaY = currentY.current - startY.current;
      
      if (deltaY > 0) {
        e.preventDefault();
        const distance = Math.min(deltaY / resistance, threshold * 1.5);
        
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          setPullDistance(distance);
        });
      }
    };

    const handleTouchEnd = async () => {
      if (!isDragging.current) return;
      
      isDragging.current = false;
      
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
      
      setPullDistance(0);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
      cancelAnimationFrame(rafId);
    };
  }, [enabled, threshold, resistance, onRefresh, pullDistance, isRefreshing]);

  return {
    containerRef,
    isRefreshing,
    pullDistance,
    isPulling: pullDistance > 0
  };
};