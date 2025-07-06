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
  const ctaSettings = trackData.track_cta_settings?.[0];
  const isCurrentTrack = currentTrack?.id === trackData.id;

  const handlePlayPause = () => {
    if (isCurrentTrack && isPlaying) {
      pauseTrack();
    } else {
      playTrack(trackData);
    }
  };

  // Get CTA labels based on language
  const getCtaLabel = (type: 'texts' | 'videos' | 'photos') => {
    if (!ctaSettings) return '';
    const langCode = currentLanguage?.code?.toLowerCase();
    
    switch (type) {
      case 'texts':
        return langCode === 'en' ? ctaSettings.texts_label_en : ctaSettings.texts_label_es;
      case 'videos':
        return langCode === 'en' ? ctaSettings.videos_label_en : ctaSettings.videos_label_es;
      case 'photos':
        return langCode === 'en' ? ctaSettings.photos_label_en : ctaSettings.photos_label_es;
      default:
        return '';
    }
  };

  // Function to process text content for better paragraph handling and HTML support
  const processTextContent = (content: string) => {
    if (!content) return '';
    
    // Si el contenido contiene etiquetas HTML, procesarlo directamente
    if (content.includes('<') && content.includes('>')) {
      let processedContent = content
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Normalizar etiquetas <br>
        .replace(/<br\s*\/?>/gi, '<br>')
        // Limpiar párrafos vacíos
        .replace(/<p>\s*<\/p>/gi, '')
        .trim();
      
      // Si no hay párrafos pero hay contenido, crear párrafos
      if (!processedContent.includes('<p>') && processedContent.length > 0) {
        const parts = processedContent.split('<br>');
        processedContent = parts
          .map(part => part.trim())
          .filter(part => part.length > 0)
          .map(part => `<p>${part}</p>`)
          .join('');
      }
      
      return processedContent;
    }
    
    // Procesamiento para texto plano
    const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const paragraphs = normalizedContent
      .split(/\n\s*\n+/)
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0);
    
    return paragraphs
      .map(paragraph => {
        const paragraphWithBreaks = paragraph.replace(/\n/g, '<br>');
        return `<p>${paragraphWithBreaks}</p>`;
      })
      .join('');
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

          {/* CTA Buttons Section - Only show if CTA settings allow it */}
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

      {/* Content Section - Only show if CTA settings allow it */}
      {ctaSettings?.show_texts && trackContent?.long_text_content && (
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-border/30">
                <div 
                  className="text-content-formatted text-foreground"
                  dangerouslySetInnerHTML={{ 
                    __html: processTextContent(trackContent.long_text_content)
                  }}
                />
              </div>
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

      {/* Videos Section - Only show if CTA settings allow it */}
      {ctaSettings?.show_videos && trackData.videos && trackData.videos.length > 0 && (
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

      {/* Photos Section - Only show if CTA settings allow it */}
      {ctaSettings?.show_photos && trackData.track_featured_images && trackData.track_featured_images.length > 0 && (
        <section className="py-16 px-4 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Galería</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trackData.track_featured_images.map((image, index) => (
                <div key={index} className="bg-card rounded-lg overflow-hidden shadow-lg">
                  {image.image_url && (
                    <img
                      src={image.image_url}
                      alt={currentLanguage?.code === 'en' ? image.caption_en : image.caption_es}
                      className="w-full h-64 object-cover"
                    />
                  )}
                  {(image.caption_es || image.caption_en) && (
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground">
                        {currentLanguage?.code === 'en' ? image.caption_en : image.caption_es}
                      </p>
                    </div>
                  )}
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
