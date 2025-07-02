import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import AudioPlayer from '@/components/audio/AudioPlayer';
import { useLanguage } from '@/contexts/LanguageContext';
import { getPageBySlug, getTracks } from '@/lib/supabase-helpers';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

const RecorreLaHuella = () => {
  const { currentLanguage } = useLanguage();
  const { playTrack, currentTrack, isPlaying, pauseTrack, setTracks } = useAudioPlayer();
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  const { data: pageData, isLoading: pageLoading } = useQuery({
    queryKey: ['page', 'recorre-la-huella', currentLanguage?.id],
    queryFn: () => currentLanguage ? getPageBySlug('recorre-la-huella', currentLanguage.id) : null,
    enabled: !!currentLanguage,
  });

  const { data: tracks = [], isLoading: tracksLoading } = useQuery({
    queryKey: ['tracks', currentLanguage?.id],
    queryFn: () => currentLanguage ? getTracks(currentLanguage.id) : [],
    enabled: !!currentLanguage,
  });

  // Set tracks in audio player context when loaded
  useEffect(() => {
    if (tracks.length > 0) {
      setTracks(tracks);
      if (!selectedTrack) {
        setSelectedTrack(tracks[0]);
      }
    }
  }, [tracks, setTracks, selectedTrack]);

  if (pageLoading || tracksLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-lg">Cargando...</div>
        </div>
      </Layout>
    );
  }

  const handleTrackSelect = (track) => {
    setSelectedTrack(track);
    // Also set it as the current track in the audio player
    playTrack(track);
  };

  const getCurrentTrackContent = () => {
    const track = selectedTrack || tracks[0];
    return track?.track_contents?.[0];
  };

  const currentTrackContent = getCurrentTrackContent();

  return (
    <Layout showAudioPlayer={false}>
      {/* Audio Player Section */}
      <section className="relative z-20 bg-background border-b border-border shadow-lg">
        <div className="container mx-auto px-4 py-4">
          {selectedTrack ? <AudioPlayer /> : (
            <div className="text-center text-muted-foreground py-4">
              Selecciona un track para reproducir
            </div>
          )}
        </div>
      </section>

      {/* Track Menu */}
      <section className="relative z-10 bg-card/95 backdrop-blur-xl">
        <div className="container-wide py-4">
          <div className="flex items-center justify-center space-x-6 flex-wrap">
            <span className="text-muted-foreground text-sm font-medium mr-2">Tracks:</span>
            {tracks.map((track) => (
              <button
                key={track.id}
                onClick={() => handleTrackSelect(track)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                  selectedTrack?.id === track.id 
                    ? 'bg-primary text-primary-foreground shadow-lg scale-110' 
                    : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80 hover:text-foreground hover:scale-105'
                }`}
              >
                {track.order_position}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Hero Section - Changes based on selected track */}
      <section 
        className="relative h-[50vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: currentTrackContent?.hero_image_url 
            ? `url(${currentTrackContent.hero_image_url})`
            : 'url(https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f)'
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
            {currentTrackContent?.title || 'Recorre la Huella'}
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto animate-fade-in opacity-90">
            Sumérgete en un recorrido interactivo por los diferentes tracks que 
            componen este álbum musical.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="w-full max-w-[60%] mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-foreground">
              {currentTrackContent?.menu_title || 'Sobre este Track'}
            </h2>
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-border/30">
              <div 
                className="prose prose-lg max-w-none text-foreground mb-8"
                dangerouslySetInnerHTML={{ 
                  __html: currentTrackContent?.long_text_content || `
                    <p>Explora la profundidad musical y emocional de este track. Cada pieza ha sido cuidadosamente 
                    crafted para transportarte a través de una experiencia única que refleja la esencia de 
                    "La Huella de las Cuerdas".</p>
                    
                    <p>El contenido de esta sección cambia dinámicamente según el track seleccionado, 
                    proporcionando información contextual y detallada sobre cada composición musical.</p>
                  `
                }}
              />
              
              {/* Featured Images Section */}
              <div className="mt-8 pt-8 border-t border-border/30">
                <h3 className="text-xl font-semibold mb-6 text-foreground">Imágenes Destacadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div 
                    className="group cursor-pointer overflow-hidden rounded-lg border border-border/30 hover:border-primary/50 transition-all duration-300"
                    onClick={() => setLightboxImage('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800')}
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop" 
                      alt="Imagen destacada 1"
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div 
                    className="group cursor-pointer overflow-hidden rounded-lg border border-border/30 hover:border-primary/50 transition-all duration-300"
                    onClick={() => setLightboxImage('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800')}
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=300&fit=crop" 
                      alt="Imagen destacada 2"
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={lightboxImage} 
              alt="Imagen ampliada"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default RecorreLaHuella;