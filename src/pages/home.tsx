import { useEffect, useState } from 'react';
import LoadingScreenV2 from '@/components/LoadingScreen-v2';
import InfinitePlaygroundGrid from '@/components/playground/infinite-playground-grid';
import { gifMap } from '@/components/playground/grid-data';

export default function Home() {
  const [loadedContent, setLoadedContent] = useState<Set<string>>(new Set());
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
  const [showLoading, setShowLoading] = useState(true);
  const [hasSeenLoading, setHasSeenLoading] = useState(false);

  // Check if user has already seen the loading screen in this session
  useEffect(() => {
    const seen = sessionStorage.getItem('hasSeenHomeLoading');
    if (seen === 'true') {
      setShowLoading(false);
      setHasSeenLoading(true);
    }
  }, []);

  // Track page visibility at the top level too
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Preload images (for cards that appear after loading screen)
  useEffect(() => {
    if (!isPageVisible || hasSeenLoading) return;

    const preload = () => {
      Object.values(gifMap).forEach(src => {
        const img = new Image();
        img.onload = () => {
          setLoadedContent(prev => new Set([...prev, src]));
        };
        img.src = src;
      });
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(preload);
    } else {
      setTimeout(preload, 100);
    }
  }, [isPageVisible, hasSeenLoading]);

  const handleLoadingComplete = () => {
    setShowLoading(false);
    sessionStorage.setItem('hasSeenHomeLoading', 'true');
  };

  return (
    <div className='bg-background'>
      {showLoading && <LoadingScreenV2 onComplete={handleLoadingComplete} />}{' '}
      <InfinitePlaygroundGrid loadedContent={loadedContent} />
    </div>
  );
}
