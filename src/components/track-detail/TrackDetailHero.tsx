
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

interface TrackContent {
  title?: string;
  description?: string;
  hero_image_url?: string;
}

interface TrackCTASettings {
  show_texts: boolean;
  show_videos: boolean;
  show_photos: boolean;
  texts_label_es?: string;
  texts_label_en?: string;
  videos_label_es?: string;
  videos_label_en?: string;
  photos_label_es?: string;
  photos_label_en?: string;
}

interface TrackDetailHeroProps {
  trackData: any;
  trackContent: TrackContent | null;
  ctaSettings: TrackCTASettings | null;
  currentLanguage: any;
  isCurrentTrack: boolean;
  isPlaying: boolean;
  onPlayPause: () => void;
  getCtaLabel: (type: 'texts' | 'videos' | 'photos') => string;
}

const TrackDetailHero: React.FC<TrackDetailHeroProps> = ({
  trackData,
  trackContent,
  ctaSettings,
  currentLanguage,
  isCurrentTrack,
  isPlaying,
  onPlayPause,
  getCtaLabel
}) => {
  return (
    <section 
      className="hero-section"
      style={{
        backgroundImage: `url(${trackContent?.hero_image_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f'})`
      }}
    >
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="flex items-center justify-center mb-6">
          <span className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mr-6">
            {trackData.order_position}
          </span>
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in">
              {trackContent?.title || `Track ${trackData.order_position}`}
            </h1>
            <p className="text-xl md:text-2xl mb-6 animate-fade-in">
              {trackContent?.description}
            </p>
          </div>
        </div>
        
        {trackData.audio_url && (
          <div className="flex justify-center animate-fade-in">
            <Button
              onClick={onPlayPause}
              className="btn-hero flex items-center space-x-3"
              size="lg"
            >
              {isCurrentTrack && isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
              <span>{isCurrentTrack && isPlaying ? 'Pausar' : 'Reproducir Track'}</span>
            </Button>
          </div>
        )}

        {ctaSettings && (
          <div className="flex flex-wrap justify-center gap-4 mt-8 animate-fade-in">
            {ctaSettings.show_texts && trackContent?.long_text_content && (
              <Button variant="outline" className="btn-secondary-hero">
                {getCtaLabel('texts') || 'Textos'}
              </Button>
            )}
            {ctaSettings.show_videos && trackData.videos && trackData.videos.length > 0 && (
              <Button variant="outline" className="btn-secondary-hero">
                {getCtaLabel('videos') || 'Videos'}
              </Button>
            )}
            {ctaSettings.show_photos && trackData.track_featured_images && trackData.track_featured_images.length > 0 && (
              <Button variant="outline" className="btn-secondary-hero">
                {getCtaLabel('photos') || 'Fotos'}
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrackDetailHero;
