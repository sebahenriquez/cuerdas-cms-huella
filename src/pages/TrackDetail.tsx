import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTrackWithContent } from '@/lib/supabase-helpers';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

const TrackDetail = () => {
  const { trackId } = useParams<{ trackId: string }>();
  const { currentLanguage } = useLanguage();
  const { playTrack, currentTrack, isPlaying, pauseTrack } = useAudioPlayer();

  const { data: trackData, isLoading } = useQuery({
    queryKey: ['track', trackId, currentLanguage?.id],
    queryFn: () => {
      if (!trackId || !currentLanguage) return null;
      return getTrackWithContent(parseInt(trackId), currentLanguage.id);
    },
    enabled: !!trackId && !!currentLanguage,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-lg">Cargando...</div>
        </div>
      </Layout>
    );
  }

  if (!trackData) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Track no encontrado</h1>
            <p className="text-muted-foreground">El track solicitado no existe o no está disponible.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const trackContent = trackData.track_contents?.[0];
  const isCurrentTrack = currentTrack?.id === trackData.id;

  const handlePlayPause = () => {
    if (isCurrentTrack && isPlaying) {
      pauseTrack();
    } else {
      playTrack(trackData);
    }
  };

  return (
    <Layout showAudioPlayer={true}>
      {/* Hero Section */}
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
                onClick={handlePlayPause}
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
        </div>
      </section>

      {/* Content Section */}
      {trackContent?.long_text_content && (
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none text-foreground">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: trackContent.long_text_content
                }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Quotes Section */}
      {trackData.track_quotes && trackData.track_quotes.length > 0 && (
        <section className="py-16 px-4 bg-muted/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Testimonios</h2>
            <div className="grid gap-8">
              {trackData.track_quotes.map((quote, index) => (
                <blockquote key={index} className="bg-card p-8 rounded-lg shadow-lg">
                  <p className="text-lg italic mb-4">"{quote.quote_text}"</p>
                  <footer className="text-right">
                    <cite className="font-semibold">{quote.author_name}</cite>
                    {quote.author_role && (
                      <span className="text-muted-foreground block">{quote.author_role}</span>
                    )}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Videos Section */}
      {trackData.videos && trackData.videos.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Videos</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {trackData.videos.map((video) => (
                <div key={video.id} className="bg-card rounded-lg overflow-hidden shadow-lg">
                  {video.vimeo_url && (
                    <div className="aspect-video">
                      <iframe
                        src={video.vimeo_url}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">
                      {video.video_contents?.[0]?.title || `Video ${video.order_position}`}
                    </h3>
                    <p className="text-muted-foreground">
                      {video.video_contents?.[0]?.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default TrackDetail;