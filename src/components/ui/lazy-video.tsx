import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyVideoProps {
  webmSrc?: string;
  mp4Src?: string;
  gifSrc?: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: '1/1' | '4/3' | '16/9' | '3/2';
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  threshold?: number;
}

export function LazyVideo({
  webmSrc,
  mp4Src,
  gifSrc,
  alt,
  className,
  containerClassName,
  aspectRatio = '1/1',
  autoplay = true,
  loop = true,
  muted = true,
  playsInline = true,
  threshold = 0.1,
}: LazyVideoProps) {
  const [isInView, setIsInView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, setHasError] = useState(false);
  const [useGif, setUseGif] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const aspectRatioClasses = {
    '1/1': 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
    '3/2': 'aspect-[3/2]',
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: '500px', // Very large preload margin for smooth experience
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  // Video loading logic
  useEffect(() => {
    if (!isInView) return;

    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => {
      setIsLoading(true);
      setHasError(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setHasError(false);
      setIsReady(true);
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
      if (gifSrc) {
        setUseGif(true);
        setIsReady(true);
      }
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [isInView, gifSrc]);

  // Check if browser supports WebM
  const supportsWebM = () => {
    const video = document.createElement('video');
    return video.canPlayType('video/webm; codecs="vp9"') !== '';
  };

  // Show placeholder until in view
  if (!isInView) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'relative overflow-hidden bg-muted rounded-lg',
          aspectRatioClasses[aspectRatio],
          containerClassName
        )}
      >
        <div className='absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-700' />
        <div className='absolute inset-0 flex items-center justify-center text-white text-3xl font-bold opacity-40'>
          {alt[0] || '?'}
        </div>
      </div>
    );
  }

  if (useGif && gifSrc) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'relative overflow-hidden bg-muted rounded-lg',
          aspectRatioClasses[aspectRatio],
          containerClassName
        )}
      >
        <img src={gifSrc} alt={alt} className={cn('w-full h-full object-cover', className)} loading='lazy' />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-muted rounded-lg',
        aspectRatioClasses[aspectRatio],
        containerClassName
      )}
    >
      {/* Loading skeleton - only show if not ready */}
      {isLoading && !isReady && <div className='absolute inset-0 bg-gradient-to-r from-muted/50 to-muted animate-pulse z-10' />}

      {/* Video element */}
      <video
        ref={videoRef}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-200',
          isLoading && !isReady ? 'opacity-0' : 'opacity-100',
          className
        )}
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        preload='metadata'
      >
        {supportsWebM() && webmSrc && <source src={webmSrc} type='video/webm' />}
        {mp4Src && <source src={mp4Src} type='video/mp4' />}
        {gifSrc && <img src={gifSrc} alt={alt} />}
      </video>
    </div>
  );
}
