import React from 'react';
import Header from './Header';
import Footer from './Footer';
import AudioPlayer from '@/components/audio/AudioPlayer';

interface LayoutProps {
  children: React.ReactNode;
  showAudioPlayer?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showAudioPlayer = false }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
      {showAudioPlayer && <AudioPlayer />}
    </div>
  );
};

export default Layout;