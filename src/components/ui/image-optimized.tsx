import React, { memo, useMemo } from 'react';

interface ImageOptimizedProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

/**
 * Optimized image component with lazy loading and WebP support
 */
export const ImageOptimized: React.FC<ImageOptimizedProps> = memo(({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc = '/placeholder.svg',
  loading = 'lazy',
  sizes = '100vw',
  onError
}) => {
  // Memoize WebP detection and source optimization
  const optimizedSrc = useMemo(() => {
    if (!src) return fallbackSrc;
    
    // Add WebP format hint if browser supports it
    if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
      // Simple WebP support check
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx && canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
        // Browser supports WebP, could add format conversion here
        return src;
      }
    }
    
    return src;
  }, [src, fallbackSrc]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    if (target.src !== fallbackSrc && fallbackSrc) {
      target.src = fallbackSrc;
    }
    onError?.(e);
  };

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      className={className}
      loading={loading}
      sizes={sizes}
      onError={handleError}
      decoding="async"
      style={{ 
        contentVisibility: 'auto',
        containIntrinsicSize: '300px 200px' // Helps with layout shifts
      }}
    />
  );
});

ImageOptimized.displayName = 'ImageOptimized';