import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface VideoProps {
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
}

export function Video({
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
}: VideoProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [, setHasError] = useState(false);
  const [useGif, setUseGif] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const aspectRatioClasses = {
    '1/1': 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
    '3/2': 'aspect-[3/2]',
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => {
      setIsLoading(true);
      setHasError(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setHasError(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
      // Fallback to GIF if video fails
      if (gifSrc) {
        setUseGif(true);
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
  }, [gifSrc]);

  // Check if browser supports WebM
  const supportsWebM = () => {
    const video = document.createElement('video');
    return video.canPlayType('video/webm; codecs="vp9"') !== '';
  };

  if (useGif && gifSrc) {
    return (
      <div
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
      className={cn(
        'relative overflow-hidden bg-muted rounded-lg',
        aspectRatioClasses[aspectRatio],
        containerClassName
      )}
    >
      {/* Loading skeleton */}
      {isLoading && <div className='absolute inset-0 bg-gradient-to-r from-muted/50 to-muted animate-pulse z-10' />}

      {/* Video element */}
      <video
        ref={videoRef}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
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
