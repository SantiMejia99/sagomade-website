import { useEffect, useState } from 'react';
import InfiniteProjectGrid from '@/components/home/InfiniteProjectGrid';
import LoadingScreen from '@/components/home/LoadingScreen';
import { homeProjectImages } from '@/data/homeProjectImages';

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
      Object.values(homeProjectImages).forEach(src => {
        const img = new Image();
        img.onload = () => {
          setLoadedContent(prev => new Set([...prev, src]));
        };
        img.src = src;
      });
    };

    // Intentionally not cancelled on cleanup: on a repeat visit this effect runs once with
    // hasSeenLoading=false before the session check flips it, and that run is what loads
    // the tile images. Cancelling it would leave the grid showing letter placeholders.
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
      {showLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      <InfiniteProjectGrid loadedContent={loadedContent} />
    </div>
  );
}
