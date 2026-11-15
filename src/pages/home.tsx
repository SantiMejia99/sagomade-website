import { useEffect, useState } from 'react';
import LoadingScreenV2 from '@/components/LoadingScreen-v2';
import InfinitePlaygroundGrid from '@/components/playground/infinite-playground-grid';

export default function Home() {
  const [showLoading, setShowLoading] = useState(true);

  // Check if user has already seen the loading screen in this session
  useEffect(() => {
    const seen = sessionStorage.getItem('hasSeenHomeLoading');
    if (seen === 'true') {
      setShowLoading(false);
    }
  }, []);

  const handleLoadingComplete = () => {
    setShowLoading(false);
    sessionStorage.setItem('hasSeenHomeLoading', 'true');
  };

  return (
    <div className='bg-background'>
      {showLoading && <LoadingScreenV2 onComplete={handleLoadingComplete} />} <InfinitePlaygroundGrid />
    </div>
  );
}
