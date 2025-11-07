import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: '1/1' | '4/3' | '16/9' | '3/2' | 'natural';
  fallback?: string;
  className?: string;
  containerClassName?: string;
}

export function Image({
  src,
  alt,
  aspectRatio = '1/1',
  fallback = '/placeholder.svg',
  className,
  containerClassName,
  ...props
}: ImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current) {
      const img = imgRef.current;

      const handleLoad = () => {
        setIsLoading(false);
        setHasError(false);
      };

      const handleError = () => {
        setIsLoading(false);
        setHasError(true);
      };

      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleError);

      return () => {
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);
      };
    }
  }, [src]);

  const aspectRatioClasses = {
    natural: 'aspect-auto',
    '1/1': 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
    '3/2': 'aspect-[3/2]',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-muted rounded-none',
        aspectRatioClasses[aspectRatio],
        containerClassName
      )}
    >
      {/* Loading skeleton */}
      {isLoading && <div className='absolute inset-0 bg-gradient-to-r from-muted/50 to-muted animate-pulse' />}

      {/* Image */}
      <img
        ref={imgRef}
        src={hasError ? fallback : src}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        loading='lazy'
        {...props}
      />
    </div>
  );
}
