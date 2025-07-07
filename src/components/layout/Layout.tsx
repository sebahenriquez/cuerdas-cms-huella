
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import AudioPlayer from '@/components/audio/AudioPlayer';

interface LayoutProps {
  children: React.ReactNode;
  showAudioPlayer?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showAudioPlayer = false }) => {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        {children}
      </main>
      {showAudioPlayer && <AudioPlayer />}
    </div>
  );
};

export default Layout;
