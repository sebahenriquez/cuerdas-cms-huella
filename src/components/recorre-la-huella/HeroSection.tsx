
import React from 'react';

interface TrackContent {
  title?: string;
  description?: string;
  hero_image_url?: string;
}

interface HeroSectionProps {
  currentTrackContent: TrackContent | null;
}

const HeroSection: React.FC<HeroSectionProps> = ({ currentTrackContent }) => {
  return (
    <section 
      className="hero-section hero-bg-image"
      style={{
        backgroundImage: currentTrackContent?.hero_image_url 
          ? `url(${currentTrackContent.hero_image_url})`
          : 'url(https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f)'
      }}
    >
      <div className="hero-overlay" />
      <div className="hero-content">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
          {currentTrackContent?.title || 'Recorre la Huella'}
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto animate-fade-in opacity-90 mb-8">
          {currentTrackContent?.description || 'Sumérgete en un recorrido interactivo por los diferentes tracks que componen este álbum musical.'}
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="#textos"
            className="bg-primary/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg border border-white/30 hover:bg-primary/30 transition-all duration-300 transform hover:scale-105"
          >
            Textos
          </a>
          <a
            href="#videos"
            className="bg-primary/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg border border-white/30 hover:bg-primary/30 transition-all duration-300 transform hover:scale-105"
          >
            Videos
          </a>
          <a
            href="#fotos"
            className="bg-primary/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg border border-white/30 hover:bg-primary/30 transition-all duration-300 transform hover:scale-105"
          >
            Fotos
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
